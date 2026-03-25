import json
import os
import tempfile
from datetime import date
from typing import Any
from urllib.parse import urlparse

from anthropic import Anthropic
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fuzzywuzzy import fuzz
from openai import OpenAI
from pydantic import BaseModel, Field
import requests


app = FastAPI(title="AI Microservice", version="1.0.0")


CLAUDE_TIMEOUT_SECONDS = 20.0
WHISPER_TIMEOUT_SECONDS = 30.0
FORECAST_CACHE: dict[str, dict[str, Any]] = {}


class MapColumnsRequest(BaseModel):
    csv_headers: list[str] = Field(..., min_length=1)
    schema_fields: list[str] = Field(..., min_length=1)


class MapColumnsResponse(BaseModel):
    mapping: dict[str, str]
    confidence: dict[str, float]


class Student(BaseModel):
    name: str
    dob: date
    district: str


class MatchStudentRequest(BaseModel):
    student_a: Student
    student_b: Student


class MatchStudentResponse(BaseModel):
    total_match_percentage: float
    status: str


class ForecastRequest(BaseModel):
    student_data: dict[str, Any]
    historical_outcomes: list[dict[str, Any]] = Field(..., min_length=1)


class ForecastResponse(BaseModel):
    likely_educational_path: str
    probability_of_degree_completion: float = Field(..., ge=0, le=100)
    estimated_career_outcome: str
    top_3_risk_factors: list[str] = Field(..., min_length=3, max_length=3)


class ExplainAlertRequest(BaseModel):
    recent_interactions: list[str | dict[str, Any]] = Field(..., min_length=1)
    score_history: list[float] = Field(..., min_length=1)


class ExplainAlertResponse(BaseModel):
    explanation: str
    suggested_action: str


class TranscribeMeetingRequest(BaseModel):
    meeting_id: int | str
    recording_url: str = Field(..., min_length=1)


class MeetingActionItem(BaseModel):
    owner: str
    deadline: str


class MeetingSummary(BaseModel):
    summary: str
    key_concerns: list[str]
    action_items: list[MeetingActionItem]
    student_mood: str


class TranscribeMeetingResponse(BaseModel):
    meeting_id: int | str
    raw_transcript: str
    summary_json: MeetingSummary


def _extract_json_payload(raw_text: str) -> Any:
    """Best-effort JSON extraction from model output."""
    text = raw_text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1 or start >= end:
            raise
        return json.loads(text[start : end + 1])


def _normalize_confidence(value: Any, header: str, mapped_field: str) -> float:
    if value is None:
        return float(fuzz.token_set_ratio(header, mapped_field))

    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return float(fuzz.token_set_ratio(header, mapped_field))

    if numeric <= 1.0:
        numeric *= 100.0
    return max(0.0, min(100.0, numeric))


def _best_schema_field(candidate: str, schema_fields: list[str]) -> str:
    if candidate in schema_fields:
        return candidate
    return max(schema_fields, key=lambda field: fuzz.ratio(candidate.lower(), field.lower()))


def _normalize_mapping_output(
    payload: Any, csv_headers: list[str], schema_fields: list[str]
) -> tuple[dict[str, str], dict[str, float]]:
    mapping: dict[str, str] = {}
    confidence: dict[str, float] = {}

    if not isinstance(payload, dict):
        raise ValueError("Model output is not a JSON object.")

    candidate_mapping = payload.get("mapping") or payload.get("mappings") or payload
    candidate_confidence = payload.get("confidence", {})

    if not isinstance(candidate_mapping, dict):
        raise ValueError("Mapping payload must be a JSON object.")

    lowered_keys = {str(k).lower(): k for k in candidate_mapping.keys()}

    for header in csv_headers:
        chosen_key = lowered_keys.get(header.lower(), header)
        value = candidate_mapping.get(chosen_key)

        mapped_field: str
        conf_value: Any = None

        if isinstance(value, dict):
            mapped_field = str(value.get("db_field") or value.get("field") or "").strip()
            conf_value = value.get("confidence")
        else:
            mapped_field = str(value or "").strip()
            if isinstance(candidate_confidence, dict):
                conf_value = candidate_confidence.get(header)

        if not mapped_field:
            raise ValueError(f"Missing mapping for CSV header: {header}")

        mapped_field = _best_schema_field(mapped_field, schema_fields)
        mapping[header] = mapped_field
        confidence[header] = _normalize_confidence(conf_value, header, mapped_field)

    return mapping, confidence


