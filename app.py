from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    bcrypt.init_app(app)

    CORS(app,
         supports_credentials=True,
         origins=[
             "http://localhost:5173",
             "http://localhost:5174",
             "https://kb-radio.onrender.com",
             "https://kb-radio-client.onrender.com"
         ],
         allow_headers=["Content-Type"],
         methods=["GET", "POST", "DELETE", "OPTIONS"])

    from routes.auth import auth_bp
    from routes.stations import stations_bp
    from routes.favorites import favorites_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(stations_bp)
    app.register_blueprint(favorites_bp)

    with app.app_context():
        db.create_all()

    return app