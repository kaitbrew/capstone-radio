import os
from app import create_app, db

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Database tables created.")
    port = int(os.environ.get("PORT", 5555))
    app.run(debug=True, port=port)