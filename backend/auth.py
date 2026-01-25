from flask import Blueprint, request, jsonify
from backend.utils.security import hash_password, verify_password
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required

auth_bp = Blueprint("auth", __name__)
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    required = ["name", "email", "password", "userType"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    if len(data["password"]) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    user_type = data["userType"].lower()
    if user_type not in ["student", "teacher", "parent"]:
        return jsonify({"error": "Invalid user type"}), 400

    from backend.models import (
        db,
        User,
        StudentProfile,
        TeacherProfile,
        ParentProfile
    )

    # Check if email already exists
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 400

    # --- Create User ---
    hashed_password = hash_password(data["password"])

    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=hashed_password,
        role=user_type
    )

    db.session.add(user)
    db.session.flush()  # ensures user.id is available without commit

    # --- Create Profile based on role ---
    if user_type == "student":
        profile = StudentProfile(
            user_id=user.id,
            grade=data.get("grade"),
            section=data.get("section"),
            school=data.get("school"),
            age=data.get("age"),
            city=data.get("city"),
            interests=data.get("interests"),
            bio=data.get("bio"),
        )

    elif user_type == "teacher":
        profile = TeacherProfile(
            user_id=user.id,
            department=data.get("department"),
            designation=data.get("designation"),
            experience_years=data.get("experienceYears"),
            school=data.get("school"),
            age=data.get("age"),
            city=data.get("city"),
            bio=data.get("bio"),
            handling_classes=data.get("handlingClasses"),
        )

    else:  # parent
        child = User.query.filter_by(email=data["childEmail"]).first()
        if not child or not verify_password(data["childPassword"], child.password_hash):
            return jsonify({"error": "Invalid credentials"}), 401
        
        profile = ParentProfile(
            user_id=user.id,
            child_email=data.get("childEmail"), 
            child_password=data.get("childPassword"),
        )

    db.session.add(profile)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "userId": user.id,
        "role": user.role
    }), 201



@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    required = ["email", "password"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing email or password"}), 400

    # Import models within the route to ensure proper app context
    from backend.models import db, User
    
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not verify_password(data["password"], user.password_hash):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify({
        # FIX 1: Change 'access_token' to 'token' to match client's expectation
        "token": access_token, 
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200



@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user)
    # This already uses 'token', which is correct
    return jsonify({"status": "success", "token": new_token})
