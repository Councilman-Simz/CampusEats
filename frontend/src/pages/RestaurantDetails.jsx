import {
  useEffect,
  useMemo,
  useState,
} from "react";

import MealDetailsModal from "../components/MealDetailsModal";
import FoodCard from "../components/FoodCard";
import api from "../services/api";
import { getCurrentUserId } from "../utils/auth";

import healthyBowl from "../assets/food/healthy-spinach-bowl.jpg";
import bbqPlatter from "../assets/food/grilled-bbq-platter.jpg";
import pizza from "../assets/food/hawaiian-chicken-pizza.jpg";
import cheesecake from "../assets/food/orange-cheesecake.jpg";
import skewers from "../assets/food/grilled-beef-skewers.jpg";
import bbqChicken from "../assets/food/bbq-sausages-and-chicken.jpg";

function getFoodImage(
  name = "",
  tags = "",
  category = ""
) {
  const text =
    `${name} ${tags} ${category}`.toLowerCase();

  if (text.includes("pizza")) {
    return pizza;
  }

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
    text.includes("barbecue") ||
    text.includes("burger")
  ) {
    return bbqPlatter;
  }

  if (
    text.includes("bowl") ||
    text.includes("salad") ||
    text.includes("healthy") ||
    text.includes("spinach") ||
    text.includes("vegan") ||
    text.includes("tofu")
  ) {
    return healthyBowl;
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
    text.includes("beef") ||
    text.includes("steak") ||
    text.includes("kebab") ||
    text.includes("skewer")
  ) {
    return skewers;
  }

  return healthyBowl;
}

