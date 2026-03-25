"""Test configuration and fixtures"""
import pytest
from werkzeug.security import generate_password_hash
from main import app, db
from app.models import Mentor, Student

@pytest.fixture
def app_instance():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app_instance):
    return app_instance.test_client()

@pytest.fixture
def sample_mentor(app_instance):
    with app_instance.app_context():
        mentor = Mentor(username='test_mentor', email='mentor@school.edu',
                       password_hash=generate_password_hash('password123'),
                       name='Test Mentor', role='mentor')
        db.session.add(mentor)
        db.session.commit()
        return mentor

@pytest.fixture
def sample_student(app_instance):
    with app_instance.app_context():
        student = Student(name='Alice Johnson', email='alice@school.edu',
                         student_id='SID001', grade='10', major='Science',
                         gpa=3.5, attendance_rate=92.0)
        db.session.add(student)
        db.session.commit()
        return student

@pytest.fixture
def at_risk_student(app_instance):
    with app_instance.app_context():
        student = Student(name='Bob Smith', email='bob@school.edu',
                         student_id='SID002', grade='11', major='Arts',
                         gpa=2.1, attendance_rate=65.0, at_risk=True, risk_level='critical')
        db.session.add(student)
        db.session.commit()
        return student
