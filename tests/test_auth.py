"""Authentication Tests"""
import json
from flask_jwt_extended import create_access_token
from app.models import Mentor

def test_register_mentor(client):
    response = client.post('/api/auth/mentor/register', json={
        'username': 'new_mentor', 'email': 'new@school.edu',
        'password': 'pass123', 'name': 'New Mentor', 'role': 'mentor'
    })
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['mentor']['username'] == 'new_mentor'

def test_login_success(client, sample_mentor):
    response = client.post('/api/auth/mentor/login', json={
        'username': 'test_mentor', 'password': 'password123'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data

def test_login_invalid(client):
    response = client.post('/api/auth/mentor/login', json={
        'username': 'wrong', 'password': 'wrong'
    })
    assert response.status_code == 401

def test_get_current_mentor(client, sample_mentor, app_instance):
    with app_instance.app_context():
        mentor = Mentor.query.first()
        token = create_access_token(identity=mentor.id)
    response = client.get('/api/auth/mentor/me', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
