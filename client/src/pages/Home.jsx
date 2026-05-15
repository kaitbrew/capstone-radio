import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { stationsAPI, favoritesAPI } from "../api/client";
import { useAuth } from "../context/useAuth";
import StationCard from "../components/StationCard";
import PlayerModal from "../components/PlayerModal";
import Pagination from "../components/Pagination";
import FilterPanel from "../components/FilterPanel";
import "./Home.css";

const PAGE_SIZE = 20;

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stations, setStations] = useState([]);
  const [allStations, setAllStations] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Derived data ─────────────────────────────────────────

  const filteredStations = allStations
    .filter(
      (s) =>
        !activeTag ||
        s.tags
          ?.split(",")
          .map((t) => t.trim())
          .includes(activeTag),
    )
    .filter((s) => !activeCountry || s.country === activeCountry);

  const paginatedStations = filteredStations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const totalHasNext = filteredStations.length > page * PAGE_SIZE;

  // Tags calculated from country-filtered stations only
  const tagCounts = (
    activeCountry
      ? allStations.filter((s) => s.country === activeCountry)
      : allStations
  )
    .flatMap(
      (s) =>
        s.tags
          ?.split(",")
          .map((t) => t.trim())
          .filter(Boolean) || [],
    )
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // Countries calculated from tag-filtered stations only
  const countryCounts = (
    activeTag
      ? allStations.filter((s) =>
          s.tags
            ?.split(",")
            .map((t) => t.trim())
            .includes(activeTag),
        )
      : allStations
  ).reduce((acc, s) => {
    if (s.country) acc[s.country] = (acc[s.country] || 0) + 1;
    return acc;
  }, {});

  const sortedCountries = Object.entries(countryCounts).sort(
    (a, b) => b[1] - a[1],
  );

  // ── Helpers ───────────────────────────────────────────────

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleTagSelect = (tag) => {
    setActiveTag(tag);
    setPage(1);
  };

  const handleCountrySelect = (country) => {
    setActiveCountry(country);
    setPage(1);
  };

  // ── Data fetching ─────────────────────────────────────────

  const fetchStations = useCallback(async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const allData = searchQuery
        ? await stationsAPI.search(searchQuery, 1, 200)
        : await stationsAPI.top(1, 200);
      setAllStations(allData.stations);
      setStations(allData.stations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    favoritesAPI
      .getAll()
      .then((data) =>
        setFavorites(new Set(data.favorites.map((f) => f.station_uuid))),
      )
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchStations(activeQuery);
  }, [activeQuery, fetchStations]);

  // ── Handlers ──────────────────────────────────────────────

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveTag(null);
    setActiveCountry(null);
    setActiveQuery(query.trim());
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFavoriteToggle = async (station) => {
    if (!user) {
      showToast("Please log in to save favorites.");
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

  // ── Render ────────────────────────────────────────────────

  return (
    <main className="home">
      <section className="home-hero">
        <h1 className="home-title">KB Radio</h1>
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

      <FilterPanel
        tags={sortedTags}
        countries={sortedCountries}
        activeTag={activeTag}
        activeCountry={activeCountry}
        onTagSelect={handleTagSelect}
        onCountrySelect={handleCountrySelect}
      />

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
                setActiveTag(null);
                setActiveCountry(null);
                setPage(1);
              }}
            >
              Clear
            </button>
          </div>
        )}

        {loading && (
          <p className="home-status">
            Loading stations (this may take a moment)...
          </p>
        )}
        {error && <p className="home-status home-error">{error}</p>}

        {!loading && !error && filteredStations.length === 0 && (
          <p className="home-status">No stations found.</p>
        )}

        <div className="home-grid">
          {paginatedStations.map((station) => (
            <StationCard
              key={station.stationuuid}
              station={station}
              isFavorite={favorites.has(station.stationuuid)}
              onFavoriteToggle={handleFavoriteToggle}
              onClick={setSelectedStation}
            />
          ))}
        </div>

        {!loading && filteredStations.length > 0 && (
          <Pagination
            page={page}
            hasNext={totalHasNext}
            onPageChange={handlePageChange}
          />
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
