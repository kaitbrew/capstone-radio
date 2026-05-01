from flask import Blueprint, request, jsonify, session
from app import db
from models.favorite import Favorite
from routes.auth_middleware import login_required

favorites_bp = Blueprint("favorites", __name__, url_prefix="/favorites")


@favorites_bp.route("", methods=["GET"])
@login_required
def get_favorites():
    """Return all favorites for the logged-in user."""
    favorites = Favorite.query.filter_by(user_id=session["user_id"]).all()
    return jsonify({"favorites": [f.to_dict() for f in favorites]}), 200


@favorites_bp.route("/add", methods=["POST"])
@login_required
def add_favorite():
    """
    Add a station to the user's favorites.
    Expects JSON body with station details to cache locally.
    """
    data = request.get_json()

    station_uuid = data.get("station_uuid", "").strip()
    if not station_uuid:
        return jsonify({"error": "station_uuid is required."}), 400

    # Check if already favorited
    existing = Favorite.query.filter_by(
        user_id=session["user_id"],
        station_uuid=station_uuid,
    ).first()

    if existing:
        return jsonify({"error": "Station already in favorites.", "favorite": existing.to_dict()}), 409

    favorite = Favorite(
        user_id=session["user_id"],
        station_uuid=station_uuid,
        station_name=data.get("station_name", "Unknown Station"),
        station_url=data.get("station_url"),
        station_favicon=data.get("station_favicon"),
        station_tags=data.get("station_tags"),
        station_country=data.get("station_country"),
    )

    db.session.add(favorite)
    db.session.commit()

    return jsonify({"message": "Station added to favorites.", "favorite": favorite.to_dict()}), 201


@favorites_bp.route("/remove/<string:station_uuid>", methods=["DELETE"])
@login_required
def remove_favorite(station_uuid):
    """Remove a station from the user's favorites by station UUID."""
    favorite = Favorite.query.filter_by(
        user_id=session["user_id"],
        station_uuid=station_uuid,
    ).first()

    if not favorite:
        return jsonify({"error": "Station not found in your favorites."}), 404

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({"message": "Station removed from favorites."}), 200


@favorites_bp.route("/check/<string:station_uuid>", methods=["GET"])
@login_required
def check_favorite(station_uuid):
    """Check if a specific station is in the user's favorites. Useful for UI state."""
    favorite = Favorite.query.filter_by(
        user_id=session["user_id"],
        station_uuid=station_uuid,
    ).first()

    return jsonify({"is_favorite": favorite is not None}), 200