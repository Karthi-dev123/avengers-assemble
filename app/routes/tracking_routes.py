"""
Tracking Routes - Loop 2: Performance Scoring & Forecasts
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from app import db
from app.models import Student, Interaction

def calculate_score(student):
    """Calculate performance score (0-100)"""
    interactions = Interaction.query.filter_by(student_id=student.id).all()
    if not interactions:
        return 50.0
    weights = {'test': 0.4, 'assignment': 0.3, 'attendance': 0.2, 'participation': 0.1}
    total = sum((i.score or 0) * weights.get(i.interaction_type, 0.1) for i in interactions[-10:])
    return min(100.0, max(0.0, total))

def generate_forecast(student, years=5):
    """Generate trajectory forecast"""
    interactions = Interaction.query.filter_by(student_id=student.id).order_by(Interaction.date).all()
    if len(interactions) < 2:
        return f"Insufficient data. GPA: {student.gpa or 'N/A'}"

    recent = sum(i.score or 0 for i in interactions[-5:]) / max(1, len(interactions[-5:]))
    older = sum(i.score or 0 for i in interactions[:-5]) / max(1, len(interactions[:-5])) if len(interactions) > 5 else recent
    trend = "improving" if recent > older else "declining" if recent < older else "stable"

    return f"{student.name}'s {years}-year trajectory: {trend}. Score: {student.current_score:.1f}/100."

def register_routes(api_bp):

    @api_bp.route('/students/<int:student_id>/interactions', methods=['GET'])
    @jwt_required()
    def get_interactions(student_id):
        """Get student interactions"""
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'Student not found'}), 404

        interactions = Interaction.query.filter_by(student_id=student_id).order_by(Interaction.date.desc()).all()
        return jsonify({'student_id': student_id, 'total': len(interactions),
                       'interactions': [i.to_dict() for i in interactions]}), 200

    @api_bp.route('/students/<int:student_id>/interactions', methods=['POST'])
    @jwt_required()
    def record_interaction(student_id):
        """Record new interaction"""
        try:
            student = Student.query.get(student_id)
            if not student:
                return jsonify({'error': 'Student not found'}), 404

            data = request.get_json()
            if not all(k in data for k in ['interaction_type', 'score']):
                return jsonify({'error': 'Missing required fields'}), 400

            interaction = Interaction(
                student_id=student_id, interaction_type=data['interaction_type'],
                score=data['score'], notes=data.get('notes'),
                date=datetime.fromisoformat(data['date']) if data.get('date') else datetime.utcnow()
            )
            db.session.add(interaction)
            student.current_score = calculate_score(student)
            db.session.commit()

            return jsonify({'message': 'Interaction recorded', 'interaction': interaction.to_dict(),
                          'updated_score': student.current_score}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api_bp.route('/students/<int:student_id>/score', methods=['GET'])
    @jwt_required()
    def get_score(student_id):
        """Get performance score"""
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'Student not found'}), 404

        score = calculate_score(student)
        student.current_score = score
        db.session.commit()

        recent = Interaction.query.filter_by(student_id=student_id).order_by(Interaction.date.desc()).limit(10).all()
        return jsonify({'student_id': student_id, 'current_score': score, 'gpa': student.gpa,
                       'attendance_rate': student.attendance_rate,
                       'recent_interactions': [i.to_dict() for i in recent]}), 200

    @api_bp.route('/students/<int:student_id>/forecast', methods=['GET'])
    @jwt_required()
    def get_forecast(student_id):
        """Get 5-10 year trajectory forecast"""
        try:
            student = Student.query.get(student_id)
            if not student:
                return jsonify({'error': 'Student not found'}), 404

            student.forecast_5yr = generate_forecast(student, 5)
            student.forecast_10yr = generate_forecast(student, 10)
            db.session.commit()

            return jsonify({
                'student_id': student_id, 'student_name': student.name,
                'current_score': student.current_score,
                'forecast_5yr': student.forecast_5yr, 'forecast_10yr': student.forecast_10yr,
                'generated_at': datetime.utcnow().isoformat()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
