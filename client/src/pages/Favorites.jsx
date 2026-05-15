import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { favoritesAPI } from "../api/client";
import StationCard from "../components/StationCard";
import PlayerModal from "../components/PlayerModal";
import "./Favorites.css";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [favoriteUuids, setFavoriteUuids] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    favoritesAPI
      .getAll()
      .then((data) => {
        setFavorites(data.favorites);
        setFavoriteUuids(new Set(data.favorites.map((f) => f.station_uuid)));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (station) => {
    const uuid = station.station_uuid;
    try {
      await favoritesAPI.remove(uuid);
      setFavorites((prev) => prev.filter((f) => f.station_uuid !== uuid));
      setFavoriteUuids((prev) => {
        const next = new Set(prev);
        next.delete(uuid);
        return next;
      });
    } catch (err) {
      console.error("Remove failed:", err.message);
    }
  };

  const normalizeForCard = (fav) => ({
    ...fav,
    stationuuid: fav.station_uuid,
    name: fav.station_name,
    url_resolved: fav.station_url,
    favicon: fav.station_favicon,
    tags: fav.station_tags,
    country: fav.station_country,
  });

  return (
    <main className="favorites">
      <section className="favorites-header">
        <h1 className="favorites-title">Your Favorites</h1>
        {!loading && favorites.length > 0 && (
          <p className="favorites-count">
            {favorites.length} saved station{favorites.length !== 1 ? "s" : ""}
          </p>
        )}
      </section>

      {loading && <p className="favorites-status">Loading favorites...</p>}
      {error && <p className="favorites-status favorites-error">{error}</p>}

      {!loading && !error && favorites.length === 0 && (
        <div className="favorites-empty">
          <div className="favorites-empty-icon">📻</div>
          <h2 className="favorites-empty-title">Nothing saved yet</h2>
          <p className="favorites-empty-body">
            Browse the airwaves and click ❤️ on any station to save it here.
          </p>
          <Link to="/" className="favorites-empty-cta">
            Discover stations →
          </Link>
        </div>
      )}

      <div className="favorites-grid">
        {favorites.map((fav) => (
          <StationCard
            key={fav.station_uuid}
            station={normalizeForCard(fav)}
            isFavorite={favoriteUuids.has(fav.station_uuid)}
            onFavoriteToggle={handleRemove}
            onClick={() => setSelectedStation(normalizeForCard(fav))}
          />
        ))}
      </div>

      {selectedStation && (
        <PlayerModal
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
        />
      )}
    </main>
  );
}