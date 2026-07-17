import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import healthyBowl from "../assets/food/healthy-spinach-bowl.jpg";
import bbqPlatter from "../assets/food/grilled-bbq-platter.jpg";
import pizza from "../assets/food/hawaiian-chicken-pizza.jpg";
import cheesecake from "../assets/food/orange-cheesecake.jpg";
import skewers from "../assets/food/grilled-beef-skewers.jpg";
import bbqChicken from "../assets/food/bbq-sausages-and-chicken.jpg";

function getFoodImage(name = "", tags = "", category = "") {
  const text = `${name} ${tags} ${category}`.toLowerCase();

  if (text.includes("pizza")) return pizza;

  if (
    text.includes("bbq") ||
    text.includes("grill") ||
    text.includes("sausage")
  ) {
    return bbqChicken;
  }

  if (
    text.includes("chicken") ||
    text.includes("wings") ||
    text.includes("barbecue")
  ) {
    return bbqPlatter;
  }

  if (
    text.includes("bowl") ||
    text.includes("salad") ||
    text.includes("healthy") ||
    text.includes("spinach") ||
    text.includes("vegan")
  ) {
    return healthyBowl;
  }

  if (
    text.includes("dessert") ||
    text.includes("cake") ||
    text.includes("cheesecake")
  ) {
    return cheesecake;
  }

  if (
    text.includes("beef") ||
    text.includes("steak") ||
    text.includes("kebab") ||
    text.includes("skewer")
  ) {
    return skewers;
  }

  return healthyBowl;
}

