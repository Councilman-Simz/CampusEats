function FeaturedMealCard({
  item,
  imageSrc,
  onOpen,
}) {
  return (
    <article className="premium-meal-card">
      <img
        src={imageSrc}
        alt={item.name}
      />

      <div>
        <span>
          Restaurant #{item.restaurant_id}
        </span>

        <h3>{item.name}</h3>

        <p>
          {item.description ||
            "Fresh meal available near campus."}
        </p>

        <div className="premium-meal-footer">
          <strong>
            ${Number(item.price || 0).toFixed(2)}
          </strong>

          <button
            type="button"
            onClick={() => onOpen?.(item)}
          >
            View meal
          </button>
        </div>
      </div>
    </article>
  );
}

export default FeaturedMealCard;
