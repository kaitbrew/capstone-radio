import { useEffect, useRef, useState } from "react";
import "./PlayerModal.css";

export default function PlayerModal({ station, onClose }) {
  const [streamError, setStreamError] = useState(null);
  const audioRef = useRef(null);

  const streamUrl = station?.url_resolved || station?.station_url;

  // Handle station changes properly
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !streamUrl) return;

    setStreamError(null);

    // Fully reset previous stream
    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    // Assign new stream
    audio.src = streamUrl;

    // Force reload + autoplay
    audio.load();

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.error("Playback failed:", err);
        setStreamError(
          "This stream couldn't be played by your browser."
        );
      });
    }

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
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

        <h2 className="modal-name">
          {station.name || station.station_name}
        </h2>

        <p className="modal-meta">
          {[
            station.country || station.station_country,
            station.tags?.split(",")[0] ||
              station.station_tags?.split(",")[0],
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {streamUrl ? (
          <audio
            ref={audioRef}
            className="modal-player"
            controls
            onError={() =>
              setStreamError(
                "This stream couldn't be loaded. It may be unavailable or unsupported by your browser."
              )
            }
          />
        ) : (
          <p className="modal-no-stream">
            No stream URL available.
          </p>
        )}

        {streamError && (
          <p className="modal-error">{streamError}</p>
        )}
      </div>
    </div>
  );
}