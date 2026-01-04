from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from datetime import timedelta
from backend.models import db
from backend.auth import auth_bp
from backend.config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ✅ 1. Initialize CORS globally (for all routes, including /profile)
    CORS(app, supports_credentials=True, resources={
        r"/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        }
    })

    # ✅ 2. Configure database
    db.init_app(app)

    # ✅ 3. Configure JWT
    app.config["JWT_SECRET_KEY"] = "your_super_secret_key"  # 🔥 Ensure this exists in Config!
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=120)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
    app.config["JWT_CSRF_PROTECT"] = False  # Optional, but helpful for APIs

    jwt = JWTManager(app)  # Initialize directly with app

    # ✅ JWT Error Handlers
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"msg": "Missing Authorization Header"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"msg": f"Invalid token: {error}"}), 422

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "Token has expired"}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "Token has been revoked"}), 401

    # ✅ 4. Setup Migrations
    migrate = Migrate(app, db)

    # ✅ 5. Register Blueprints
    app.register_blueprint(auth_bp)

    return app
