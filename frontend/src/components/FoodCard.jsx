function FoodCard({
  item,
  imageSrc,
  fallbackImageSrc,
  isFavorite = false,
  favoriteDisabled = false,
  cartQuantity = 0,
  onToggleFavorite,
  onViewDetails,
  onAddToCart,
  onDecrease,
  onIncrease,
}) {
  const stock = Number(item.stock_quantity || 0);
  const threshold = Number(
    item.low_stock_threshold || 0
  );

  const isUnavailable =
    item.is_available === false || stock <= 0;

  const isLowStock =
    !isUnavailable &&
    threshold > 0 &&
    stock <= threshold;

  const tags = (item.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3);

  function handleImageError(event) {
    if (
      fallbackImageSrc &&
      event.currentTarget.src !== fallbackImageSrc
    ) {
      event.currentTarget.src = fallbackImageSrc;
      return;
    }

    event.currentTarget.style.display = "none";
  }

  return (
    <article
      className={
        isUnavailable
          ? "food-card food-card-unavailable"
          : "food-card"
      }
    >
      <div className="food-image-wrapper">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.name}
            className="food-image"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="food-image-placeholder">
            <span>🍽️</span>
            <small>{item.name}</small>
          </div>
        )}

        <button
          type="button"
          className={
            isFavorite
              ? "favorite-button saved"
              : "favorite-button"
          }
          onClick={() =>
            onToggleFavorite?.(item.id)
          }
          disabled={favoriteDisabled}
          aria-label={
            isFavorite
              ? `Remove ${item.name} from favorites`
              : `Add ${item.name} to favorites`
          }
        >
          {favoriteDisabled
            ? "…"
            : isFavorite
              ? "♥"
              : "♡"}
        </button>

        {Number(item.price || 0) <= 8 && (
          <span className="budget-badge">
            Student deal
          </span>
        )}

        {isUnavailable && (
          <span className="food-card-status-badge">
            Out of stock
          </span>
        )}
      </div>

      <div className="food-body">
        <div className="food-card-main">
          <div className="card-heading">
            <div className="food-title-group">
              <p className="food-category">
                Campus favorite
              </p>

              <h3>{item.name}</h3>
            </div>

            <strong className="price">
              $
              {Number(item.price || 0).toFixed(
                2
              )}
            </strong>
          </div>

          <p className="food-description">
            {item.description ||
              "Freshly prepared meal available near campus."}
          </p>

          {tags.length > 0 && (
            <div className="tag-row">
              {tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {item.ingredients && (
            <p className="ingredients-text">
              <strong>Ingredients:</strong>{" "}
              {item.ingredients}
            </p>
          )}
        </div>

        <div className="food-card-bottom">
          <div className="food-card-footer">
            <span
              className={
                isUnavailable
                  ? "availability-label out-of-stock"
                  : isLowStock
                    ? "availability-label low-stock"
                    : "availability-label"
              }
            >
              <span
                className="availability-dot"
                aria-hidden="true"
              />

              {isUnavailable
                ? "Out of stock"
                : isLowStock
                  ? `Only ${stock} left`
                  : `${stock} available`}
            </span>

            {onAddToCart &&
              (cartQuantity > 0 ? (
                <div className="menu-inline-quantity">
                  <button
                    type="button"
                    onClick={() =>
                      onDecrease?.(item.id)
                    }
                    aria-label={`Remove one ${item.name}`}
                  >
                    −
                  </button>

                  <span>{cartQuantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      onIncrease?.(item.id)
                    }
                    disabled={
                      cartQuantity >= stock
                    }
                    aria-label={`Add one ${item.name}`}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="card-action"
                  onClick={() =>
                    onAddToCart(item)
                  }
                  disabled={isUnavailable}
                >
                  {isUnavailable
                    ? "Unavailable"
                    : "Add to Cart"}
                </button>
              ))}
          </div>

          {onViewDetails && (
            <button
              type="button"
              className="meal-details-button"
              onClick={() =>
                onViewDetails(item)
              }
            >
              View meal details
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default FoodCard;