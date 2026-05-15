import "./SkeletonCard.css";

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-favicon" />
      <div className="skeleton-line skeleton-name" />
      <div className="skeleton-line skeleton-meta" />
    </div>
  );
}