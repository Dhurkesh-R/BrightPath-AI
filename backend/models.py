from flask_sqlalchemy import SQLAlchemy 
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student_profile = db.relationship(
        "StudentProfile", uselist=False, back_populates="user"
    )
    teacher_profile = db.relationship(
        "TeacherProfile", uselist=False, back_populates="user"
    )
    parent_profile = db.relationship(
        "ParentProfile", uselist=False, back_populates="user"
    )


class StudentProfile(db.Model):
    __tablename__ = "student_profiles"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True
    )

    grade = db.Column(db.String(10))
    section = db.Column(db.String(5))
    school = db.Column(db.String(255))
    age = db.Column(db.Integer)
    bio = db.Column(db.Text)
    city = db.Column(db.String(100))
    interests = db.Column(db.Text)
    profile_pic_url = db.Column(db.Text)

    user = db.relationship("User", back_populates="student_profile")

class TeacherProfile(db.Model):
    __tablename__ = "teacher_profiles"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True
    )

    department = db.Column(db.String(100))
    designation = db.Column(db.String(100))
    experience_years = db.Column(db.Integer)
    bio = db.Column(db.Text)
    city = db.Column(db.String(100))
    handling_classes = db.Column(db.Text)
    profile_pic_url = db.Column(db.Text)
    school = db.Column(db.String(255))
    age = db.Column(db.Integer)

    user = db.relationship("User", back_populates="teacher_profile")

class ParentProfile(db.Model):
    __tablename__ = "parent_profiles"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True
    )

    child_email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    child_password = db.Column(db.String(255), nullable=False)
    profile_pic_url = db.Column(db.Text)

    user = db.relationship("User", back_populates="parent_profile")

class Activity(db.Model):
    __tablename__ = "activities"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), default="general")
    time_spent = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Optional: Link activities to a user (if you want user-specific activities)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)

    def to_dict(self):
        """Helper to return dict (useful for JSON responses)."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "timeSpent": self.time_spent,
            "created_at": self.created_at.isoformat(),
            "user_id": self.user_id,
        }

class Goal(db.Model):
    __tablename__ = "goals"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    deadline = db.Column(db.DateTime, nullable=True)
    progress = db.Column(db.Float, default=0.0)  # 0.0 - 100.0
    status = db.Column(db.String(50), default="in-progress")  # in-progress, completed, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    user = db.relationship("User", backref=db.backref("goals", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "progress": self.progress,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "user_id": self.user_id,
        }

class QuizResult(db.Model):
    __tablename__ = "quiz_results"

    id = db.Column(db.Integer, primary_key=True)
    summary_data = db.Column(db.Text)
    taken_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    user = db.relationship("User", backref=db.backref("quiz_logs", lazy=True))
    def to_dict(self):
        return {
            "id": self.id,
            "summary_data": self.summary_data,
            "taken_at": self.taken_at.isoformat(),
            "user_id": self.user_id,
        }


class ChatLog(db.Model):
    __tablename__ = "chat_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    user = db.relationship("User", backref=db.backref("chat_logs", lazy=True))
    user_message = db.Column(db.Text)
    bot_response = db.Column(db.Text)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_message": self.user_message,
            "bot_response": self.bot_response,
            "sent_at": self.sent_at.isoformat(),
        }

class Book(db.Model):
    __tablename__ = "books"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    grade = db.Column(db.String(10), nullable=False)
    section = db.Column(db.String(10), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    file_url = db.Column(db.String(500), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "subject": self.subject,
            "grade": self.grade,
            "section": self.section,
            "uploaded_by": self.uploaded_by,
            "file_url": self.file_url,
            "uploaded_at": self.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
        }

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    grade = db.Column(db.String(10))
    section = db.Column(db.String(10))
    due_date = db.Column(db.Date)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_completed = db.Column(db.Boolean, default=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read = db.Column(db.Boolean, default=False)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)  # parent
    student_id = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50))  # academic, wellbeing, system
    title = db.Column(db.String(120))
    message = db.Column(db.Text)
    severity = db.Column(db.String(20))  # info, warning, critical
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
