import logging
import os
import sys
import eventlet
eventlet.monkey_patch()

# Ensure project root is on sys.path so sibling packages like `ml_service` are importable when running backend/app.py directly
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads", "books")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {"pdf"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

import json
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_migrate import Migrate
import pandas as pd
from werkzeug.utils import secure_filename
from flask_socketio import SocketIO, emit, join_room, disconnect
from flask_jwt_extended import decode_token
from flask import request



from datetime import date, datetime
from datetime import timedelta
from backend.services.chatbot.chatbot import ChatBot
from backend import create_app

from backend.models import *
# from ml_service.services.skill_intersets import preprocess_input, primary_skill_model, secondary_skill_model, career_model, top3_model, skill_encoder1, skill_encoder2, career_encoder, interest_encoder
# from ml_service.services.learning_style import predict_learning_style as ml_predict_learning_style
# from ml_service.services.personality import predict_personality as ml_predict_personality
# from ml_service.services.physical_activity_health import predict_physical_activity_health as ml_predict_physical_activity_health
# from ml_service.services.hugging_face import analyze_sentiment as ml_analyze_sentiment, analyze_emotion as ml_analyze_emotion
# from ml_service.services.recommendor import recommend_child_path
# from ml_service.services.risks_alerts import predict_academic_risk, predict_emotional_risk, predict_health_risk


from backend.services.quiz_generator import generate_daily_quiz, generate_custom_quiz
from backend.services.ai_pipeline import build_student_profile
from backend.services.analytics import *
from backend.services.interventions import *
from backend.services.progress import *
from backend.services.recommendations import *
from backend.services.notifications import *
from backend.services.academic_metrics import *

from dotenv import load_dotenv


load_dotenv()

app = create_app()
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
socketio = SocketIO(app, cors_allowed_origins="*")

# Aggregated child data store (in-memory)
CHILD_DATA = {
    "primary_skill": None,
    "secondary_skill": None,
    "Top_3_Interests": [],
    "learning_style": None,
    "emotion": None,
    "health": None,
}

# Create database tables
# @app.before_request
# def create_tables():
#     db.create_all()

bot = ChatBot()

@app.route('/chat-bot', methods=['POST'])
@jwt_required()
def chat_bot():
    data = request.get_json() or {}
    user_message = data.get('prompt', "")

    if not user_message:
        return jsonify({'error': 'No prompt provided'}), 400

    # Temporarily disabled chatbot functionality
    response = bot.chat(user_message)
    return jsonify({'response': response})


# @app.route("/skill-interests", methods=["POST"])
# @jwt_required()
# def predict_skill_interests():
#     data = request.get_json()
#     X_processed = preprocess_input(data)

#     # Predictions
#     primary_pred = skill_encoder1.inverse_transform(primary_skill_model.predict(X_processed))[0]
#     secondary_pred = skill_encoder2.inverse_transform(secondary_skill_model.predict(X_processed))[0]
#     career_pred = career_encoder.inverse_transform(career_model.predict(X_processed))[0]
#     top3_pred = interest_encoder.inverse_transform(top3_model.predict(X_processed))[0]

#     # Update child data
#     CHILD_DATA["primary_skill"] = primary_pred
#     CHILD_DATA["secondary_skill"] = secondary_pred
#     CHILD_DATA["Top_3_Interests"] = list(top3_pred)

#     return jsonify({
#         "Primary_Skill": primary_pred,
#         "Secondary_Skill": secondary_pred,
#         "Career_Inclination": career_pred,
#         "Top_3_Interests": list(top3_pred)
#     })

# @app.route("/learning-style", methods=["POST"])
# @jwt_required()
# def predict_learning_style():
#     data = request.get_json()
#     prediction = ml_predict_learning_style(data)

#     # Update child data
#     CHILD_DATA["learning_style"] = prediction

#     return jsonify({
#         "Learning_Style": prediction
#     })

# @app.route("/personality", methods=["POST"])
# @jwt_required()
# def predict_personality():
#     data = request.get_json()
#     prediction = ml_predict_personality(data)
#     return jsonify({
#         "Personality": prediction
#     })

# @app.route("/physical-activity-health", methods=["POST"])
# @jwt_required()
# def predict_physical_activity_health():
#     data = request.get_json()
#     prediction = ml_predict_physical_activity_health(data)

#     # Update child data
#     CHILD_DATA["health"] = prediction

#     return jsonify({
#         "Physical_Activity_Health": prediction
#     })

# @app.route("/sentiment-analysis", methods=["POST"])
# @jwt_required()
# def predict_sentiment_analysis():
#     data = request.get_json()
#     # Expecting payload like {"text": "..."}
#     text = data.get("text") if isinstance(data, dict) else data
#     prediction = ml_analyze_sentiment(text)
#     return jsonify({
#         "Sentiment_Analysis": prediction
#     })

# @app.route("/emotion-analysis", methods=["POST"])
# @jwt_required()
# def predict_emotion_analysis():
#     data = request.get_json()
#     # Expecting payload like {"text": "..."}
#     text = data.get("text") if isinstance(data, dict) else data
#     prediction = ml_analyze_emotion(text)

