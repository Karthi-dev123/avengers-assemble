"""
Meeting & Alert Routes - Loop 3: Alerts, Meetings, Recordings
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import Student, Meeting, Alert, Interaction

def check_score_drop(student, threshold=0.15):
    """Check if score dropped significantly"""
    interactions = Interaction.query.filter_by(student_id=student.id).order_by(Interaction.date.desc()).limit(20).all()
    if len(interactions) < 2:
        return False
    recent = sum(i.score or 0 for i in interactions[:5]) / max(1, min(5, len(interactions)))
    older = sum(i.score or 0 for i in interactions[5:]) / max(1, len(interactions[5:]))
    return (older - recent) / max(0.1, older) >= threshold

def register_routes(api_bp):

    @api_bp.route('/students/<int:student_id>/alerts', methods=['GET'])
    @jwt_required()
    def get_alerts(student_id):
        """Get student alerts"""
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'Student not found'}), 404

        alerts = Alert.query.filter_by(student_id=student_id).order_by(Alert.created_at.desc()).all()
        active = [a for a in alerts if a.status == 'active']
        return jsonify({'student_id': student_id, 'active_count': len(active),
                       'total': len(alerts), 'alerts': [a.to_dict() for a in alerts]}), 200

    @api_bp.route('/students/<int:student_id>/alerts', methods=['POST'])
    @jwt_required()
    def create_alert(student_id):
        """Create alert for student"""
        try:
            student = Student.query.get(student_id)
            if not student:
                return jsonify({'error': 'Student not found'}), 404

            data = request.get_json()
            alert = Alert(student_id=student_id, severity=data.get('severity', 'warning'),
                         trigger_reason=data.get('trigger_reason'), status='active')

            student.at_risk = True
            student.risk_level = data.get('severity', 'warning')
            student.last_alert_date = datetime.utcnow()

            db.session.add(alert)
            db.session.commit()
            return jsonify({'message': 'Alert created', 'alert': alert.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api_bp.route('/alerts/<int:alert_id>/resolve', methods=['PUT'])
    @jwt_required()
    def resolve_alert(alert_id):
        """Resolve an alert"""
        try:
            alert = Alert.query.get(alert_id)
            if not alert:
                return jsonify({'error': 'Alert not found'}), 404

            alert.status = 'resolved'
            alert.resolved_at = datetime.utcnow()
            db.session.commit()
            return jsonify({'message': 'Alert resolved', 'alert': alert.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api_bp.route('/meetings', methods=['GET'])
    @jwt_required()
    def get_all_meetings():
        """Get all meetings"""
        page = request.args.get('page', 1, type=int)
        status = request.args.get('status')
        query = Meeting.query
        if status:
            query = query.filter_by(status=status)
        pagination = query.order_by(Meeting.scheduled_date).paginate(page=page, per_page=20)
        return jsonify({'total': pagination.total, 'meetings': [m.to_dict() for m in pagination.items]}), 200

    @api_bp.route('/students/<int:student_id>/meetings', methods=['GET'])
    @jwt_required()
    def get_student_meetings(student_id):
        """Get student meetings"""
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'Student not found'}), 404

        meetings = Meeting.query.filter_by(student_id=student_id).order_by(Meeting.scheduled_date.desc()).all()
        return jsonify({'student_id': student_id, 'total': len(meetings),
                       'meetings': [m.to_dict() for m in meetings]}), 200

    @api_bp.route('/students/<int:student_id>/meetings', methods=['POST'])
    @jwt_required()
    def schedule_meeting(student_id):
        """Schedule new meeting"""
        try:
            mentor_id = get_jwt_identity()
            student = Student.query.get(student_id)
            if not student:
                return jsonify({'error': 'Student not found'}), 404

            data = request.get_json()
            meeting = Meeting(
                student_id=student_id, mentor_id=mentor_id,
                scheduled_date=datetime.fromisoformat(data['scheduled_date']),
                duration_minutes=data.get('duration_minutes', 30), status='scheduled'
            )
            db.session.add(meeting)
            db.session.commit()
            return jsonify({'message': 'Meeting scheduled', 'meeting': meeting.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api_bp.route('/meetings/<int:meeting_id>', methods=['PUT'])
    @jwt_required()
    def update_meeting(meeting_id):
        """Complete meeting with transcript/summary"""
        try:
            meeting = Meeting.query.get(meeting_id)
            if not meeting:
                return jsonify({'error': 'Meeting not found'}), 404

            data = request.get_json()
            for field in ['status', 'duration_minutes', 'recording_path', 'transcript', 'summary', 'notes', 'action_items']:
                if field in data:
                    setattr(meeting, field, data[field])

            db.session.commit()
            return jsonify({'message': 'Meeting updated', 'meeting': meeting.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api_bp.route('/check-alerts', methods=['POST'])
    @jwt_required()
    def check_score_drops():
        """Check all students for score drops"""
        try:
            students = Student.query.all()
            alerts_created = 0

            for student in students:
                if check_score_drop(student):
                    existing = Alert.query.filter_by(student_id=student.id, status='active').first()
                    if not existing:
                        alert = Alert(student_id=student.id, severity='warning',
                                     trigger_reason='Performance score dropped', status='active')
                        student.at_risk = True
                        student.risk_level = 'warning'
                        db.session.add(alert)
                        alerts_created += 1

            db.session.commit()
            return jsonify({'message': 'Check completed', 'students_checked': len(students),
                          'alerts_created': alerts_created}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
