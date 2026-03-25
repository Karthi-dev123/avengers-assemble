"""
Data Upload Routes - Loop 1: CSV Upload
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
import csv
import os
from app import db
from app.models import Student, DataUpload

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def register_routes(api_bp):

    @api_bp.route('/upload/csv', methods=['POST'])
    @jwt_required()
    def upload_csv():
        """Upload and process CSV file"""
        try:
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400

            file = request.files['file']
            if file.filename == '' or not allowed_file(file.filename):
                return jsonify({'error': 'Invalid file'}), 400

            if not os.path.exists(UPLOAD_FOLDER):
                os.makedirs(UPLOAD_FOLDER)

            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)

            rows_processed, rows_duplicated, rows_errors = 0, 0, 0
            errors = []

            with open(filepath, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row_num, row in enumerate(reader, start=2):
                    try:
                        name = row.get('name') or row.get('Name')
                        email = row.get('email') or row.get('Email')
                        sid = row.get('student_id') or row.get('ID')

                        if not all([name, email, sid]):
                            rows_errors += 1
                            continue

                        if Student.query.filter_by(email=email).first() or Student.query.filter_by(student_id=sid).first():
                            rows_duplicated += 1
                            continue

                        student = Student(
                            name=name, email=email, student_id=sid,
                            grade=row.get('grade') or row.get('Grade'),
                            major=row.get('major') or row.get('Major'),
                            gpa=float(row.get('gpa') or row.get('GPA') or 0)
                        )
                        db.session.add(student)
                        rows_processed += 1
                    except Exception as e:
                        rows_errors += 1
                        errors.append(f"Row {row_num}: {str(e)}")

            db.session.commit()

            upload = DataUpload(filename=filename, rows_processed=rows_processed,
                               rows_duplicated=rows_duplicated, rows_errors=rows_errors)
            db.session.add(upload)
            db.session.commit()

            return jsonify({
                'message': 'CSV processed', 'upload_id': upload.id,
                'rows_processed': rows_processed, 'rows_duplicated': rows_duplicated,
                'rows_errors': rows_errors, 'errors': errors[:10]
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api_bp.route('/upload/history', methods=['GET'])
    @jwt_required()
    def upload_history():
        """Get upload history"""
        uploads = DataUpload.query.order_by(DataUpload.upload_date.desc()).all()
        return jsonify({'total': len(uploads), 'uploads': [u.to_dict() for u in uploads]}), 200

    @api_bp.route('/upload/simulate', methods=['POST'])
    @jwt_required()
    def simulate_upload():
        """Create sample student data"""
        try:
            data = request.get_json() or {}
            count = data.get('students', 5)
            created = 0

            for i in range(count):
                email = f'student{i}@school.edu'
                if not Student.query.filter_by(email=email).first():
                    student = Student(
                        name=f'Student {i}', email=email, student_id=f'SID{1000+i}',
                        grade='10', major='Science', gpa=3.5 + (i * 0.05)
                    )
                    db.session.add(student)
                    created += 1

            db.session.commit()
            return jsonify({'message': 'Sample data created', 'created': created}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
