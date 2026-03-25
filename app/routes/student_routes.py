"""
Student Routes - Loop 1 & 2: Student Management
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Student, Mentor

def register_routes(api_bp):

    @api_bp.route('/students', methods=['GET'])
    @jwt_required()
    def get_all_students():
        """Get all students with optional filtering"""
        try:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 20, type=int)
            at_risk = request.args.get('at_risk', type=lambda x: x.lower() == 'true')
            risk_level = request.args.get('risk_level')

            query = Student.query
            if at_risk:
                query = query.filter_by(at_risk=True)
            if risk_level:
                query = query.filter_by(risk_level=risk_level)

            pagination = query.paginate(page=page, per_page=per_page)
            return jsonify({
                'students': [s.to_dict() for s in pagination.items],
                'total': pagination.total, 'pages': pagination.pages, 'current_page': page
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api_bp.route('/students/<int:student_id>', methods=['GET'])
    @jwt_required()
    def get_student(student_id):
        """Get specific student"""
        try:
            student = Student.query.get(student_id)
            if not student:
                return jsonify({'error': 'Student not found'}), 404

            data = student.to_dict()
            data['interactions_count'] = len(student.interactions)
            data['meetings_count'] = len(student.meetings)
            data['active_alerts'] = len([a for a in student.alerts if a.status == 'active'])
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api_bp.route('/students', methods=['POST'])
    @jwt_required()
    def create_student():
        """Create new student"""
        try:
            data = request.get_json()
            if not all(k in data for k in ['name', 'email', 'student_id']):
                return jsonify({'error': 'Missing required fields'}), 400

            if Student.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already exists'}), 409
            if Student.query.filter_by(student_id=data['student_id']).first():
                return jsonify({'error': 'Student ID already exists'}), 409

            student = Student(
                name=data['name'], email=data['email'], student_id=data['student_id'],
                grade=data.get('grade'), major=data.get('major'),
                gpa=data.get('gpa'), attendance_rate=data.get('attendance_rate', 0.0)
            )
            db.session.add(student)
            db.session.commit()
            return jsonify({'message': 'Student created', 'student': student.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api_bp.route('/students/<int:student_id>', methods=['PUT'])
    @jwt_required()
    def update_student(student_id):
        """Update student"""
        try:
            student = Student.query.get(student_id)
            if not student:
                return jsonify({'error': 'Student not found'}), 404

            data = request.get_json()
            for field in ['name', 'grade', 'major', 'gpa', 'attendance_rate']:
                if field in data:
                    setattr(student, field, data[field])

            db.session.commit()
            return jsonify({'message': 'Student updated', 'student': student.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api_bp.route('/students/at-risk', methods=['GET'])
    @jwt_required()
    def get_at_risk_students():
        """Get all at-risk students"""
        try:
            students = Student.query.filter_by(at_risk=True).all()
            return jsonify({'at_risk_count': len(students), 'students': [s.to_dict() for s in students]}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