def _parse_probability(value: Any) -> float:
    if isinstance(value, str):
        cleaned = value.strip().replace("%", "")
    else:
        cleaned = value
    numeric = float(cleaned)
    if numeric <= 1.0:
        numeric *= 100.0
    return max(0.0, min(100.0, numeric))


def _normalize_forecast_output(payload: Any) -> ForecastResponse:
    if not isinstance(payload, dict):
        raise ValueError("Forecast output is not a JSON object.")

    likely_educational_path = str(payload.get("likely_educational_path", "")).strip()
    estimated_career_outcome = str(payload.get("estimated_career_outcome", "")).strip()
    top_3_risk_factors = payload.get("top_3_risk_factors")

    probability_raw = payload.get("probability_of_degree_completion")
    probability_of_degree_completion = _parse_probability(probability_raw)

    if not likely_educational_path:
        raise ValueError("Missing likely_educational_path.")
    if not estimated_career_outcome:
        raise ValueError("Missing estimated_career_outcome.")
    if not isinstance(top_3_risk_factors, list):
        raise ValueError("top_3_risk_factors must be a list.")

    risk_factors = [str(item).strip() for item in top_3_risk_factors if str(item).strip()]
    if len(risk_factors) != 3:
        raise ValueError("top_3_risk_factors must contain exactly 3 items.")

    return ForecastResponse(
        likely_educational_path=likely_educational_path,
        probability_of_degree_completion=probability_of_degree_completion,
        estimated_career_outcome=estimated_career_outcome,
        top_3_risk_factors=risk_factors,
    )


def _normalize_explain_alert_output(payload: Any) -> ExplainAlertResponse:
    if not isinstance(payload, dict):
        raise ValueError("Explain-alert output is not a JSON object.")

    explanation = str(payload.get("explanation", "")).strip()
    suggested_action = str(payload.get("suggested_action", "")).strip()

    if not explanation:
        raise ValueError("Missing explanation.")
    if not suggested_action:
        raise ValueError("Missing suggested_action.")

    return ExplainAlertResponse(
        explanation=explanation,
        suggested_action=suggested_action,
    )


def _download_recording(recording_url: str) -> str:
    parsed = urlparse(recording_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(status_code=400, detail="recording_url must be a valid HTTP/HTTPS URL.")

    suffix = os.path.splitext(parsed.path)[1] or ".bin"
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_path = temp_file.name

    max_bytes = 100 * 1024 * 1024
    total_bytes = 0

    try:
        with requests.get(recording_url, stream=True, timeout=(10, 30)) as response:
            response.raise_for_status()
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if not chunk:
                    continue
                total_bytes += len(chunk)
                if total_bytes > max_bytes:
                    raise HTTPException(
                        status_code=413,
                        detail="Recording file is too large for transcription.",
                    )
                temp_file.write(chunk)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to download recording: {exc}") from exc
    finally:
        temp_file.close()

    if total_bytes == 0:
        raise HTTPException(status_code=422, detail="Recording appears empty or unreadable.")

    return temp_path


def _transcribe_with_whisper(audio_file_path: str) -> str:
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not set.")

    client = OpenAI(api_key=openai_api_key, timeout=WHISPER_TIMEOUT_SECONDS)

    try:
        with open(audio_file_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
            )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Whisper transcription failed: {exc}") from exc

    raw_transcript = str(getattr(transcription, "text", "")).strip()
    word_count = len(raw_transcript.split())

    if not raw_transcript:
        raise HTTPException(
            status_code=422,
            detail="No speech could be transcribed from the recording (possible poor audio quality).",
        )

    if word_count < 15:
        raise HTTPException(
            status_code=422,
            detail="Meeting is too short for meaningful summarization.",
        )

    lowered = raw_transcript.lower()
    inaudible_hits = lowered.count("[inaudible]") + lowered.count("inaudible")
    if word_count > 0 and (inaudible_hits / max(word_count, 1)) > 0.1:
        raise HTTPException(
            status_code=422,
            detail="Transcript quality is too low (many inaudible segments).",
        )

    return raw_transcript


def _normalize_meeting_summary_output(payload: Any) -> MeetingSummary:
    if not isinstance(payload, dict):
        raise ValueError("Meeting summary output is not a JSON object.")

    summary_obj = MeetingSummary.model_validate(payload)
    if len(summary_obj.student_mood.split()) != 1:
        raise ValueError("student_mood must be a 1-word assessment.")

    return summary_obj


def _summarize_meeting_with_claude(raw_transcript: str) -> MeetingSummary:
    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
    if not anthropic_api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY is not set.")

    client = Anthropic(api_key=anthropic_api_key, timeout=CLAUDE_TIMEOUT_SECONDS)

    user_prompt = (
        "Summarize this mentor-student meeting. Return JSON with: summary (2-3 sentences), "
        "key_concerns (array of strings), action_items (array of objects with owner and "
        "deadline), student_mood (1-word assessment)."
    )

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=450,
            temperature=0,
            system=(
                "You are given a meeting transcript below between <transcript> tags. "
                f"<transcript>{raw_transcript}</transcript> "
                "Respond with valid JSON only using this exact schema: "
                '{"summary": "string", "key_concerns": ["string"], '
                '"action_items": [{"owner": "string", "deadline": "string"}], '
                '"student_mood": "string"}. '
                "No markdown, no prose."
            ),
            messages=[{"role": "user", "content": user_prompt}],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Anthropic API call failed: {exc}") from exc

    text_blocks = [block.text for block in response.content if getattr(block, "type", "") == "text"]
    raw_text = "\n".join(text_blocks).strip()
    if not raw_text:
        raise HTTPException(status_code=502, detail="Anthropic returned an empty response.")

    try:
        payload = _extract_json_payload(raw_text)
        return _normalize_meeting_summary_output(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to parse/validate model JSON output: {exc}",
        ) from exc


def _extract_student_id_for_cache(student_data: dict[str, Any]) -> str:
    student_id = student_data.get("student_id")
    if student_id is None or str(student_id).strip() == "":
        raise HTTPException(
            status_code=400,
            detail="student_data.student_id is required for forecast caching.",
        )
    return str(student_id).strip()


def _ai_unavailable_fallback() -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={
            "error": "AI service temporarily unavailable. Using cached or fallback data."
        },
    )


