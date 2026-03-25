"""
Authentication Routes - Mentor Login
"""
from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import Mentor

def register_routes(auth_bp):

    @auth_bp.route('/mentor/register', methods=['POST'])
    def register_mentor():
        """Register new mentor"""
        try:
            data = request.get_json()
            if not data or not all(k in data for k in ['username', 'email', 'password', 'name']):
                return jsonify({'error': 'Missing required fields'}), 400

            if Mentor.query.filter_by(username=data['username']).first():
                return jsonify({'error': 'Username already exists'}), 409
            if Mentor.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already exists'}), 409

            mentor = Mentor(
                username=data['username'], email=data['email'],
                password_hash=generate_password_hash(data['password']),
                name=data['name'], role=data.get('role', 'mentor')
            )
            db.session.add(mentor)
            db.session.commit()
            return jsonify({'message': 'Mentor registered', 'mentor': mentor.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @auth_bp.route('/mentor/login', methods=['POST'])
    def mentor_login():
        """Mentor login"""
        try:
            data = request.get_json()
            if not data or not all(k in data for k in ['username', 'password']):
                return jsonify({'error': 'Missing username or password'}), 400

            mentor = Mentor.query.filter_by(username=data['username']).first()
            if not mentor or not check_password_hash(mentor.password_hash, data['password']):
                return jsonify({'error': 'Invalid credentials'}), 401
            if not mentor.is_active:
                return jsonify({'error': 'Account inactive'}), 403

            token = create_access_token(identity=mentor.id)
            return jsonify({'message': 'Login successful', 'access_token': token, 'mentor': mentor.to_dict()}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @auth_bp.route('/mentor/me', methods=['GET'])
    @jwt_required()
    def get_current_mentor():
        """Get current mentor"""
        try:
            mentor = Mentor.query.get(get_jwt_identity())
            if not mentor:
                return jsonify({'error': 'Mentor not found'}), 404
            return jsonify(mentor.to_dict()), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @auth_bp.route('/mentor/logout', methods=['POST'])
    @jwt_required()
    def mentor_logout():
        return jsonify({'message': 'Logout successful'}), 200