#     # Update child data
#     CHILD_DATA["emotion"] = prediction

#     return jsonify({
#         "Emotion_Analysis": prediction
#     })

# @app.route("/child-data", methods=["GET"])
# @jwt_required()
# def get_child_data():
#     return jsonify(CHILD_DATA)

# @app.route("/recommendations", methods=["POST"])
# @jwt_required()
# def recommendations():
#     data = CHILD_DATA
#     recommendations = recommend_child_path(data)

#     return jsonify({
#         "Recommendations": recommendations
#     })

# @app.route("/risks/1", methods=["POST"])
# @jwt_required()
# def academic_risk_prediction():
#     data = request.get_json()
#     prediction = predict_academic_risk(data)

#     return jsonify({
#         "academic_risk": prediction
#     })

# @app.route("/risks/2", methods=["POST"])
# @jwt_required()
# def emotional_risk_prediction():
#     data = request.get_json()
#     prediction = predict_emotional_risk(data)

#     return jsonify({
#         "emotional_risk": prediction
#     })

# @app.route("/risks/3", methods=["POST"])
# @jwt_required()
# def health_risk_prediction():
#     data = request.get_json()
#     prediction = predict_health_risk(data)

#     return jsonify({
#         "health_risk": prediction
#     })


@app.route("/activities", methods=["POST"])
@jwt_required()
def add_activity():
    user_id = get_jwt_identity()

    data = request.get_json()
    if not data or "title" not in data or "description" not in data:
        return jsonify({"error": "Missing required fields"}), 400

    activity = Activity(
        title=data["title"],
        description=data["description"],
        category=data.get("category", "general"),
        time_spent=data["timeSpent"],
        created_at=datetime.utcnow(),
        user_id=user_id
    )
    db.session.add(activity)
    db.session.commit()
    return jsonify({"message": "Activity added", "activity": activity.to_dict()}), 201

@app.route("/activities", methods=["GET"])
@jwt_required()
def fetch_activities():
    user_id = get_jwt_identity()

    activities = Activity.query.filter_by(user_id=user_id).all()
    return jsonify([activity.to_dict() for activity in activities]), 200

# -------------------
# READ (GET ONE by ID)
# -------------------
@app.route("/activities/<int:activity_id>", methods=["GET"])
@jwt_required()
def get_activity(activity_id):
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404
    return jsonify(activity.to_dict())

# -------------------
# UPDATE (PUT)
# -------------------
@app.route("/activities/<int:activity_id>", methods=["PUT"])
@jwt_required()
def update_activity(activity_id):
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404

    data = request.get_json()
    if "title" in data:
        activity.title = data["title"]
    if "description" in data:
        activity.description = data["description"]
    if "category" in data:
        activity.category = data["category"]
    if "timeSpent" in data:
        activity.time_spent = data["timeSpent"]

    db.session.commit()
    return jsonify({"message": "Activity updated", "activity": activity.to_dict()})


# -------------------
# DELETE
# -------------------
@app.route("/activities/<int:activity_id>", methods=["DELETE"])
@jwt_required()
def delete_activity(activity_id):
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404

    db.session.delete(activity)
    db.session.commit()
    return jsonify({"message": f"Activity {activity_id} deleted"})

@app.route("/profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    current_user_id = get_jwt_identity()

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    base_response = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "health_summary": "Bot didn't give summary yet.",
        "badges": [
            {"name": "Norm Student", "icon": "🧑‍🎓", "color": "text-purple-400"}
        ],
    }

    # STUDENT
    if user.role == "student" and user.student_profile:
        profile = user.student_profile
        base_response.update({
            "age": profile.age,
            "class": profile.grade,
            "section": profile.section,
            "school": profile.school,
            "bio": profile.bio,
            "city": profile.city,
            "interests": profile.interests,
            "profilePicUrl": profile.profile_pic_url
        })

    # TEACHER
    elif user.role == "teacher" and user.teacher_profile:
        profile = user.teacher_profile
        base_response.update({
            "department": profile.department,
            "designation": profile.designation,
            "experience_years": profile.experience_years,
            "age": profile.age,
            "bio": profile.bio,
            "city": profile.city,
            "handling_classes": profile.handling_classes,
            "profilePicUrl": profile.profile_pic_url,
            "school": profile.school
        })

    return jsonify(base_response), 200


