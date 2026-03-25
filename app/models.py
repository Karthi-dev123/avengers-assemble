"""
Database Models for Student Tracking & Mentorship System
Loop 1: Data in - CSV drag-and-drop, auto-maps columns, deduplicates
Loop 2: Track + forecast - Interactions recorded, performance scores, 5-10 year trajectory
Loop 3: Alert + meet + record - Score drop triggers alert, meeting recorded & transcribed
"""
from app import db
from datetime import datetime

class Student(db.Model):
    """Student model - core data from CSV import"""
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    student_id = db.Column(db.String(50), unique=True, nullable=False)
    grade = db.Column(db.String(10))
    major = db.Column(db.String(120))
    enrollment_date = db.Column(db.DateTime)

    # Performance tracking
    current_score = db.Column(db.Float, default=0.0)
    gpa = db.Column(db.Float)
    attendance_rate = db.Column(db.Float)

    # Risk tracking
    at_risk = db.Column(db.Boolean, default=False)
    risk_level = db.Column(db.String(20), default='low')
    last_alert_date = db.Column(db.DateTime)

    # 5-10 year forecast
    forecast_5yr = db.Column(db.String(500))
    forecast_10yr = db.Column(db.String(500))

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    interactions = db.relationship('Interaction', backref='student', lazy=True, cascade='all, delete-orphan')
    meetings = db.relationship('Meeting', backref='student', lazy=True, cascade='all, delete-orphan')
    alerts = db.relationship('Alert', backref='student', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'email': self.email,
            'student_id': self.student_id, 'grade': self.grade, 'major': self.major,
            'current_score': self.current_score, 'gpa': self.gpa,
            'attendance_rate': self.attendance_rate, 'at_risk': self.at_risk,
            'risk_level': self.risk_level, 'forecast_5yr': self.forecast_5yr,
            'forecast_10yr': self.forecast_10yr,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Mentor(db.Model):
    """Mentor/Coordinator model"""
    __tablename__ = 'mentors'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='mentor')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    meetings = db.relationship('Meeting', backref='mentor', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'email': self.email,
            'username': self.username, 'role': self.role,
            'is_active': self.is_active, 'created_at': self.created_at.isoformat()
        }

class Interaction(db.Model):
    """Loop 2: Track student interactions for performance scoring"""
    __tablename__ = 'interactions'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    interaction_type = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    score = db.Column(db.Float)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id, 'student_id': self.student_id,
            'interaction_type': self.interaction_type,
            'date': self.date.isoformat(), 'score': self.score, 'notes': self.notes
        }

class Alert(db.Model):
    """Loop 3: Alerts triggered by score drops"""
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    severity = db.Column(db.String(20), default='warning')
    trigger_reason = db.Column(db.String(255))
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    resolved_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id, 'student_id': self.student_id,
            'severity': self.severity, 'trigger_reason': self.trigger_reason,
            'status': self.status, 'created_at': self.created_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }

class Meeting(db.Model):
    """Loop 3: Mentor meetings - recorded, transcribed, summarized"""
    __tablename__ = 'meetings'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentors.id'), nullable=False)
    scheduled_date = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer)
    status = db.Column(db.String(20), default='scheduled')
    recording_path = db.Column(db.String(500))
    transcript = db.Column(db.Text)
    summary = db.Column(db.Text)
    notes = db.Column(db.Text)
    action_items = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'student_id': self.student_id, 'mentor_id': self.mentor_id,
            'scheduled_date': self.scheduled_date.isoformat(),
            'duration_minutes': self.duration_minutes, 'status': self.status,
            'summary': self.summary, 'action_items': self.action_items,
            'created_at': self.created_at.isoformat()
        }

class DataUpload(db.Model):
    """Loop 1: Track CSV uploads"""
    __tablename__ = 'data_uploads'

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    rows_processed = db.Column(db.Integer, default=0)
    rows_duplicated = db.Column(db.Integer, default=0)
    rows_errors = db.Column(db.Integer, default=0)
    column_mapping = db.Column(db.Text)
    status = db.Column(db.String(20), default='completed')

    def to_dict(self):
        return {
            'id': self.id, 'filename': self.filename,
            'upload_date': self.upload_date.isoformat(),
            'rows_processed': self.rows_processed,
            'rows_duplicated': self.rows_duplicated,
            'rows_errors': self.rows_errors, 'status': self.status
        }
