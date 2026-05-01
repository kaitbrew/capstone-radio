from flask import Blueprint, request, jsonify, session
from app import db, bcrypt
from models.user import User
from routes.auth_middleware import login_required

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken."}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered."}), 409

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(username=username, email=email, password_hash=password_hash)

    db.session.add(user)
    db.session.commit()

    session["user_id"] = user.id
    return jsonify({"message": "Registration successful.", "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid username or password."}), 401

    session["user_id"] = user.id
    return jsonify({"message": "Login successful.", "user": user.to_dict()}), 200


@auth_bp.route("/logout", methods=["DELETE"])
@login_required
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out successfully."}), 200


@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    """Check current session / who's logged in."""
    user = User.query.get(session["user_id"])
    if not user:
        session.clear()
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200