@app.route("/profile", methods=["POST"])
@jwt_required()
def update_user_profile():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # ---- Update User (common fields) ----
    user.name = data.get("name", user.name)
    user.email = data.get("email", user.email)

    db.session.commit()

    # ---- Role-based profile update ----
    if user.role == "student":
        profile = user.student_profile
        if not profile:
            return jsonify({"error": "Student profile missing"}), 400

        profile.age = data.get("age", profile.age)
        profile.grade = data.get("class", profile.grade)
        profile.section = data.get("section", profile.section)
        profile.school = data.get("school", profile.school)
        profile.interests = data.get("interests", profile.interests)
        profile.city = data.get("city", profile.city)
        profile.bio = data.get("bio", profile.bio)
        profile.profile_pic_url = data.get("profilePicUrl", profile.profile_pic_url)

        db.session.commit()

        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "age": profile.age,
                "class": profile.grade,
                "section": profile.section,
                "school": profile.school,
                "bio": profile.bio,
                "city": profile.city,
                "interests": profile.interests,
                "profilePicUrl": profile.profile_pic_url
            }
        }), 200

    elif user.role == "teacher":
        profile = user.teacher_profile
        if not profile:
            return jsonify({"error": "Teacher profile missing"}), 400

        profile.department = data.get("department", profile.department)
        profile.designation = data.get("designation", profile.designation)
        profile.experience_years = data.get("experience_years", profile.experience_years)
        profile.handling_classes = data.get("handling_classes", profile.handling_classes)
        profile.city = data.get("city", profile.city)
        profile.bio = data.get("bio", profile.bio)
        profile.age = data.get("age", profile.age)
        profile.school = data.get("school", profile.school)
        
        profile.profile_pic_url = data.get("profilePicUrl", profile.profile_pic_url)

        db.session.commit()

        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "department": profile.department,
                "designation": profile.designation,
                "experience_years": profile.experience_years,
                "bio": profile.bio,
                "city": profile.city,
                "handling_classes": profile.handling_classes,
                "age": profile.age,
                "profilePicUrl": profile.profile_pic_url,
                "school": profile.school,
            }
        }), 200
    
    else:
        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
            }
        }), 200



# GET all goals for a specific user
@app.route("/goals", methods=["GET"])
@jwt_required()
def get_goals():
    user_id = get_jwt_identity()

    goals = Goal.query.filter_by(user_id=user_id).all()
    return jsonify([goal.to_dict() for goal in goals]), 200

# POST create new goal
@app.route("/goals", methods=["POST"])
@jwt_required()
def create_goal():
    user_id = get_jwt_identity()
    data = request.get_json()
    try:
        new_goal = Goal(
            title=data.get("title"),
            description=data.get("description"),
            deadline=datetime.fromisoformat(data["deadline"]) if data.get("deadline") else None,
            progress=data.get("progress", 0.0),
            status=data.get("status", "in-progress"),
            user_id=user_id
        )
        db.session.add(new_goal)
        db.session.commit()
        return jsonify(new_goal.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# PUT update existing goal
@app.route("/goals/<int:goal_id>", methods=["PUT"])
@jwt_required()
def update_goal(goal_id):
    data = request.get_json()
    goal = Goal.query.get_or_404(goal_id)
    goal.title = data.get("title", goal.title)
    goal.description = data.get("description", goal.description)
    goal.deadline = datetime.fromisoformat(data["deadline"]) if data.get("deadline") else goal.deadline
    goal.progress = data.get("progress", goal.progress)
    goal.status = data.get("status", goal.status)

    db.session.commit()
    return jsonify(goal.to_dict()), 200

# DELETE a goal
@app.route("/goals/<int:goal_id>", methods=["DELETE"])
@jwt_required()
def delete_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)
    db.session.delete(goal)
    db.session.commit()
    return jsonify({"message": "Goal deleted"}), 200

@app.route("/send-quiz-results", methods=["POST"])
@jwt_required()
def send_quiz_results():
    data = request.json
    user_id = get_jwt_identity()
    raw_answers = data.get("summary_data")

    if not user_id or not raw_answers or not isinstance(raw_answers, dict):
        return jsonify({"error": "Invalid quiz data"}), 400

    # ---- AGGREGATE PER SUBJECT ----
    topic_map = {}

    for q in raw_answers.values():
        subject = q.get("subject", "Unknown")

        topic_map.setdefault(subject, {"topic": subject, "correct": 0, "total": 0})
        topic_map[subject]["total"] += 1

        if q.get("isCorrect") is True:
            topic_map[subject]["correct"] += 1

    aggregated_summary = list(topic_map.values())

    # ---- SAVE NORMALIZED DATA ----
    result = QuizResult(
        user_id=user_id,
        summary_data=json.dumps(aggregated_summary),
        taken_at=datetime.utcnow()
    )

    db.session.add(result)
    db.session.commit()

    return jsonify({
        "status": "Quiz results saved",
        "summary": aggregated_summary
    }), 201


@app.route("/send-chat-log", methods=["POST"])
@jwt_required()
def send_chat_data():

    data = request.json
    user_id = get_jwt_identity()
    messages = data.get("messages")

    if not user_id or not messages:
        return jsonify({"error": "Invalid chat data"}), 400

    for msg in messages:
        chat = ChatLog(
            user_id=user_id,
            user_message=msg.get("user_message"),
            bot_response=msg.get("bot_response")
        )
        db.session.add(chat)

    db.session.commit()

    return jsonify({"status": "Chat logs saved"}), 201

