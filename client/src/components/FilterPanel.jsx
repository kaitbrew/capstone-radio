import "./FilterPanel.css";

export default function FilterPanel({
  tags,
  countries,
  activeTag,
  activeCountry,
  onTagSelect,
  onCountrySelect,
}) {
  if (!tags.length && !countries.length) return null;

  const hasActiveFilters = activeTag || activeCountry;

  return (
    <div className="filter-panel">
      {tags.length > 0 && (
        <div className="filter-row">
          <span className="filter-label">Genre</span>
          <div className="filter-chips-wrapper">
            <div className="filter-chips">
              {tags.map(([tag, count]) => (
                <button
                  key={tag}
                  className={`filter-chip ${activeTag === tag ? "active" : ""}`}
                  onClick={() => onTagSelect(activeTag === tag ? null : tag)}
                >
                  {tag}
                  <span className="filter-chip-count">{count}</span>
                </button>
              ))}
            </div>
            <span className="filter-scroll-hint">scroll →</span>
          </div>
        </div>
      )}

      {countries.length > 0 && (
        <div className="filter-row">
          <span className="filter-label">Country</span>
          <div className="filter-chips-wrapper">
            <div className="filter-chips">
              {countries.map(([country, count]) => (
                <button
                  key={country}
                  className={`filter-chip ${activeCountry === country ? "active" : ""}`}
                  onClick={() => onCountrySelect(activeCountry === country ? null : country)}
                >
                  {country}
                  <span className="filter-chip-count">{count}</span>
                </button>
              ))}
            </div>
            <span className="filter-scroll-hint">scroll →</span>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="filter-active-bar">
          <span className="filter-active-label">
            Filtering by
            {activeTag && <strong> {activeTag}</strong>}
            {activeTag && activeCountry && " + "}
            {activeCountry && <strong> {activeCountry}</strong>}
          </span>
          <button
            className="filter-clear-btn"
            onClick={() => {
              onTagSelect(null);
              onCountrySelect(null);
            }}
          >
            × clear filters
          </button>
        </div>
      )}
    </div>
  );
}