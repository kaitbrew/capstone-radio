import { useEffect, useRef } from "react";
import "./PlayerModal.css";

export default function PlayerModal({ station, onClose }) {
  const audioRef = useRef(null);

  // Stop audio when modal closes or station changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [station]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!station) return null;

  const streamUrl = station.url_resolved || station.station_url;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-favicon">
          {station.favicon || station.station_favicon ? (
            <img
              src={station.favicon || station.station_favicon}
              alt={station.name || station.station_name}
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <span className="modal-favicon-fallback">📻</span>
          )}
        </div>

        <h2 className="modal-name">{station.name || station.station_name}</h2>

        <p className="modal-meta">
          {[
            station.country || station.station_country,
            station.tags?.split(",")[0] || station.station_tags?.split(",")[0],
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {streamUrl ? (
          <audio
            ref={audioRef}
            className="modal-player"
            src={streamUrl}
            controls
            autoPlay
          />
        ) : (
          <p className="modal-no-stream">No stream URL available.</p>
        )}
      </div>
    </div>
  );
}