@app.post("/api/ai/map-columns", response_model=MapColumnsResponse)
def map_columns(request: MapColumnsRequest) -> MapColumnsResponse:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY is not set.")

    client = Anthropic(api_key=api_key)

    # Keep the user prompt exactly as requested.
    user_prompt = (
        f"Here is our database schema {request.schema_fields}. "
        f"Here are the CSV headers {request.csv_headers}. "
        "Map each header to the correct field. Return JSON."
    )

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            temperature=0,
            system=(
                "You must respond with valid JSON only. "
                "Return this exact JSON shape: "
                '{"mapping": {"csv_column": "db_field"}, "confidence": {"csv_column": 0-100}}. '
                "No markdown, no prose."
            ),
            messages=[{"role": "user", "content": user_prompt}],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Anthropic API call failed: {exc}") from exc

    text_blocks = [block.text for block in response.content if getattr(block, "type", "") == "text"]
    raw_text = "\n".join(text_blocks).strip()

    if not raw_text:
        raise HTTPException(status_code=502, detail="Anthropic returned an empty response.")

    try:
        payload = _extract_json_payload(raw_text)
        mapping, confidence = _normalize_mapping_output(
            payload=payload,
            csv_headers=request.csv_headers,
            schema_fields=request.schema_fields,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to parse/validate model JSON output: {exc}",
        ) from exc

    return MapColumnsResponse(mapping=mapping, confidence=confidence)


@app.post("/api/ai/match-student", response_model=MatchStudentResponse)
def match_student(request: MatchStudentRequest) -> MatchStudentResponse:
    name_score = float(
        fuzz.token_set_ratio(request.student_a.name.strip(), request.student_b.name.strip())
    )
    dob_score = 100.0 if request.student_a.dob == request.student_b.dob else 0.0
    district_score = float(
        fuzz.token_set_ratio(
            request.student_a.district.strip(), request.student_b.district.strip()
        )
    )

    total_score = (name_score * 0.50) + (dob_score * 0.40) + (district_score * 0.10)

    if total_score > 90:
        status = "auto-merge"
    elif 60 <= total_score <= 90:
        status = "flag for review"
    else:
        status = "new record"

    return MatchStudentResponse(
        total_match_percentage=round(total_score, 2),
        status=status,
    )


