from ast import BinOp
from threading import _profile_hook
from flask_sqlalchemy import SQLAlchemy 
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.String(50), nullable=False)
    age = db.Column(db.Integer)
    class_name = db.Column(db.String(10))
    school = db.Column(db.String(255))
    city = db.Column(db.String(100))
    interests = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    bio = db.Column(db.Text)
    profile_pic_url = db.Column(db.Text)

    def to_dict(self):
        return {
        "id": self.id,
        "name": self.name,
        "email": self.email,
        "role": self.user_type,
        "age": self.age,
        "class": self.class_name,
        "school": self.school,
        "city": self.city,
        "interests": self.interests,
        "bio": self.bio if self.bio else "Bio not set",
        "profilePicUrl": self.profile_pic_url if self.profile_pic_url else None,
    }



class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), default="general")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Optional: Link activities to a user (if you want user-specific activities)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)

    def to_dict(self):
        """Helper to return dict (useful for JSON responses)."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
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

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
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
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
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
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
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
    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
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
