import "./Pagination.css";

export default function Pagination({ page, hasNext, onPageChange }) {
  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ← Prev
      </button>

      <span className="pagination-page">Page {page}</span>

      <button
        className="pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
      >
        Next →
      </button>
    </div>
  );
}