import { useEffect, useRef, useState } from "react";
import "./PlayerModal.css";

export default function PlayerModal({ station, onClose }) {
  const [streamError, setStreamError] = useState(null);
  const audioRef = useRef(null);

  const streamUrl = station?.url_resolved || station?.station_url;

  // Handle station changes properly
  useEffect(() => {
  const audio = audioRef.current;

  setStreamError(null);

  if (!audio || !streamUrl) return;

  audio.pause();
  audio.src = streamUrl;

  const handleError = () => {
    setStreamError("This stream couldn't be played.");
  };

  const handleCanPlay = () => {
    setStreamError(null);
  };

  audio.addEventListener("error", handleError);
  audio.addEventListener("canplay", handleCanPlay);

  audio.play().catch((err) => {
    console.log("Autoplay prevented:", err);
  });

  return () => {
    audio.pause();
    audio.removeEventListener("error", handleError);
    audio.removeEventListener("canplay", handleCanPlay);
  };
}, [streamUrl]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  if (!station) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

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
          <audio ref={audioRef} className="modal-player" controls />
        ) : (
          <p className="modal-no-stream">No stream URL available.</p>
        )}

        {streamError && <p className="modal-error">{streamError}</p>}
      </div>
    </div>
  );
}
