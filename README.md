# Student Tracking & Mentorship System - Backend API

Flask REST API for tracking student performance, managing mentorship, and generating forecasts.

## System Loops

- **Loop 1**: Data In - CSV upload, column mapping, deduplication
- **Loop 2**: Track + Forecast - Record interactions, compute scores, generate 5-10 year trajectory
- **Loop 3**: Alert + Meet + Record - Score drop alerts, meeting scheduling, recording/transcription

## Quick Setup

```bash
# 1. Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows
source venv/bin/activate       # Mac/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# 4. Run server
flask run
```

## API Endpoints

### Authentication
- `POST /api/auth/mentor/register` - Register mentor
- `POST /api/auth/mentor/login` - Login
- `GET /api/auth/mentor/me` - Get current mentor

### Students (Loop 1 & 2)
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `GET /api/students/<id>` - Get student
- `GET /api/students/at-risk` - Get at-risk students

### CSV Upload (Loop 1)
- `POST /api/upload/csv` - Upload CSV file
- `GET /api/upload/history` - Upload history
- `POST /api/upload/simulate` - Create sample data

### Tracking & Forecast (Loop 2)
- `POST /api/students/<id>/interactions` - Record interaction
- `GET /api/students/<id>/score` - Get performance score
- `GET /api/students/<id>/forecast` - Get 5-10 year trajectory

### Meetings & Alerts (Loop 3)
- `GET /api/students/<id>/alerts` - Get alerts
- `POST /api/students/<id>/alerts` - Create alert
- `PUT /api/alerts/<id>/resolve` - Resolve alert
- `POST /api/students/<id>/meetings` - Schedule meeting
- `PUT /api/meetings/<id>` - Complete meeting with transcript
- `POST /api/check-alerts` - Check all students for score drops

## Example Commands

```bash
# Register mentor
curl -X POST http://localhost:5000/api/auth/mentor/register \
  -H "Content-Type: application/json" \
  -d '{"username":"mentor1","email":"m@school.edu","password":"pass123","name":"Mentor"}'

# Login
curl -X POST http://localhost:5000/api/auth/mentor/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mentor1","password":"pass123"}'

# Create student (with token)
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@school.edu","student_id":"SID001","grade":"10"}'

# Record interaction
curl -X POST http://localhost:5000/api/students/1/interactions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"interaction_type":"test","score":85,"notes":"Math exam"}'

# Get forecast
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/students/1/forecast
```

## Testing
```bash
pytest -v
```
