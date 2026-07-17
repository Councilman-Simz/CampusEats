import { useEffect } from "react";
import { X } from "lucide-react";
import FoodPhotoArt from "./FoodPhotoArt";

function ItemModal({ item, isFavorite, onClose, onToggleFavorite }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!item) {
    return null;
  }

  const tags = (item.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-modal-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="modal-photo-wrap">
          <FoodPhotoArt
            name={item.name}
            tags={item.tags}
            ingredients={item.ingredients}
          />
        </div>

        <div className="modal-body">
          <div className="modal-heading">
            <div>
              <p className="eyebrow">Menu item</p>
              <h2 id="item-modal-title">{item.name}</h2>
            </div>
            <strong className="price">${Number(item.price).toFixed(2)}</strong>
          </div>

          <p className="modal-description">
            {item.description || "Freshly prepared meal available near campus."}
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
              <strong>Ingredients:</strong> {item.ingredients}
            </p>
          )}

          {onToggleFavorite && (
            <button
              type="button"
              className={
                isFavorite ? "favorite-toggle saved" : "favorite-toggle"
              }
              onClick={() => onToggleFavorite(item.id)}
            >
              {isFavorite ? "♥ Saved to favorites" : "♡ Add to favorites"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemModal;
