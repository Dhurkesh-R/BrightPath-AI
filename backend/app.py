import logging
import os
import sys
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

from datetime import datetime
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


from services.quiz_generator import generate_daily_quiz, generate_custom_quiz
from services.ai_pipeline import build_student_profile

from dotenv import load_dotenv


load_dotenv()

app = create_app()
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

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
    data = request.get_json()
    if not data or "title" not in data or "description" not in data:
        return jsonify({"error": "Missing required fields"}), 400

    activity = Activity(
        title=data["title"],
        description=data["description"],
        category=data.get("category", "general"),
    )
    db.session.add(activity)
    db.session.commit()
    return jsonify({"message": "Activity added", "activity": activity.to_dict()}), 201

@app.route("/activities", methods=["GET"])
@jwt_required()
def fetch_activities():
    activities = Activity.query.all()
    return jsonify({"activities": [a.to_dict() for a in activities]})

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
    return jsonify({"message": f"Activity {activity_id} deleted"}).accept_ranges

@app.route("/profile", methods=['GET'])
@jwt_required()
def get_user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.filter_by(id=current_user_id).first()

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.user_type,
        "age": user.age,
        "class": user.class_name,
        "school": user.school,
        "city": user.city,
        "interests": user.interests,
        "health_summary": "Bot didn't give summary yet.",
        "bio": user.bio if user.bio else "Bio not set",
        "badges": [
            { "name": "Norm Student", "icon": "🧑‍🎓", "color": "text-purple-400" },
        ],
        "profilePicUrl": user.profile_pic_url,
    })

@app.route("/profile", methods=['POST'])
@jwt_required()
def update_user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.filter_by(id=current_user_id).first()

    data=request.get_json()

    user.name = data["name"]
    user.email = data["email"]
    user.age = data["age"]
    user.class_name = data["class"]
    user.interests = data["interests"]
    user.school = data["school"]
    user.city = data["city"]
    user.bio = data["bio"]
    user.profile_pic_url = data["profilePicUrl"]

    db.session.commit()
    return jsonify({"message": "User updated", "user": user.to_dict()})

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
    summary_data = data.get("summary_data")  # full quiz summary JSON

    if not user_id or not summary_data:
        return jsonify({"error": "Invalid quiz data"}), 400

    result = QuizResult(
        user_id=user_id,
        summary_data=json.dumps(summary_data),
        taken_at=datetime.utcnow()
    )

    db.session.add(result)
    db.session.commit()

    return jsonify({"status": "Quiz results saved"}), 201


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

@app.route("/student-profile", methods=["GET"])
@jwt_required()
def get_student_profile():
    current_user_id = get_jwt_identity()

    # Fetch DB data
    chat_logs = ChatLog.query.filter_by(user_id=current_user_id).all()
    latest = QuizResult.query.filter_by(user_id=current_user_id)\
    .order_by(QuizResult.taken_at.desc())\
    .first()

    quiz_data = []

    if latest and latest.summary_data:
        quiz_data = list(latest.summary_data.values()) if isinstance(latest.summary_data, dict) else list(json.loads(latest.summary_data).values())


    logging.info(quiz_data)


    # Extract chat messages
    chat_data = []
    for chat in chat_logs:
        if chat.user_message:
            chat_data.append({"message": chat.user_message})
        if chat.bot_response:
            chat_data.append({"message": chat.bot_response})

    student = User.query.filter_by(id=current_user_id).first()

    student_info = {
        "name": student.name,
        "age": student.age,
        "grade": student.class_name,
        "profilePicUrl": student.profile_pic_url,
    }

    profile = build_student_profile(
        quiz_data=quiz_data,
        chat_data=chat_data,
        student_info=student_info
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



if __name__ == '__main__':
    app.run(debug=True);