@app.route("/student-profile/<int:user_id>", methods=["GET"])
@jwt_required()
def get_student_profile(user_id):
    # Fetch user + student profile
    user = User.query.get(user_id)
    if user.role == "parent":
        user = User.query.filter_by(email=user.parent_profile.child_email).first()
        user_id = user.id

    if not user or user.role != "student":
        return jsonify({"error": "Student not found"}), 404

    student_profile = user.student_profile
    if not student_profile:
        return jsonify({"error": "Student profile missing"}), 404

    # Fetch DB data
    chat_logs = ChatLog.query.filter_by(user_id=user_id).all()

    latest_quiz = (
        QuizResult.query
        .filter_by(user_id=user_id)
        .order_by(QuizResult.taken_at.desc())
        .first()
    )

    quiz_data = []

    if latest_quiz and latest_quiz.summary_data:
            quiz_data = json.loads(latest_quiz.summary_data)

    activities = Activity.query.filter_by(user_id=user_id).all()

    # Extract chat messages
    chat_data = []
    for chat in chat_logs:
        if chat.user_message:
            chat_data.append({"message": chat.user_message})
        if chat.bot_response:
            chat_data.append({"message": chat.bot_response})

    # ✅ Correct data source
    student_info = {
        "name": user.name,
        "age": student_profile.age,
        "grade": student_profile.grade,
        "section": student_profile.section,
        "school": student_profile.school,
        "profilePicUrl": student_profile.profile_pic_url
    }

    profile = build_student_profile(
        quiz_data=quiz_data,
        chat_data=chat_data,
        student_info=student_info,
        activities=activities,
    )

    return jsonify(profile), 200



@app.route("/daily-quiz", methods=["GET"])
@jwt_required()
def get_daily_quiz():
    quizzes = generate_daily_quiz()
    logging.info(quizzes)
    return jsonify(quizzes), 200


@app.route("/custom-quiz", methods=["POST"])
@jwt_required()
def get_custom_quiz():
    data = request.json
    topic = data.get("topic")
    difficulty = data.get("difficulty", "medium")
    count = data.get("count", 5)
    quiz = generate_custom_quiz(topic, difficulty, count)
    return jsonify(quiz), 200

@app.route("/upload-book", methods=["POST"])
@jwt_required()
def upload_book():
    current_user = get_jwt_identity()
    title = request.form.get("title")
    subject = request.form.get("subject")
    grade = request.form.get("grade")
    section = request.form.get("section")

    file = request.files.get("file")
    if not file or not allowed_file(file.filename):
        return jsonify({"error": "Invalid or missing file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    # Store in DB
    new_book = Book(
        title=title,
        subject=subject,
        grade=grade,
        section=section,
        uploaded_by=current_user,
        file_url=f"/books/files/{filename}",
    )
    db.session.add(new_book)
    db.session.commit()

    return jsonify({"message": "Book uploaded successfully", "book": new_book.to_dict()}), 201

@app.route("/books", methods=["GET"])
@jwt_required()
def get_books():
    books = Book.query.all()
    return jsonify([book.to_dict() for book in books]), 200

@app.route("/books/<int:book_id>", methods=["DELETE"])
@jwt_required()
def delete_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    # Remove file
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], os.path.basename(book.file_url))
    if os.path.exists(file_path):
        os.remove(file_path)

    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "Book deleted successfully"}), 200