function RestaurantDetails({
  restaurant,
  onBack,
}) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] =
    useState(null);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [mealFavorites, setMealFavorites] =
    useState([]);
  const [
    favoriteLoadingIds,
    setFavoriteLoadingIds,
  ] = useState([]);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "campusEatsCart"
      );

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [
    isRestaurantFavorite,
    setIsRestaurantFavorite,
  ] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          "favoriteRestaurants"
        ) || "[]"
      );

      return saved.includes(restaurant.id);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "campusEatsCart",
      JSON.stringify(cart)
    );
  }, [cart]);

  useEffect(() => {
    async function loadRestaurantData() {
      setLoading(true);
      setMessage("");

      try {
        const [
          menuResponse,
          favoritesResponse,
        ] = await Promise.all([
          api.get("/menu/"),
          api.get("/favorites/", {
            params: {
              user_id: getCurrentUserId(),
            },
          }),
        ]);

        const allItems = Array.isArray(
          menuResponse.data
        )
          ? menuResponse.data
          : [];

        setMenuItems(
          allItems.filter(
            (item) =>
              Number(item.restaurant_id) ===
              Number(restaurant.id)
          )
        );

        const favoriteItems = Array.isArray(
          favoritesResponse.data
        )
          ? favoritesResponse.data
          : [];

        setMealFavorites(
          favoriteItems.map((item) => item.id)
        );
      } catch (error) {
        console.error(
          "Restaurant details loading failed:",
          error
        );

        setMessage(
          error.response?.data?.detail ||
            "Could not load this restaurant."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRestaurantData();
  }, [restaurant.id]);

  const lowestPrice = useMemo(() => {
    if (menuItems.length === 0) {
      return null;
    }

    return Math.min(
      ...menuItems.map(
        (item) => Number(item.price) || 0
      )
    );
  }, [menuItems]);

  function toggleRestaurantFavorite() {
    let savedRestaurants = [];

    try {
      savedRestaurants = JSON.parse(
        localStorage.getItem(
          "favoriteRestaurants"
        ) || "[]"
      );
    } catch {
      savedRestaurants = [];
    }

    const updated = savedRestaurants.includes(
      restaurant.id
    )
      ? savedRestaurants.filter(
          (id) => id !== restaurant.id
        )
      : [...savedRestaurants, restaurant.id];

    localStorage.setItem(
      "favoriteRestaurants",
      JSON.stringify(updated)
    );

    setIsRestaurantFavorite(
      updated.includes(restaurant.id)
    );
  }

  async function toggleMealFavorite(itemId) {
    const userId = getCurrentUserId();

    if (!userId) {
      setMessage(
        "Log in before saving a favorite."
      );
      return;
    }

    if (
      favoriteLoadingIds.includes(itemId)
    ) {
      return;
    }

    const isSaved =
      mealFavorites.includes(itemId);

    setFavoriteLoadingIds((current) => [
      ...current,
      itemId,
    ]);

    try {
      if (isSaved) {
        await api.delete(
          `/favorites/${itemId}`,
          {
            params: {
              user_id: userId,
            },
          }
        );

        setMealFavorites((current) =>
          current.filter(
            (id) => id !== itemId
          )
        );
      } else {
        await api.post(
          `/favorites/${itemId}`,
          null,
          {
            params: {
              user_id: userId,
            },
          }
        );

        setMealFavorites((current) => [
          ...current,
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
      setFavoriteLoadingIds((current) =>
        current.filter(
          (id) => id !== itemId
        )
      );
    }
  }

  function addToCart(item) {
    setMessage("");
    setSuccessMessage("");

    const stock = Number(
      item.stock_quantity || 0
    );

    if (
      item.is_available === false ||
      stock <= 0
    ) {
      setMessage(
        `${item.name} is out of stock.`
      );
      return;
    }

    const existingRestaurantId =
      cart[0]?.restaurant_id;

    if (
      existingRestaurantId &&
      Number(existingRestaurantId) !==
        Number(item.restaurant_id)
    ) {
      setMessage(
        "Your cart contains items from another restaurant. Clear that cart before adding this meal."
      );
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (cartItem) =>
          cartItem.id === item.id
      );

      if (existing) {
        if (existing.quantity >= stock) {
          setMessage(
            `Only ${stock} ${item.name} available.`
          );
          return current;
        }

        return current.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity:
                  cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...current,
        {
          ...item,
          quantity: 1,
        },
      ];
    });

    setSuccessMessage(
      `${item.name} added to your cart.`
    );
  }

  function changeQuantity(itemId, change) {
    setMessage("");

    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          const next =
            item.quantity + change;

          const stock = Number(
            item.stock_quantity || 0
          );

          if (
            change > 0 &&
            next > stock
          ) {
            setMessage(
              `Only ${stock} ${item.name} available.`
            );
            return item;
          }

          return {
            ...item,
            quantity: next,
          };
        })
        .filter(
          (item) => item.quantity > 0
        )
    );
  }

  return (
    <section className="restaurant-details-page menu-page">
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
          {isRestaurantFavorite
            ? "♥"
            : "♡"}
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
              📍{" "}
              {restaurant.location ||
                "Location unavailable"}
            </span>

            <span>
              🕒{" "}
              {restaurant.hours ||
                "Hours unavailable"}
            </span>
          </div>

          <div className="restaurant-meta-row">
            <span>★ 4.8 rating</span>
            <span>Student friendly</span>
            <span>Nearby</span>

            {lowestPrice !== null && (
              <span>
                Meals from $
                {lowestPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="restaurant-summary-grid">
        <article className="restaurant-summary-card">
          <div className="restaurant-summary-icon">
            🍽️
          </div>

          <div>
            <strong>{menuItems.length}</strong>
            <span>Menu items</span>
          </div>
        </article>

        <article className="restaurant-summary-card">
          <div className="restaurant-summary-icon">
            ⭐
          </div>

          <div>
            <strong>4.8</strong>
            <span>Average rating</span>
          </div>
        </article>

        <article className="restaurant-summary-card">
          <div className="restaurant-summary-icon">
            💵
          </div>

          <div>
            <strong>
              {lowestPrice === null
                ? "—"
                : `$${lowestPrice.toFixed(
                    2
                  )}`}
            </strong>
            <span>Starting price</span>
          </div>
        </article>
      </div>

      <div className="restaurant-section-heading">
        <div>
          <p className="eyebrow">
            Available today
          </p>
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

      {successMessage && (
        <p className="menu-success-message">
          {successMessage}
        </p>
      )}

      {!loading &&
        menuItems.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              🍽️
            </div>
            <h3>
              No menu items available
            </h3>
            <p>
              This restaurant has not added
              any meals yet.
            </p>
          </div>
        )}

      <div className="restaurant-menu-grid">
        {menuItems.map((item) => {
          const cartItem = cart.find(
            (current) =>
              current.id === item.id
          );

          return (
            <FoodCard
              key={item.id}
              item={item}
              imageSrc={getFoodImage(
                item.name,
                item.tags,
                item.category
              )}
              isFavorite={mealFavorites.includes(
                item.id
              )}
              favoriteDisabled={
                favoriteLoadingIds.includes(
                  item.id
                )
              }
              cartQuantity={
                cartItem?.quantity || 0
              }
              onToggleFavorite={
                toggleMealFavorite
              }
              onViewDetails={setSelectedMeal}
              onAddToCart={addToCart}
              onDecrease={(itemId) =>
                changeQuantity(itemId, -1)
              }
              onIncrease={(itemId) =>
                changeQuantity(itemId, 1)
              }
            />
          );
        })}
      </div>

      <MealDetailsModal
        item={selectedMeal}
        restaurant={restaurant}
        isFavorite={
          selectedMeal
            ? mealFavorites.includes(
                selectedMeal.id
              )
            : false
        }
        onToggleFavorite={
          toggleMealFavorite
        }
        onClose={() =>
          setSelectedMeal(null)
        }
      />
    </section>
  );
}

export default RestaurantDetails;
