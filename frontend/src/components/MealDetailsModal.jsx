function MealDetailsModal({
  item,
  restaurant,
  isFavorite,
  onToggleFavorite,
  onClose,
}) {
  if (!item) {
    return null;
  }

  const tags = (item.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <div
      className="meal-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="meal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meal-modal-title"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className="meal-modal-close"
          onClick={onClose}
          aria-label="Close meal details"
        >
          ×
        </button>

        {item.image_url && (
          <img
            className="meal-modal-image"
            src={item.image_url}
            alt={item.name}
          />
        )}

        <div className="meal-modal-header">
          <span className="owner-kicker">
            {restaurant?.name || "Meal details"}
          </span>

          <h2 id="meal-modal-title">
            {item.name}
          </h2>

          <strong className="meal-modal-price">
            ${Number(item.price || 0).toFixed(2)}
          </strong>
        </div>

        <p className="meal-modal-description">
          {item.description ||
            "Fresh meal available today."}
        </p>

        {tags.length > 0 && (
          <div className="tag-row">
            {tags.map((tag) => (
              <span
                className="tag"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="meal-modal-details">
          <div>
            <span>Ingredients</span>
            <p>
              {item.ingredients ||
                "Ingredients not provided."}
            </p>
          </div>

          <div>
            <span>Availability</span>
            <p>
              {item.is_available === false
                ? "Currently unavailable"
                : Number(item.stock_quantity || 0) > 0
                  ? `${Number(
                      item.stock_quantity
                    )} available`
                  : "Available today"}
            </p>
          </div>
        </div>

        <div className="meal-modal-actions">
          <button
            type="button"
            className={
              isFavorite
                ? "meal-modal-favorite saved"
                : "meal-modal-favorite"
            }
            onClick={() =>
              onToggleFavorite?.(item.id)
            }
          >
            {isFavorite
              ? "♥ Remove favorite"
              : "♡ Add to favorites"}
          </button>

          <button
            type="button"
            className="owner-secondary-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

export default MealDetailsModal;
