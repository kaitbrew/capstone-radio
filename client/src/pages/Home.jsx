import { useState, useEffect, useCallback } from "react";
import { stationsAPI, favoritesAPI } from "../api/client";
import { useAuth } from "../context/useAuth";
import StationCard from "../components/StationCard";
import PlayerModal from "../components/PlayerModal";
import Pagination from "../components/Pagination";
import "./Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();

  const [stations, setStations] = useState([]);
  const [favorites, setFavorites] = useState(new Set()); // set of station UUIDs
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState(""); // what was actually searched
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  // Fetch favorites so we can show heart state on cards
  useEffect(() => {
    if (!user) return;
    favoritesAPI
      .getAll()
      .then((data) => setFavorites(new Set(data.favorites.map((f) => f.station_uuid))))
      .catch(() => {});
  }, [user]);

  const fetchStations = useCallback(async (searchQuery, pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const data = searchQuery
        ? await stationsAPI.search(searchQuery, pageNum)
        : await stationsAPI.top(pageNum);
      setStations(data.stations);
      setHasNext(data.has_next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  //toast helper to show messages for actions like adding/removing favorites, errors, etc.
  const showToast = (message) => {
  setToast(message);
  setTimeout(() => setToast(null), 3000);
};

  // Fetch whenever page or activeQuery changes
  useEffect(() => {
    fetchStations(activeQuery, page);
  }, [activeQuery, page, fetchStations]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveQuery(query.trim());
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

const handleFavoriteToggle = async (station) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const uuid = station.stationuuid;
    try {
      if (favorites.has(uuid)) {
        await favoritesAPI.remove(uuid);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(uuid);
          return next;
        });
      } else {
        await favoritesAPI.add(station);
        setFavorites((prev) => new Set(prev).add(uuid));
        showToast("Station added to favorites!");
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err.message);
      showToast("Failed to update favorite status.");
    }
  };

  return (
    <main className="home">
      <section className="home-hero">
        <h1 className="home-title">Discover Radio</h1>
        <p className="home-subtitle">50,000+ stations from around the world</p>

        <form className="home-search" onSubmit={handleSearch}>
          <input
            className="home-search-input"
            type="text"
            placeholder="Search stations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="home-search-btn" type="submit">
            Search
          </button>
        </form>
      </section>

      <section className="home-results">
        {activeQuery && (
          <div className="home-results-header">
            <p>
              Results for <strong>"{activeQuery}"</strong>
            </p>
            <button
              className="home-clear"
              onClick={() => {
                setQuery("");
                setActiveQuery("");
                setPage(1);
              }}
            >
              Clear
            </button>
          </div>
        )}

        {loading && <p className="home-status">Loading stations...</p>}
        {error && <p className="home-status home-error">{error}</p>}

        {!loading && !error && stations.length === 0 && (
          <p className="home-status">No stations found.</p>
        )}

        <div className="home-grid">
          {stations.map((station) => (
            <StationCard
              key={station.stationuuid}
              station={station}
              isFavorite={favorites.has(station.stationuuid)}
              onFavoriteToggle={handleFavoriteToggle}
              onClick={setSelectedStation}
            />
          ))}
        </div>

        {!loading && stations.length > 0 && (
          <Pagination page={page} hasNext={hasNext} onPageChange={handlePageChange} />
        )}
      </section>

      {selectedStation && (
        <PlayerModal
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}