function RestaurantDetails({ restaurant, onBack }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isRestaurantFavorite, setIsRestaurantFavorite] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("favoriteRestaurants") || "[]"
      );

      return saved.includes(restaurant.id);
    } catch {
      return false;
    }
  });

  const [mealFavorites, setMealFavorites] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("menuFavorites") || "[]"
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function loadRestaurantMenu() {
      setLoading(true);
      setMessage("");

      try {
        const response = await api.get("/menu/");
        const allItems = Array.isArray(response.data)
          ? response.data
          : [];

        const restaurantItems = allItems.filter(
          (item) =>
            Number(item.restaurant_id) === Number(restaurant.id)
        );

        setMenuItems(restaurantItems);
      } catch (error) {
        console.error("Restaurant menu loading failed:", error);
        setMessage("Could not load this restaurant's menu.");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurantMenu();
  }, [restaurant.id]);

  const lowestPrice = useMemo(() => {
    if (menuItems.length === 0) {
      return null;
    }

    return Math.min(
      ...menuItems.map((item) => Number(item.price) || 0)
    );
  }, [menuItems]);

  function toggleRestaurantFavorite() {
    let savedRestaurants = [];

    try {
      savedRestaurants = JSON.parse(
        localStorage.getItem("favoriteRestaurants") || "[]"
      );
    } catch {
      savedRestaurants = [];
    }

    const updated = savedRestaurants.includes(restaurant.id)
      ? savedRestaurants.filter((id) => id !== restaurant.id)
      : [...savedRestaurants, restaurant.id];

    localStorage.setItem(
      "favoriteRestaurants",
      JSON.stringify(updated)
    );

    setIsRestaurantFavorite(updated.includes(restaurant.id));
  }

  function toggleMealFavorite(itemId) {
    setMealFavorites((current) => {
      const updated = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];

      localStorage.setItem(
        "menuFavorites",
        JSON.stringify(updated)
      );

      return updated;
    });
  }

  return (
    <section className="restaurant-details-page">
      <div className="restaurant-details-topbar">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to restaurants
        </button>

        <button
          type="button"
          className={
            isRestaurantFavorite
              ? "restaurant-favorite-button saved"
              : "restaurant-favorite-button"
          }
          onClick={toggleRestaurantFavorite}
          aria-label={
            isRestaurantFavorite
              ? "Remove restaurant from favorites"
              : "Save restaurant"
          }
        >
          {isRestaurantFavorite ? "♥" : "♡"}
        </button>
      </div>

      <div
        className="restaurant-detail-hero"
        style={{
          backgroundImage: `
            linear-gradient(
              100deg,
              rgba(10, 37, 25, 0.95),
              rgba(27, 67, 50, 0.56)
            ),
            url("${restaurant.image}")
          `,
        }}
      >
        <div className="restaurant-detail-content">
          <span className="hero-pill">
            Featured restaurant
          </span>

          <h1>{restaurant.name}</h1>

          <div className="restaurant-hero-details">
            <span>
              📍 {restaurant.location || "Location unavailable"}
            </span>

            <span>
              🕒 {restaurant.hours || "Hours unavailable"}
            </span>
          </div>

          <div className="restaurant-meta-row">
            <span>★ 4.8 rating</span>
            <span>Student friendly</span>
            <span>Nearby</span>

            {lowestPrice !== null && (
              <span>
                Meals from ${lowestPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="restaurant-summary-grid">
        <article className="restaurant-summary-card">
          <div className="restaurant-summary-icon">🍽️</div>

          <div>
            <strong>{menuItems.length}</strong>
            <span>Menu items</span>
          </div>
        </article>

        <article className="restaurant-summary-card">
          <div className="restaurant-summary-icon">⭐</div>

          <div>
            <strong>4.8</strong>
            <span>Average rating</span>
          </div>
        </article>

        <article className="restaurant-summary-card">
          <div className="restaurant-summary-icon">💵</div>

          <div>
            <strong>
              {lowestPrice === null
                ? "—"
                : `$${lowestPrice.toFixed(2)}`}
            </strong>
            <span>Starting price</span>
          </div>
        </article>
      </div>

      <div className="restaurant-section-heading">
        <div>
          <p className="eyebrow">Available today</p>
          <h2>Menu</h2>
        </div>

        <span className="count-badge">
          {menuItems.length} items
        </span>
      </div>

      {loading && (
        <p className="status-message">
          Loading restaurant menu...
        </p>
      )}

      {message && (
        <p className="error-message">
          {message}
        </p>
      )}

      {!loading && menuItems.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <h3>No menu items available</h3>
          <p>
            This restaurant has not added any meals yet.
          </p>
        </div>
      )}

      <div className="restaurant-menu-grid">
        {menuItems.map((item) => {
          const isFavorite = mealFavorites.includes(item.id);

          return (
            <article
              className="restaurant-menu-card"
              key={item.id}
            >
              <div className="restaurant-menu-image-wrapper">
                <img
                  src={getFoodImage(item.name, item.tags)}
                  alt={item.name}
                />

                <button
                  type="button"
                  className={
                    isFavorite
                      ? "favorite-button saved"
                      : "favorite-button"
                  }
                  onClick={() =>
                    toggleMealFavorite(item.id)
                  }
                  aria-label={
                    isFavorite
                      ? `Remove ${item.name} from favorites`
                      : `Save ${item.name}`
                  }
                >
                  {isFavorite ? "♥" : "♡"}
                </button>

                {Number(item.price) <= 8 && (
                  <span className="budget-badge">
                    Student deal
                  </span>
                )}
              </div>

              <div className="restaurant-menu-body">
                <div className="card-heading">
                  <h3>{item.name}</h3>

                  <strong className="price">
                    ${Number(item.price).toFixed(2)}
                  </strong>
                </div>

                <p className="restaurant-menu-description">
                  {item.description ||
                    "Fresh meal available today."}
                </p>

                <div className="tag-row">
                  {(item.tags || "")
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                </div>

                {item.ingredients && (
                  <p className="ingredients-text">
                    <strong>Ingredients:</strong>{" "}
                    {item.ingredients}
                  </p>
                )}

                <button
                  type="button"
                  className="card-action"
                  onClick={() =>
                    window.alert(
                      `${item.name} costs $${Number(
                        item.price
                      ).toFixed(2)}`
                    )
                  }
                >
                  View meal details
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RestaurantDetails;