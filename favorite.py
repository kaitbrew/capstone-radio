from app import db


class Favorite(db.Model):
    __tablename__ = "favorites"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Radio Browser API uses UUID strings as station IDs
    station_uuid = db.Column(db.String(36), nullable=False)

    # Cache a few fields so favorites load without hitting the external API
    station_name = db.Column(db.String(200), nullable=False)
    station_url = db.Column(db.String(500), nullable=True)
    station_favicon = db.Column(db.String(500), nullable=True)
    station_tags = db.Column(db.String(500), nullable=True)
    station_country = db.Column(db.String(100), nullable=True)

    user = db.relationship("User", back_populates="favorites")

    __table_args__ = (
        db.UniqueConstraint("user_id", "station_uuid", name="unique_user_station"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "station_uuid": self.station_uuid,
            "station_name": self.station_name,
            "station_url": self.station_url,
            "station_favicon": self.station_favicon,
            "station_tags": self.station_tags,
            "station_country": self.station_country,
        }