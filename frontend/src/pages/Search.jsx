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

function normalizeResults(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

function Search({ onOpenRestaurant }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteLoadingIds, setFavoriteLoadingIds] =
    useState([]);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const response = await api.get("/favorites/", {
          params: {
            user_id: 1,
          },
        });

        const items = Array.isArray(response.data)
          ? response.data
          : [];

        setFavoriteIds(items.map((item) => item.id));
      } catch (error) {
        console.error(
          "Failed to load favorites:",
          error
        );
      }
    }

    loadFavorites();
  }, []);

  const suggestions = [
    "Pizza under $15",
    "Healthy lunch",
    "Vegan meals",
    "Chicken and rice",
    "Burger deals",
  ];

  async function handleSearch(searchQuery = query) {
    const cleanQuery = searchQuery.trim();

    if (!cleanQuery) {
      setMessage(
        "Enter a food, dietary preference, or budget."
      );
      setResults([]);
      return;
    }

    localStorage.setItem(
      "lastFoodSearch",
      cleanQuery
    );

    setLoading(true);
    setHasSearched(true);
    setMessage("");
    setQuery(cleanQuery);

    try {
      const response = await api.get("/search/", {
        params: {
          query: cleanQuery,
          limit: 10,
        },
      });

      const searchResults = normalizeResults(
        response.data
      );

      setResults(searchResults);

      if (searchResults.length === 0) {
        setMessage(
          `No meals found for "${cleanQuery}".`
        );
      }
    } catch (error) {
      console.error("Search failed:", error);

      const detail =
        error.response?.data?.detail;

      setMessage(
        typeof detail === "string"
          ? detail
          : "Unable to connect to CampusEats search."
      );

      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleSearch();
  }

  function handleSuggestionClick(suggestion) {
    setQuery(suggestion);
    handleSearch(suggestion);
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setMessage("");
    setHasSearched(false);
  }

  async function toggleFavorite(itemId) {
    if (
      favoriteLoadingIds.includes(itemId)
    ) {
      return;
    }

    const isFavorite =
      favoriteIds.includes(itemId);

    setFavoriteLoadingIds((currentIds) => [
      ...currentIds,
      itemId,
    ]);

    try {
      if (isFavorite) {
        await api.delete(
          `/favorites/${itemId}`,
          {
            params: {
              user_id: 1,
            },
          }
        );

        setFavoriteIds((currentIds) =>
          currentIds.filter(
            (id) => id !== itemId
          )
        );
      } else {
        await api.post(
          `/favorites/${itemId}`,
          null,
          {
            params: {
              user_id: 1,
            },
          }
        );

        setFavoriteIds((currentIds) => [
          ...currentIds,
          itemId,
        ]);
      }
    } catch (error) {
      console.error(
        "Favorite update failed:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Unable to update favorite."
      );
    } finally {
      setFavoriteLoadingIds(
        (currentIds) =>
          currentIds.filter(
            (id) => id !== itemId
          )
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

  function getRestaurantName(item) {
    return (
      item.restaurant_name ||
      item.restaurant?.name ||
      `Restaurant #${item.restaurant_id}`
    );
  }

  function openRestaurant(item) {
    if (
      typeof onOpenRestaurant !== "function"
    ) {
      return;
    }

    onOpenRestaurant(
      item.restaurant &&
        typeof item.restaurant === "object"
        ? item.restaurant
        : {
            id: item.restaurant_id,
            name: getRestaurantName(item),
          }
    );
  }

  return (
    <main className="modern-search-page">
      <section className="modern-search-header">
        <span className="search-eyebrow">
          AI-powered food discovery
        </span>

        <h1>Find your next meal</h1>

        <p>
          Search by food, dietary preference,
          ingredient, restaurant, or budget.
        </p>

        <form
          className="modern-search-form"
          onSubmit={handleSubmit}
        >
          <div className="modern-search-input">
            <span
              className="modern-search-icon"
              aria-hidden="true"
            >
              ⌕
            </span>

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Try: healthy food under $10"
              aria-label="Search CampusEats"
            />

            {query && (
              <button
                type="button"
                className="clear-search-button"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="submit"
            className="modern-search-button"
            disabled={loading}
          >
            {loading
              ? "Searching..."
              : "Search"}
          </button>
        </form>

        <div className="modern-search-suggestions">
          <strong>Popular:</strong>

          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() =>
                handleSuggestionClick(
                  suggestion
                )
              }
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      <section className="modern-search-results">
        {loading && (
          <div className="search-status-card">
            <div className="search-spinner" />

            <div>
              <h2>
                Finding the best matches
              </h2>

              <p>
                CampusEats is searching the
                available menu.
              </p>
            </div>
          </div>
        )}

        {!loading && message && (
          <div className="search-status-card">
            <span className="search-status-icon">
              🍽️
            </span>

            <div>
              <h2>Search update</h2>
              <p>{message}</p>
            </div>
          </div>
        )}

        {!loading &&
          !hasSearched &&
          !message && (
            <div className="search-intro-panel">
              <div className="search-intro-copy">
                <span className="search-eyebrow">
                  Search naturally
                </span>

                <h2>
                  Tell us what you are craving
                </h2>

                <p>
                  Search using a meal name,
                  ingredient, dietary preference,
                  restaurant, or price.
                </p>
              </div>

              <div className="search-example-grid">
                <button
                  type="button"
                  onClick={() =>
                    handleSuggestionClick(
                      "Healthy food under $10"
                    )
                  }
                >
                  <span>🥗</span>

                  <div>
                    <strong>
                      Healthy and affordable
                    </strong>

                    <small>
                      Healthy food under $10
                    </small>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSuggestionClick(
                      "High-protein chicken"
                    )
                  }
                >
                  <span>🍗</span>

                  <div>
                    <strong>
                      Protein-focused
                    </strong>

                    <small>
                      High-protein chicken
                    </small>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSuggestionClick(
                      "Vegetarian lunch"
                    )
                  }
                >
                  <span>🌱</span>

                  <div>
                    <strong>
                      Vegetarian options
                    </strong>

                    <small>
                      Vegetarian lunch
                    </small>
                  </div>
                </button>
              </div>
            </div>
          )}

        {!loading &&
          results.length > 0 && (
            <>
              <div className="modern-results-heading">
                <div>
                  <span className="search-eyebrow">
                    Search results
                  </span>

                  <h2>
                    {results.length} result
                    {results.length !== 1
                      ? "s"
                      : ""}{" "}
                    found
                  </h2>
                </div>

                <p>
                  Results for{" "}
                  <strong>
                    “{query}”
                  </strong>
                </p>
              </div>

              <div className="modern-results-list">
                {results.map(
                  (item, index) => {
                    const itemId =
                      item.id ?? index;

                    const itemName =
                      item.name ||
                      "Campus meal";

                    const tags = (
                      item.tags || ""
                    )
                      .split(",")
                      .map((tag) =>
                        tag.trim()
                      )
                      .filter(Boolean);

                    const isFavorite =
                      favoriteIds.includes(
                        itemId
                      );

                    const isUpdatingFavorite =
                      favoriteLoadingIds.includes(
                        itemId
                      );

                    return (
                      <article
                        className="modern-result-card"
                        key={itemId}
                      >
                        <div className="modern-result-image">
                          <img
                            src={
                              item.image_url ||
                              getFoodImage(
                                itemName,
                                item.tags,
                                item.category
                              )
                            }
                            alt={itemName}
                            onError={(event) => {
                              event.currentTarget.src =
                                getFoodImage(
                                  itemName,
                                  item.tags,
                                  item.category
                                );
                            }}
                          />

                          <span className="result-rating">
                            ★{" "}
                            {(
                              4.6 +
                              (index % 3) *
                                0.1
                            ).toFixed(1)}
                          </span>
                        </div>

                        <div className="modern-result-content">
                          <div className="restaurant-badge">
                            <span>🍴</span>
                            {getRestaurantName(
                              item
                            )}
                          </div>

                          <h3>{itemName}</h3>

                          <p className="result-description">
                            {item.description ||
                              "A fresh CampusEats meal available near campus."}
                          </p>

                          <div className="modern-result-tags">
                            {tags
                              .slice(0, 4)
                              .map(
                                (
                                  tag,
                                  tagIndex
                                ) => (
                                  <span
                                    key={tag}
                                    className={`result-tag result-tag-${
                                      (tagIndex %
                                        4) +
                                      1
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                )
                              )}
                          </div>

                          <div className="modern-result-footer">
                            <strong className="modern-result-price">
                              {formatPrice(
                                item.price
                              )}
                            </strong>

                            <div className="modern-result-actions">
                              <button
                                type="button"
                                className="view-details-button"
                                onClick={() =>
                                  openRestaurant(
                                    item
                                  )
                                }
                              >
                                View details
                              </button>

                              <button
                                type="button"
                                className={`favorite-result-button ${
                                  isFavorite
                                    ? "favorite-active"
                                    : ""
                                }`}
                                onClick={() =>
                                  toggleFavorite(
                                    itemId
                                  )
                                }
                                disabled={
                                  isUpdatingFavorite
                                }
                                aria-label={
                                  isFavorite
                                    ? "Remove from favorites"
                                    : "Add to favorites"
                                }
                              >
                                {isUpdatingFavorite
                                  ? "…"
                                  : isFavorite
                                    ? "♥"
                                    : "♡"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </>
          )}
      </section>
    </main>
  );
}

export default Search;
