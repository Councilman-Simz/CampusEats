import { useEffect, useState } from "react";
import api from "../services/api";

import healthyBowl from "../assets/food/healthy-spinach-bowl.jpg";
import bbqPlatter from "../assets/food/grilled-bbq-platter.jpg";
import pizza from "../assets/food/hawaiian-chicken-pizza.jpg";
import cheesecake from "../assets/food/orange-cheesecake.jpg";
import skewers from "../assets/food/grilled-beef-skewers.jpg";
import bbqChicken from "../assets/food/bbq-sausages-and-chicken.jpg";

function getFoodImage(name = "", tags = "", category = "") {
  const text = `${name} ${tags} ${category}`.toLowerCase();

  if (text.includes("pizza")) {
    return pizza;
  }

  if (
    text.includes("bbq") ||
    text.includes("sausage")
  ) {
    return bbqChicken;
  }

  if (
    text.includes("chicken") ||
    text.includes("wings") ||
    text.includes("barbecue") ||
    text.includes("burger")
  ) {
    return bbqPlatter;
  }

  if (
    text.includes("beef") ||
    text.includes("steak") ||
    text.includes("kebab") ||
    text.includes("skewer")
  ) {
    return skewers;
  }

  if (
    text.includes("dessert") ||
    text.includes("cake") ||
    text.includes("cheesecake") ||
    text.includes("muffin")
  ) {
    return cheesecake;
  }

  if (
    text.includes("salad") ||
    text.includes("bowl") ||
    text.includes("vegan") ||
    text.includes("healthy") ||
    text.includes("spinach") ||
    text.includes("tofu")
  ) {
    return healthyBowl;
  }

  return healthyBowl;
}

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [removingIds, setRemovingIds] = useState([]);

  async function loadFavorites() {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/favorites/", {
        params: {
          user_id: 1,
        },
      });

      setFavorites(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Failed to load favorites:", error);

      setMessage(
        error.response?.data?.detail ||
          "Unable to load favorites."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  async function removeFavorite(itemId) {
    if (removingIds.includes(itemId)) {
      return;
    }

    setRemovingIds((currentIds) => [
      ...currentIds,
      itemId,
    ]);

    try {
      await api.delete(`/favorites/${itemId}`, {
        params: {
          user_id: 1,
        },
      });

      setFavorites((currentFavorites) =>
        currentFavorites.filter(
          (item) => item.id !== itemId
        )
      );
    } catch (error) {
      console.error("Failed to remove favorite:", error);

      setMessage(
        error.response?.data?.detail ||
          "Unable to remove favorite."
      );
    } finally {
      setRemovingIds((currentIds) =>
        currentIds.filter((id) => id !== itemId)
      );
    }
  }

  function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return "Price unavailable";
    }

    return `$${numericPrice.toFixed(2)}`;
  }

  return (
    <main className="favorites-page">
      <section className="favorites-header">
        <span className="search-eyebrow">
          Saved meals
        </span>

        <h1>My Favorites</h1>

        <p>
          Meals you saved for quick access.
        </p>
      </section>

      {loading && (
        <div className="favorites-state">
          <div className="search-spinner" />
          <h2>Loading favorites</h2>
          <p>Fetching your saved meals...</p>
        </div>
      )}

      {!loading && message && (
        <div className="favorites-state favorites-error">
          <span>⚠️</span>
          <h2>Favorites update</h2>
          <p>{message}</p>
        </div>
      )}

      {!loading &&
        !message &&
        favorites.length === 0 && (
          <div className="favorites-state">
            <span className="favorites-empty-icon">
              ♡
            </span>

            <h2>No favorites yet</h2>

            <p>
              Search for meals and click the heart icon to save them.
            </p>
          </div>
        )}

      {!loading && favorites.length > 0 && (
        <section className="favorites-grid">
          {favorites.map((item) => {
            const tags = (item.tags || "")
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean);

            const isRemoving =
              removingIds.includes(item.id);

            return (
              <article
                className="favorite-meal-card"
                key={item.id}
              >
                <div className="favorite-meal-image">
                  <img
  src={
    item.image_url ||
    getFoodImage(
      item.name,
      item.tags,
      item.category
    )
  }
  alt={item.name}
  onError={(event) => {
    event.currentTarget.src = getFoodImage(
      item.name,
      item.tags,
      item.category
    );
  }}
/>

                  <span className="favorite-heart-badge">
                    ♥
                  </span>
                </div>

                <div className="favorite-meal-content">
                  <span className="favorite-restaurant-label">
                    Restaurant #{item.restaurant_id}
                  </span>

                  <div className="favorite-title-row">
                    <h2>{item.name}</h2>

                    <strong>
                      {formatPrice(item.price)}
                    </strong>
                  </div>

                  <p>
                    {item.description ||
                      "A saved CampusEats meal."}
                  </p>

                  <div className="favorite-tags">
                    {tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="remove-favorite-button"
                    onClick={() =>
                      removeFavorite(item.id)
                    }
                    disabled={isRemoving}
                  >
                    {isRemoving
                      ? "Removing..."
                      : "Remove from favorites"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default Favorites;