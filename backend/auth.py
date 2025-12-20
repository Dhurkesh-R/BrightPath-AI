from flask import Blueprint, request, jsonify
from backend.utils.security import hash_password, verify_password
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    required = ["name", "email", "password", "userType"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400
    if len(data["password"]) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    # Import models within the route to ensure proper app context
    from backend.models import db, User
    
    # Check if user already exists
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 400

    # Create new user
    hashed = hash_password(data["password"])
    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=hashed,
        user_type=data["userType"],
        age=data.get("age"),
        class_name=data.get("class"),
        school=data.get("school"),
        city=data.get("city"),
        interests=data.get("interests"),
    )
    
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


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