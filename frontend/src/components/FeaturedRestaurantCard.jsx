function FeaturedRestaurantCard({
  restaurant,
  image,
  onOpen,
}) {
  return (
    <article className="premium-restaurant-card">
      <div className="premium-restaurant-image">
        <img
          src={image}
          alt={restaurant.name}
        />

        <span>★ 4.8</span>
      </div>

      <div className="premium-card-content">
        <h3>{restaurant.name}</h3>

        <p>
          📍{" "}
          {restaurant.location ||
            "Near campus"}
        </p>

        <p>
          🕒{" "}
          {restaurant.hours ||
            "Hours unavailable"}
        </p>

        <button
          type="button"
          onClick={() =>
            onOpen?.(restaurant, image)
          }
        >
          View restaurant
        </button>
      </div>
    </article>
  );
}

export default FeaturedRestaurantCard;
