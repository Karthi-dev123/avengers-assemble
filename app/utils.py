"""
Utility functions and helpers
"""
from flask import jsonify
from functools import wraps
from flask_jwt_extended import get_jwt_identity
from app.models import Mentor

def admin_required(fn):
    """Decorator to require admin privileges"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        mentor_id = get_jwt_identity()
        mentor = Mentor.query.get(mentor_id)
        if not mentor or mentor.role not in ['admin', 'coordinator']:
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

def handle_errors(fn):
    """Decorator for common error handling"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            return fn(*args, **kwargs)
        except ValueError as e:
            return jsonify({'error': f'Invalid value: {str(e)}'}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return wrapper
