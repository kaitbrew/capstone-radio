import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///radio_browser.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False


SESSION_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = "Lax"