@app.post("/api/ai/forecast", response_model=ForecastResponse)
def forecast(request: ForecastRequest) -> ForecastResponse:
    student_id = _extract_student_id_for_cache(request.student_data)
    cached = FORECAST_CACHE.get(student_id)
    if cached:
        return ForecastResponse.model_validate(cached)

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return _ai_unavailable_fallback()

    client = Anthropic(api_key=api_key, timeout=CLAUDE_TIMEOUT_SECONDS)

    user_prompt = (
        "Given this student's profile "
        f"{request.student_data} "
        "and these historical outcomes of similar students "
        f"{request.historical_outcomes}, "
        "predict: (1) likely educational path, (2) probability of degree completion, "
        "(3) estimated career outcome, (4) top 3 risk factors. Return structured JSON."
    )

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=320,
            temperature=0,
            system=(
                "Respond with valid JSON only. "
                "Use this exact schema: "
                '{"likely_educational_path": "string", '
                '"probability_of_degree_completion": 0-100, '
                '"estimated_career_outcome": "string", '
                '"top_3_risk_factors": ["string", "string", "string"]}. '
                "No markdown, no prose."
            ),
            messages=[{"role": "user", "content": user_prompt}],
        )
    except Exception as exc:
        return _ai_unavailable_fallback()

    text_blocks = [block.text for block in response.content if getattr(block, "type", "") == "text"]
    raw_text = "\n".join(text_blocks).strip()

    if not raw_text:
        return _ai_unavailable_fallback()

    try:
        payload = _extract_json_payload(raw_text)
        normalized = _normalize_forecast_output(payload)
        FORECAST_CACHE[student_id] = normalized.model_dump()
        return normalized
    except Exception as exc:
        return _ai_unavailable_fallback()


@app.post("/api/ai/explain-alert", response_model=ExplainAlertResponse)
def explain_alert(request: ExplainAlertRequest) -> ExplainAlertResponse:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return _ai_unavailable_fallback()

    client = Anthropic(api_key=api_key, timeout=CLAUDE_TIMEOUT_SECONDS)

    user_prompt = (
        "Analyze these recent interactions "
        f"{request.recent_interactions} "
        "and the score history "
        f"{request.score_history}. "
        "Provide a 2-sentence explanation of why the student might be at risk, "
        "and 1 suggested action for the mentor to take."
    )

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=220,
            temperature=0,
            system=(
                "Respond with valid JSON only using this exact schema: "
                '{"explanation": "string", "suggested_action": "string"}. '
                "The explanation must be exactly 2 sentences. No markdown, no prose."
            ),
            messages=[{"role": "user", "content": user_prompt}],
        )
    except Exception as exc:
        return _ai_unavailable_fallback()

    text_blocks = [block.text for block in response.content if getattr(block, "type", "") == "text"]
    raw_text = "\n".join(text_blocks).strip()

    if not raw_text:
        return _ai_unavailable_fallback()

    try:
        payload = _extract_json_payload(raw_text)
        return _normalize_explain_alert_output(payload)
    except Exception as exc:
        return _ai_unavailable_fallback()


@app.post("/api/ai/transcribe-meeting", response_model=TranscribeMeetingResponse)
def transcribe_meeting(request: TranscribeMeetingRequest) -> TranscribeMeetingResponse:
    try:
        audio_file_path = _download_recording(request.recording_url)
    except HTTPException as exc:
        # Download issues are surfaced directly because they are request/content problems.
        raise exc

    try:
        raw_transcript = _transcribe_with_whisper(audio_file_path)
    except HTTPException as exc:
        if exc.status_code in {500, 502, 503}:
            return JSONResponse(
                status_code=503,
                content={
                    "error": "Speech-to-text service down. Please allow manual transcript paste."
                },
            )
        raise exc
    except Exception:
        return JSONResponse(
            status_code=503,
            content={
                "error": "Speech-to-text service down. Please allow manual transcript paste."
            },
        )
    finally:
        try:
            os.remove(audio_file_path)
        except OSError:
            pass

    try:
        summary_json = _summarize_meeting_with_claude(raw_transcript)
    except HTTPException:
        return _ai_unavailable_fallback()
    except Exception:
        return _ai_unavailable_fallback()

    return TranscribeMeetingResponse(
        meeting_id=request.meeting_id,
        raw_transcript=raw_transcript,
        summary_json=summary_json,
    )
