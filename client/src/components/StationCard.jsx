import "./StationCard.css";

export default function StationCard({ station, isFavorite, onFavoriteToggle, onClick }) {
  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // prevent opening the player modal
    onFavoriteToggle(station);
  };

  return (
    <div className="station-card" onClick={() => onClick(station)}>
      <div className="station-card-favicon">
        {station.favicon ? (
          <img
            src={station.favicon}
            alt={station.name}
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          <span className="station-card-favicon-fallback">📻</span>
        )}
      </div>

      <div className="station-card-info">
        <h3 className="station-card-name">{station.name}</h3>
        <p className="station-card-meta">
          {[station.country, station.tags?.split(",")[0]]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <button
        className={`station-card-fav ${isFavorite ? "is-favorite" : ""}`}
        onClick={handleFavoriteClick}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? "❤️" : "🤍"}
      </button>
    </div>
  );
}