@app.route("/books/files/<path:filename>")
def serve_book_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json()

    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    if not current_password or not new_password:
        return jsonify({"error": "Missing required fields"}), 400

    if len(new_password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # 🔐 Verify current password
    if not check_password_hash(user.password_hash, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    # 🔐 Hash and update new password
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200

@app.route("/students", methods=["GET"])
@jwt_required()
def get_students():
    """
    Fetch all students with optional filters:
    - grade
    - section
    - search (by name)
    """

    # Query params
    grade = request.args.get("grade")        # e.g. "9"
    section = request.args.get("section")    # e.g. "A"
    search = request.args.get("search")      # e.g. "ravi"

    user = User.query.get(get_jwt_identity())

    # Base query: ONLY students
    query = (
        db.session.query(User, StudentProfile)
        .join(StudentProfile, StudentProfile.user_id == User.id)
        .filter(User.role == "student", StudentProfile.school==user.teacher_profile.school)
    )

    logging.info(query)

    # Apply grade filter
    if grade and grade != "all":
        query = query.filter(StudentProfile.grade == grade)

    # Apply section filter
    if section and section != "all":
        query = query.filter(StudentProfile.section == section)

    # Apply search filter (case-insensitive)
    if search:
        query = query.filter(
            User.name.ilike(f"%{search.strip()}%")
        )

    results = query.all()

    logging.info(results)

    students = []
    for user, profile in results:
        students.append({
            "id": user.id,
            "name": user.name,
            "grade": profile.grade,
            "section": profile.section,
            "avatar": profile.profile_pic_url if profile.profile_pic_url else "".join([w[0] for w in user.name.split()][:2]).upper(),
            "performance": profile.performance if hasattr(profile, "performance") else "Average"
        })

    logging.info(students)

    return jsonify({
        "success": True,
        "count": len(students),
        "data": students
    }), 200

@app.route("/analytics/class-summary", methods=["GET"])
@jwt_required()
def class_analytics():
    grade = request.args.get("grade")
    section = request.args.get("section")

    students = (
        User.query
        .join(StudentProfile)
        .filter(
            User.role == "student",
            StudentProfile.grade == grade,
            StudentProfile.section == section
        )
        .all()
    )

    profiles = []
    quizzes = QuizResult.query.all()

    for user in students:
        latest_quiz = (
            QuizResult.query
            .filter_by(user_id=user.id)
            .order_by(QuizResult.taken_at.desc())
            .first()
        )

        chat_logs = ChatLog.query.filter_by(user_id=user.id).all()

        quiz_data = []
        if latest_quiz and latest_quiz.summary_data:
            quiz_data = json.loads(latest_quiz.summary_data)  # ALWAYS list now

        chat_data = []
        for chat in chat_logs:
            if chat.user_message:
                chat_data.append({"message": chat.user_message})
            if chat.bot_response:
                chat_data.append({"message": chat.bot_response})

        profile = build_student_profile(
            quiz_data=quiz_data,
            chat_data=chat_data,
            student_info={
                "name": user.name,
                "grade": user.student_profile.grade,
                "age": user.student_profile.age,
                "profilePicUrl": user.student_profile.profile_pic_url
            },
            activities=Activity.query.filter_by(user_id=user.id).all()
        )
        profiles.append(profile)

    return jsonify(aggregate_profiles(profiles, quizzes)), 200


@app.route("/teacher-stats", methods=["GET"])
@jwt_required()
def teacher_stats():
    user_id = get_jwt_identity()
    teacher = User.query.get(user_id)

    if not teacher or teacher.role != "teacher":
        return jsonify({"error": "Unauthorized"}), 403

    students_count = User.query.filter_by(role="student").count()
    books_count = Book.query.count()

    quiz_results = QuizResult.query.all()

    if not quiz_results:
        avg_score = 0
    else:
        accuracies = []
        for q in quiz_results:
            quiz_data = json.loads(q.summary_data)  # ALWAYS list now
            accuracies.append(compute_quiz_accuracy(quiz_data))

        avg_score = round(sum(accuracies) / len(accuracies), 2)

    return jsonify({
        "totalStudents": students_count,
        "totalBooks": books_count,
        "avgQuizScore": avg_score,
        "aiSummary": "Class performance is stable. Attention needed for low performers."
    })

@app.route("/performance-data", methods=["GET"])
@jwt_required()
def performance_data():
    quiz_results = QuizResult.query.all()

    all_quiz_summaries = [
        json.loads(q.summary_data)
        for q in quiz_results
    ]

    data = subject_wise_performance(all_quiz_summaries)
    logging.info(data)
    return jsonify(data)

@app.route("/analytics/overview", methods=["GET"])
@jwt_required()
def analytics_overview():
    students = User.query.filter_by(role="student").all()

    all_quizzes = QuizResult.query.all()

    weekly = weekly_quiz_trend(all_quizzes)
    risks = risk_distribution(students)

    return jsonify({
        "weeklyTrend": weekly,
        "behaviorRisks": risks
    })

@app.route("/books/recent", methods=["GET"])
@jwt_required()
def recent_books():
    books = Book.query.order_by(Book.uploaded_at.desc()).limit(6).all()

    return jsonify([
        {
            "id": b.id,
            "title": b.title,
            "subject": b.subject,
            "grade": b.grade,
            "section": b.section,
            "file_url": b.file_url
        }
        for b in books
    ])

@app.route("/interventions", methods=["GET"])
@jwt_required()
def interventions():
    teacher = User.query.get(get_jwt_identity())
    if teacher.role != "teacher":
        return jsonify({"error": "Unauthorized"}), 403

    chatbot = ChatBot(user_role="teacher")

    grade = request.args.get("grade")
    section = request.args.get("section")

    students = (
        User.query
        .join(StudentProfile)
        .filter(
            User.role == "student",
            StudentProfile.grade == grade,
            StudentProfile.section == section,
            StudentProfile.school == teacher.teacher_profile.school,
        )
        .all()
    )

    results = []

    for student in students:
        latest_quiz = (
            QuizResult.query
            .filter_by(user_id=student.id)
            .order_by(QuizResult.taken_at.desc())
            .first()
        )

        if not latest_quiz:
            continue

        quiz_data = json.loads(latest_quiz.summary_data)
        quiz_analysis = analyze_quiz(quiz_data)

        chat_logs = ChatLog.query.filter_by(user_id=student.id).all()


        chat_data = []
        for chat in chat_logs:
            if chat.user_message:
                chat_data.append({"message": chat.user_message})
            if chat.bot_response:
                chat_data.append({"message": chat.bot_response})

        activities = Activity.query.filter_by(user_id=student.id).all()

        profile = build_student_profile(
            quiz_data=quiz_data,
            chat_data=chat_data,
            student_info={
                "name": student.name,
                "grade": student.student_profile.grade,
                "age": student.student_profile.age,
                "profilePicUrl": student.student_profile.profile_pic_url
            },
            activities=activities,
        )

        context = build_intervention_context(student, quiz_analysis, profile)

        intervention_text = generate_intervention_text(context, chatbot)
        if not intervention_text:
            intervention_text = fallback_intervention(context)

        results.append({
            "studentId": student.id,
            "studentName": student.name,
            "riskLevel": "High" if context["academic_risk"] else "Moderate",
            "intervention": intervention_text
        })

        logging.info(results)

    return jsonify(results), 200


@app.route("/assignments", methods=["POST"])
@jwt_required()
def create_assignment():
    user_id = get_jwt_identity()
    teacher = User.query.get(user_id)

    if teacher.role != "teacher":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json

    assignment = Assignment(
        title=data["title"],
        description=data.get("description"),
        grade=data["grade"],
        section=data["section"],
        due_date=datetime.strptime(data["due_date"], "%Y-%m-%d"),
        created_by=user_id
    )

    db.session.add(assignment)
    db.session.commit()

    return jsonify({"status": "Assignment created"}), 201

@app.route("/assignments", methods=["GET"])
@jwt_required()
def list_assignments():
    user = User.query.get(get_jwt_identity())

    if user.role == "teacher":
        assignments = Assignment.query.filter_by(created_by=user.id).all()
    else:
        profile = user.student_profile
        assignments = Assignment.query.filter_by(
            grade=profile.grade,
            section=profile.section
        ).all()

    return jsonify([
        {
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "grade": a.grade,
            "section": a.section,
            "due_date": a.due_date.isoformat()
        }
        for a in assignments
    ])

@app.route("/assignments/<int:assignment_id>", methods=["PUT"])
@jwt_required()
def update_assignment(assignment_id):
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return jsonify({"error": "Activity not found"}), 404

    data = request.get_json()
    if "title" in data:
        assignment.title = data["title"]
    if "description" in data:
        assignment.description = data["description"]
    if "grade" in data:
        assignment.grade = data["grade"]
    if "section" in data:
        assignment.section = data["section"]
    if "due_date" in data:
        assignment.due_date = data["due_date"]   

    db.session.commit()
    return jsonify({"message": "Assignment updated", "activity": assignment})

@app.route("/assignments/<int:assignment_id>", methods=["DELETE"])
@jwt_required()
def delete_assignment(assignment_id):
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return jsonify({"error": "Assignment not found"}), 404

    db.session.delete(assignment)
    db.session.commit()
    return jsonify({"message": f"Assignment {assignment_id} deleted"})

def conversation_room(user1_id, user2_id):
    low, high = sorted([int(user1_id), int(user2_id)])
    return f"conversation_{low}_{high}"

@socketio.on("join_conversation")
def join_conversation(data):
    token = data["auth"]

    if not token:
        print("❌ No token provided in socket auth")
        disconnect()
        return

    try:
        decoded = decode_token(token)
        user_id = decoded["sub"]
    except Exception as e:
        print("❌ Invalid token:", e)
        disconnect()
        return

    other_user_id = data["otherUserId"]

    room = conversation_room(user_id, other_user_id)
    join_room(room)

    print(f"🟢 User {user_id} joined {room}")

@socketio.on("connect")
def handle_connect(auth):
    try:
        # Socket.IO v4 sends auth here
        token = auth.get("token") if auth else None

        if not token:
            print("❌ No token provided")
            disconnect()
            return

        decoded = decode_token(token)
        user_id = decoded["sub"]

        join_room(f"user_{user_id}")

        print(f"🟢 Socket connected for user {user_id}")

    except Exception as e:
        print("❌ Socket auth failed:", str(e))
        disconnect()

@app.route("/messages/conversations", methods=["GET"])
@jwt_required()
def conversations():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.role == "student":
        return jsonify({"error": "Unauthorized"}), 403

    # All parents this teacher has chatted with
    conversations = (
        db.session.query(User.id, User.name)
        .join(Message, Message.sender_id == User.id)
        .filter(Message.receiver_id == user_id)
        .distinct()
        .all()
    )

    sent_conversations = (
        db.session.query(User.id, User.name)
        .join(Message, Message.receiver_id == User.id)
        .filter(Message.sender_id == user_id)
        .distinct()
        .all()
    )

    users = {uid: name for uid, name in conversations + sent_conversations}

    return jsonify([
        {"userId": uid, "name": name}
        for uid, name in users.items()
    ])

@app.route("/messages/thread/<int:other_user_id>", methods=["GET"])
@jwt_required()
def message_thread(other_user_id):
    user_id = get_jwt_identity()

    messages = (
        Message.query
        .filter(
            db.or_(
                db.and_(
                    Message.sender_id == user_id,
                    Message.receiver_id == other_user_id
                ),
                db.and_(
                    Message.sender_id == other_user_id,
                    Message.receiver_id == user_id
                )
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )

    return jsonify([
        {
            "id": m.id,
            "senderId": m.sender_id,
            "receiverId": m.receiver_id,
            "content": m.content,
            "createdAt": m.created_at.isoformat(),
            "read": m.read
        }
        for m in messages
    ])

@app.route("/messages/send", methods=["POST"])
@jwt_required()
def send_message():
    sender_id = get_jwt_identity()
    data = request.json

    receiver_id = data["receiverId"]
    content = data["content"]

    message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content
    )
    db.session.add(message)
    db.session.commit()

    room = conversation_room(sender_id, receiver_id)

    socketio.emit(
        "new_message",
        {
            "id": message.id,
            "senderId": int(sender_id),
            "receiverId": receiver_id,
            "content": content,
            "createdAt": message.created_at.isoformat()
        },
        room=room,
    )

    return jsonify({"success": True}), 201


@app.route("/messages/unread-count", methods=["GET"])
@jwt_required()
def unread_count():
    user_id = get_jwt_identity()

    count = Message.query.filter_by(
        receiver_id=user_id,
        read=False
    ).count()

    return jsonify({"unread": count})

@app.route("/messages/mark-read/<int:thread_user_id>", methods=["POST"])
@jwt_required()
def mark_messages_read(thread_user_id):
    user_id = get_jwt_identity()

    Message.query.filter(
        Message.sender_id == thread_user_id,
        Message.receiver_id == user_id,
        Message.read == False
    ).update({"read": True})

    db.session.commit()

    return jsonify({"status": "updated"})

@app.route("/teachers/parents", methods=["GET"])
@jwt_required()
def get_parents_for_teacher():
    user_id = get_jwt_identity()
    teacher = User.query.get(user_id)

    if not teacher or teacher.role != "teacher":
        return jsonify({"error": "Unauthorized"}), 403

    teacher_school = teacher.teacher_profile.school

    # 1. Get students from same school
    students = (
        StudentProfile.query
        .filter(StudentProfile.school == teacher_school)
        .all()
    )

    student_emails = [s.user.email for s in students]

    # 2. Match parents via child_email
    parents = (
        ParentProfile.query
        .filter(ParentProfile.child_email.in_(student_emails))
        .all()
    )

    response = []
    for p in parents:
        parent_user = User.query.get(p.user_id)
        student=User.query.filter_by(email=p.child_email).first()
        response.append({
            "userId": parent_user.id,
            "name": parent_user.name,
            "email": parent_user.email,
            "childName": student.name
        })

    return jsonify(response), 200




@app.route("/parent/teachers", methods=["GET"])
@jwt_required()
def get_teachers_for_parent():
    user_id = get_jwt_identity()
    parent = User.query.get(user_id)

    if not parent or parent.role != "parent":
        return jsonify({"error": "Unauthorized"}), 403

    child = User.query.filter_by(email=parent.parent_profile.child_email).first()
    child_school = child.student_profile.school

    # 1. Get students from same school
    teachers = (
        TeacherProfile.query
        .filter(TeacherProfile.school == child_school)
        .all()
    )

    response = []
    for t in teachers:
        teacher_user = User.query.get(t.user_id)
        response.append({
            "userId": teacher_user.id,
            "name": teacher_user.name,
            "email": teacher_user.email,
            "school": teacher_user.teacher_profile.school
        })

    return jsonify(response), 200




def build_parent_report(student_id, student, period="weekly"):
    now = datetime.utcnow()
    start = now - timedelta(days=7 if period == "weekly" else 30)
    logging.info(now)
    logging.info(start)

    quizzes = QuizResult.query.filter(
        QuizResult.user_id == student_id,
        QuizResult.taken_at >= start
    ).all()

    assignments = Assignment.query.filter(
        Assignment.grade == student.student_profile.grade,
        Assignment.section == student.student_profile.section
    ).all()

    activities = Activity.query.filter(
        Activity.user_id == student_id,
        Activity.created_at >= start
    ).all()

    goals = Goal.query.filter(
        Goal.user_id == student_id
    ).all()

    # ---- Academic ----
    quiz_data = []
    for q in quizzes:
        quiz_data.extend(
            json.loads(q.summary_data)
        )

    logging.info(quiz_data)
    logging.info(quizzes)

    academic_analysis = analyze_quiz(quiz_data)

    # ---- Assignments ----
    completed = len([a for a in assignments if a.is_completed])
    overdue = len([a for a in assignments if a.due_date < now.date()])
    pending = len(assignments) - completed

    # ---- Activities ----
    activity_split = defaultdict(int)
    for a in activities:
        activity_split[a.category] += a.time_spent

    total_time = sum(activity_split.values()) or 1
    activity_percent = {
        k: round((v / total_time) * 100)
        for k, v in activity_split.items()
    }

    # ---- Goals ----
    completed_goals = len([g for g in goals if g.status == "completed"])
    overdue_goals = len([g for g in goals if g.status != "completed" if g.deadline < now])
    logging.info(overdue_goals)
    logging.info(academic_analysis["topic_analysis"])


    return {
        "academics": {
            "averageScore": academic_analysis["overall_accuracy"],
            "subjects": academic_analysis["topic_analysis"],
            "assignments": {
                "total": len(assignments),
                "completed": completed,
                "pending": pending,
                "overdue": overdue,
            }
        },
        "goals": {
            "total": len(goals),
            "completed": completed_goals,
            "pending": len(goals) - completed_goals,
            "overdue": overdue_goals
        },
        "activity_percent": activity_percent,
        "activities": [a.to_dict() for a in activities],
        "mood": {
            "riskLevel": "medium"  # placeholder (tie to emotion engine)
        }
    }


@app.route("/parent/reports", methods=["GET"])
@jwt_required()
def parent_reports():
    parent = User.query.get(get_jwt_identity())
    student = User.query.filter_by(email=parent.parent_profile.child_email).first()
    student_id = student.id
    period = request.args.get("period", "weekly")

    report = build_parent_report(student_id, student, period)

    return jsonify(report), 200

@app.route("/parent/progress", methods=["GET"])
@jwt_required()
def parent_progress():
    period = request.args.get("period", "weekly")

    parent = User.query.get(get_jwt_identity())
    student = User.query.filter_by(email=parent.parent_profile.child_email).first()
    student_id = student.id
    if parent.role != "parent":
        return jsonify({"error": "Unauthorized"}), 403
    # --- Fetch data ---
    quizzes = QuizResult.query.filter_by(user_id=student_id).all()
    activities = Activity.query.filter_by(user_id=student_id).all()

    # --- Compute progress ---
    academic_latest, academic_trend = academic_progress(quizzes, period)
    creative_latest, creative_trend = activity_progress(
        activities, "art", period, "creative"
    )
    sports_latest, sports_trend = activity_progress(
        activities, "sports", period, "sports"
    )

    # --- Merge trends by label ---
    merged = {}

    for item in academic_trend:
        merged[item["label"]] = {
            "label": item["label"],
            "academic": item["academic"],
            "creative": 0,
            "sports": 0
        }

    for item in creative_trend:
        merged.setdefault(item["label"], {"label": item["label"]})
        merged[item["label"]]["creative"] = item["creative"]

    for item in sports_trend:
        merged.setdefault(item["label"], {"label": item["label"]})
        merged[item["label"]]["sports"] = item["sports"]

    trend = list(merged.values())

    return jsonify({
        "summary": {
            "academic": academic_latest,
            "creative": creative_latest,
            "sports": sports_latest
        },
        "trend": trend,
        "insight": generate_progress_insight(
            academic_latest, creative_latest, sports_latest
        )
    })

@app.route("/parent/recommendations", methods=["GET"])
@jwt_required()
def parent_recommendations():
    parent = User.query.get(get_jwt_identity())
    student = User.query.filter_by(email=parent.parent_profile.child_email).first()
    student_id = student.id
    if parent.role != "parent":
        return jsonify({"error": "Unauthorized"}), 403

    # --- Pull progress summary (reuse logic) ---
    quizzes = QuizResult.query.filter_by(user_id=student_id).all()
    activities = Activity.query.filter_by(user_id=student_id).all()

    academic, _ = academic_progress(quizzes, "monthly")
    creative, _ = activity_progress(activities, "art", "monthly", "creative")
    sports, _ = activity_progress(activities, "sports", "monthly", "sports")

    recommendations = []

    for rec in [
        recommend_academics(academic),
        recommend_sports(sports),
        recommend_creative(creative),
        recommend_balance(academic, creative, sports),
    ]:
        if rec:
            recommendations.append(rec)

    return jsonify({
        "summary": {
            "academic": academic,
            "creative": creative,
            "sports": sports
        },
        "recommendations": recommendations
    })

@app.route("/parent/notifications", methods=["GET"])
@jwt_required()
def get_parent_notifications():
    parent_id = get_jwt_identity()

    parent = User.query.get(parent_id)
    if parent.role != "parent":
        return jsonify({"error": "Unauthorized"}), 403

    notifications = Notification.query.filter_by(
        user_id=parent_id
    ).order_by(Notification.created_at.desc()).limit(50).all()

    return jsonify([
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "severity": n.severity,
            "read": n.read,
            "created_at": n.created_at.isoformat()
        }
        for n in notifications
    ])

@app.route("/parent/notifications/<int:id>/read", methods=["POST"])
@jwt_required()
def mark_notification_read(id):
    parent_id = get_jwt_identity()

    notif = Notification.query.filter_by(id=id, user_id=parent_id).first_or_404()
    notif.read = True
    db.session.commit()

    return jsonify({"status": "ok"})

def generate_parent_notifications():
    parents = User.query.filter_by(role="parent").all()

    for parent in parents:
        student = User.query.filter_by(email=parent.parent_profile.child_email).first()
        student_id = student.id

        quizzes = QuizResult.query.filter_by(user_id=student_id).all()
        activities = Activity.query.filter_by(user_id=student_id).all()
        goals = Goal.query.filter_by(user_id=student_id).all()

        prev, curr = academic_weekly_delta(quizzes)

        detectors = [
            academic_drop_notification(prev, curr),
            missed_goal_notification(goals),
            inactivity_notification(activities, "sports"),
            inactivity_notification(activities, "art"),
        ]

        for d in detectors:
            if d:
                db.session.add(Notification(
                    user_id=parent.id,
                    student_id=student_id,
                    **d
                ))

    db.session.commit()


if __name__ == "__main__":
    socketio.run(app, debug=True)
