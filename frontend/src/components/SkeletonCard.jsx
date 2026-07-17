function SkeletonCard({ variant = "food" }) {
  return (
    <article className={`skeleton-card skeleton-card-${variant}`} aria-hidden="true">
      <div className="skeleton-shimmer skeleton-photo" />
      <div className="skeleton-body">
        <div className="skeleton-shimmer skeleton-line skeleton-line-wide" />
        <div className="skeleton-shimmer skeleton-line" />
        <div className="skeleton-shimmer skeleton-line skeleton-line-short" />
      </div>
    </article>
  );
}

export function SkeletonGrid({ count = 6, variant = "food" }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} variant={variant} />
      ))}
    </div>
  );
}

export default SkeletonCard;
