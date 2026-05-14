import requests
from flask import Blueprint, request, jsonify

stations_bp = Blueprint("stations", __name__, url_prefix="/stations")

RADIO_BROWSER_BASE = "https://de1.api.radio-browser.info/json"
PAGE_SIZE = 20



def _radio_get(endpoint, params=None):
    """Helper: GET from Radio Browser API with a browser-like User-Agent (required)."""
    headers = {"User-Agent": "RadioBrowserApp/1.0"}
    try:
        resp = requests.get(
            f"{RADIO_BROWSER_BASE}/{endpoint}",
            params=params,
            headers=headers,
            timeout=8,
        )
        resp.raise_for_status()
        return resp.json(), None
    except requests.exceptions.Timeout:
        return None, ("Radio Browser API timed out.", 504)
    except requests.exceptions.RequestException as e:
        return None, (f"Error contacting Radio Browser API: {str(e)}", 502)


@stations_bp.route("/search", methods=["GET"])
def search():
    """
    Search stations by name.
    Query params: q (required), page (default 1)
    """
    query = request.args.get("q", "").strip()
    page = max(int(request.args.get("page", 1)), 1)
    limit = min(int(request.args.get("limit", PAGE_SIZE)), 200)

    if not query:
        return jsonify({"error": "Search query 'q' is required."}), 400

    offset = (page - 1) * PAGE_SIZE
    data, err = _radio_get(
        "stations/search",
        params={
            "name": query,
            "limit": limit,
            "offset": offset,
            "hidebroken": "true",
            "order": "clickcount",
            "reverse": "true",
        },
    )

    if err:
        return jsonify({"error": err[0]}), err[1]

    return jsonify({
        "stations": data,
        "page": page,
        "page_size": PAGE_SIZE,
        "has_next": len(data) == PAGE_SIZE,
    }), 200


@stations_bp.route("/genre/<string:genre>", methods=["GET"])
def by_genre(genre):
    """
    Filter stations by genre/tag.
    Query params: page (default 1)
    """
    page = max(int(request.args.get("page", 1)), 1)
    offset = (page - 1) * PAGE_SIZE
    limit = min(int(request.args.get("limit", PAGE_SIZE)), 200)

    data, err = _radio_get(
        "stations/search",
        params={
            "tag": genre,
            "limit": limit,
            "offset": offset,
            "hidebroken": "true",
            "order": "clickcount",
            "reverse": "true",
        },
    )

    if err:
        return jsonify({"error": err[0]}), err[1]

    return jsonify({
        "stations": data,
        "genre": genre,
        "page": page,
        "page_size": PAGE_SIZE,
        "has_next": len(data) == PAGE_SIZE,
    }), 200


@stations_bp.route("/country/<string:country_code>", methods=["GET"])
def by_country(country_code):
    """
    Filter stations by ISO 3166-1 alpha-2 country code (e.g. 'US', 'DE').
    Query params: page (default 1)
    """
    page = max(int(request.args.get("page", 1)), 1)
    offset = (page - 1) * PAGE_SIZE

    data, err = _radio_get(
        "stations/search",
        params={
            "countrycode": country_code.upper(),
            "limit": PAGE_SIZE,
            "offset": offset,
            "hidebroken": "true",
            "order": "clickcount",
            "reverse": "true",
        },
    )

    if err:
        return jsonify({"error": err[0]}), err[1]

    return jsonify({
        "stations": data,
        "country_code": country_code.upper(),
        "page": page,
        "page_size": PAGE_SIZE,
        "has_next": len(data) == PAGE_SIZE,
    }), 200


@stations_bp.route("/top", methods=["GET"])
def top_stations():
    """
    Returns top stations by click count (used for the /home landing page).
    Query params: page (default 1)
    """
    page = max(int(request.args.get("page", 1)), 1)
    limit = min(int(request.args.get("limit", PAGE_SIZE)), 200)
    offset = (page - 1) * PAGE_SIZE

    data, err = _radio_get(
        "stations/search",
        params={
            "limit": limit,
            "offset": offset,
            "hidebroken": "true",
            "order": "clickcount",
            "reverse": "true",
        },
    )

    if err:
        return jsonify({"error": err[0]}), err[1]

    return jsonify({
        "stations": data,
        "page": page,
        "page_size": PAGE_SIZE,
        "has_next": len(data) == PAGE_SIZE,
    }), 200


@stations_bp.route("/tags", methods=["GET"])
def tags():
    """Returns the top genre tags available in the Radio Browser API."""
    data, err = _radio_get("tags", params={"order": "stationcount", "reverse": "true", "limit": 50})
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify({"tags": data}), 200


@stations_bp.route("/countries", methods=["GET"])
def countries():
    """Returns all countries available in the Radio Browser API."""
    data, err = _radio_get("countries", params={"order": "stationcount", "reverse": "true"})
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify({"countries": data}), 200