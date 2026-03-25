"""
Routes package initialization - Student Tracking System
"""
from flask import Blueprint

api_bp = Blueprint('api', __name__, url_prefix='/api')
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

from app.routes import auth_routes, student_routes, upload_routes, tracking_routes, meeting_routes

auth_routes.register_routes(auth_bp)
student_routes.register_routes(api_bp)
upload_routes.register_routes(api_bp)
tracking_routes.register_routes(api_bp)
meeting_routes.register_routes(api_bp)
