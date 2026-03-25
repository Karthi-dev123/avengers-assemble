"""Student Tests"""
import json
from flask_jwt_extended import create_access_token
from app.models import Mentor, Student

def test_get_all_students(client, sample_mentor, sample_student, app_instance):
    with app_instance.app_context():
        mentor = Mentor.query.first()
        token = create_access_token(identity=mentor.id)
    response = client.get('/api/students', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'students' in data

def test_create_student(client, sample_mentor, app_instance):
    with app_instance.app_context():
        mentor = Mentor.query.first()
        token = create_access_token(identity=mentor.id)
    response = client.post('/api/students', headers={'Authorization': f'Bearer {token}'}, json={
        'name': 'New Student', 'email': 'new@school.edu', 'student_id': 'SID999',
        'grade': '12', 'major': 'CS'
    })
    assert response.status_code == 201

def test_get_at_risk(client, sample_mentor, at_risk_student, app_instance):
    with app_instance.app_context():
        mentor = Mentor.query.first()
        token = create_access_token(identity=mentor.id)
    response = client.get('/api/students/at-risk', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['at_risk_count'] >= 1

def test_record_interaction(client, sample_mentor, sample_student, app_instance):
    with app_instance.app_context():
        mentor = Mentor.query.first()
        student = Student.query.first()
        token = create_access_token(identity=mentor.id)
        sid = student.id
    response = client.post(f'/api/students/{sid}/interactions',
                          headers={'Authorization': f'Bearer {token}'},
                          json={'interaction_type': 'test', 'score': 85, 'notes': 'Math'})
    assert response.status_code == 201

def test_get_forecast(client, sample_mentor, sample_student, app_instance):
    with app_instance.app_context():
        mentor = Mentor.query.first()
        student = Student.query.first()
        token = create_access_token(identity=mentor.id)
        sid = student.id
    response = client.get(f'/api/students/{sid}/forecast', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'forecast_5yr' in data
