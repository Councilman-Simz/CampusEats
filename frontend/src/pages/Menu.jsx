import { useEffect, useMemo, useState } from "react";
import FoodCard from "../components/FoodCard";
import MealDetailsModal from "../components/MealDetailsModal";
import api from "../services/api";

import healthyBowl from "../assets/food/healthy-spinach-bowl.jpg";
import bbqPlatter from "../assets/food/grilled-bbq-platter.jpg";
import pizza from "../assets/food/hawaiian-chicken-pizza.jpg";
import cheesecake from "../assets/food/orange-cheesecake.jpg";
import skewers from "../assets/food/grilled-beef-skewers.jpg";
import bbqChicken from "../assets/food/bbq-sausages-and-chicken.jpg";

function getFoodImage(name = "", tags = "") {
  const text = `${name} ${tags}`.toLowerCase();

  if (text.includes("pizza")) return pizza;

  if (
    text.includes("bbq") ||
    text.includes("sausage")
  ) {
    return bbqChicken;
  }

  if (
    text.includes("chicken") ||
    text.includes("burger") ||
    text.includes("wings")
  ) {
    return bbqPlatter;
  }

  if (
    text.includes("beef") ||
    text.includes("steak") ||
    text.includes("skewer")
  ) {
    return skewers;
  }

  if (
    text.includes("cake") ||
    text.includes("muffin") ||
    text.includes("dessert")
  ) {
    return cheesecake;
  }

  return healthyBowl;
}

function FoodImage({ item }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="food-image-placeholder">
        <span>🍽️</span>
        <small>{item.name}</small>
      </div>
    );
  }

  return (
    <img
      className="food-photo"
      src={getFoodImage(item.name, item.tags)}
      alt={item.name}
      onError={() => setFailed(true)}
    />
  );
}

function Menu() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] =
    useState(false);
  const [searchText, setSearchText] =
    useState("");

  const [selectedTag, setSelectedTag] =
    useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] =
    useState(null);

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

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "menuFavorites"
      );

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });


  useEffect(() => {
    localStorage.setItem(
      "campusEatsCart",
      JSON.stringify(cart)
    );
  }, [cart]);

  const availableTags = useMemo(() => {
    const tags = new Set();

    items.forEach((item) => {
      (item.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => tags.add(tag));
    });

    return ["all", ...Array.from(tags)];
  }, [items]);

  const filteredItems = useMemo(() => {
    const search = searchText
      .toLowerCase()
      .trim();

    return items.filter((item) => {
      const searchableText = [
        item.name,
        item.description,
        item.tags,
        item.ingredients,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search ||
        searchableText.includes(search);

      const itemTags = (item.tags || "")
        .split(",")
        .map((tag) =>
          tag.trim().toLowerCase()
        );

      const matchesTag =
        selectedTag === "all" ||
        itemTags.includes(
          selectedTag.toLowerCase()
        );

      return matchesSearch && matchesTag;
    });
  }, [items, searchText, selectedTag]);

  const cartItemCount = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            item.quantity,
        0
      ),
    [cart]
  );

  function toggleFavorite(itemId) {
    setFavorites((currentFavorites) => {
      const isSaved =
        currentFavorites.includes(itemId);

      const updatedFavorites = isSaved
        ? currentFavorites.filter(
            (id) => id !== itemId
          )
        : [...currentFavorites, itemId];

      localStorage.setItem(
        "menuFavorites",
        JSON.stringify(updatedFavorites)
      );

      return updatedFavorites;
    });
  }

  function addToCart(item) {
    setMessage("");
    setSuccessMessage("");

    const availableStock = Number(
      item.stock_quantity || 0
    );

    if (
      item.is_available === false ||
      availableStock <= 0
    ) {
      setMessage(
        `${item.name} is currently out of stock.`
      );
      return;
    }

    const existingRestaurantId =
      cart[0]?.restaurant_id;

    if (
      existingRestaurantId &&
      existingRestaurantId !==
        item.restaurant_id
    ) {
      setMessage(
        "Your cart already contains food from another restaurant. Clear the cart before adding this item."
      );
      setCartOpen(true);
      return;
    }

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (cartItem) =>
            cartItem.id === item.id
        );

      if (existingItem) {
        if (
          existingItem.quantity >=
          availableStock
        ) {
          setMessage(
            `Only ${availableStock} ${item.name} available.`
          );
          return currentCart;
        }

        return currentCart.map(
          (cartItem) =>
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
        ...currentCart,
        {
          ...item,
          quantity: 1,
        },
      ];
    });

    setCartOpen(true);
    setSuccessMessage(
      `${item.name} added to your cart.`
    );
  }

  function changeQuantity(itemId, change) {
    setMessage("");

    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          const nextQuantity =
            item.quantity + change;

          const availableStock = Number(
            item.stock_quantity || 0
          );

          if (
            change > 0 &&
            nextQuantity > availableStock
          ) {
            setMessage(
              `Only ${availableStock} ${item.name} available.`
            );
            return item;
          }

          return {
            ...item,
            quantity: nextQuantity,
          };
        })
        .filter(
          (item) => item.quantity > 0
        )
    );
  }

  function removeFromCart(itemId) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== itemId
      )
    );
  }

  function clearCart() {
    setCart([]);
    setMessage("");
    setSuccessMessage("");
  }

  async function checkout() {
    if (!cart.length) {
      setMessage("Your cart is empty.");
      return;
    }

    const restaurantId =
      cart[0].restaurant_id;

    const containsMultipleRestaurants =
      cart.some(
        (item) =>
          item.restaurant_id !==
          restaurantId
      );

    if (containsMultipleRestaurants) {
      setMessage(
        "All items in an order must come from the same restaurant."
      );
      return;
    }

    const payload = {
      restaurant_id: restaurantId,
      items: cart.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      setCheckingOut(true);
      setMessage("");
      setSuccessMessage("");

      const orderResponse = await api.post(
        "/orders/",
        payload
      );

      const paymentResponse = await api.post(
        "/payments/checkout-session",
        {
          order_id: orderResponse.data.id,
        }
      );

      const checkoutUrl =
        paymentResponse.data.checkout_url;

      if (!checkoutUrl) {
        throw new Error(
          "Stripe checkout URL was not returned."
        );
      }

      setCart([]);
      localStorage.removeItem("campusEatsCart");

      window.location.assign(checkoutUrl);
    } catch (error) {
      console.error(
        "Checkout failed:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Unable to place your order."
      );
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <section className="menu-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">
            Browse meals
          </p>

          <h1>Campus Menu</h1>

          <p className="page-subtitle">
            Discover affordable meals,
            healthy choices, and
            student-friendly food options
            near campus.
          </p>
        </div>

        <div className="menu-header-actions">
          <span className="count-badge">
            {filteredItems.length} meals
          </span>

          <button
            type="button"
            className="menu-cart-button"
            onClick={() =>
              setCartOpen(true)
            }
          >
            🛒 Cart ({cartItemCount})
          </button>
        </div>
      </div>

      <div className="menu-toolbar">
        <div className="menu-search-box">
          <input
            type="search"
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
            placeholder="Search meals, ingredients, or dietary tags..."
          />
        </div>

        <select
          className="menu-filter"
          value={selectedTag}
          onChange={(event) =>
            setSelectedTag(
              event.target.value
            )
          }
        >
          {availableTags.map((tag) => (
            <option value={tag} key={tag}>
              {tag === "all"
                ? "All categories"
                : tag}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="status-message">
          Loading menu...
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
        filteredItems.length === 0 && (
          <div className="empty-state">
            <h3>No meals found</h3>
            <p>
              Try another search term or
              choose a different category.
            </p>
          </div>
        )}

      <div className="card-grid">
        {filteredItems.map((item) => {
          const cartItem = cart.find(
            (currentItem) =>
              currentItem.id === item.id
          );

          return (
            <FoodCard
              key={item.id}
              item={item}
              imageSrc={getFoodImage(
                item.name,
                item.tags
              )}
              isFavorite={favorites.includes(
                item.id
              )}
              cartQuantity={
                cartItem?.quantity || 0
              }
              onToggleFavorite={toggleFavorite}
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
        isFavorite={
          selectedMeal
            ? favorites.includes(selectedMeal.id)
            : false
        }
        onToggleFavorite={toggleFavorite}
        onClose={() => setSelectedMeal(null)}
      />

      {cartOpen && (
        <>
          <button
            type="button"
            className="cart-backdrop"
            aria-label="Close cart"
            onClick={() =>
              setCartOpen(false)
            }
          />

          <aside className="cart-drawer">
            <div className="cart-drawer-header">
              <div>
                <span className="eyebrow">
                  Your order
                </span>

                <h2>
                  Cart ({cartItemCount})
                </h2>
              </div>

              <button
                type="button"
                className="cart-close-button"
                onClick={() =>
                  setCartOpen(false)
                }
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty-state">
                <span>🛒</span>
                <h3>Your cart is empty</h3>
                <p>
                  Add a meal to begin your
                  order.
                </p>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <article
                      className="cart-item"
                      key={item.id}
                    >
                      <div className="cart-item-copy">
                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          $
                          {Number(
                            item.price || 0
                          ).toFixed(2)}{" "}
                          each
                        </span>
                      </div>

                      <div className="cart-item-bottom">
                        <div className="cart-quantity">
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item.id,
                                -1
                              )
                            }
                          >
                            −
                          </button>

                          <span>
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item.id,
                                1
                              )
                            }
                          >
                            +
                          </button>
                        </div>

                        <strong>
                          $
                          {(
                            Number(
                              item.price || 0
                            ) *
                            item.quantity
                          ).toFixed(2)}
                        </strong>

                        <button
                          type="button"
                          className="cart-remove-button"
                          onClick={() =>
                            removeFromCart(
                              item.id
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>
                      ${cartTotal.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Pickup</span>
                    <strong>Free</strong>
                  </div>

                  <div className="cart-total-row">
                    <span>Total</span>
                    <strong>
                      ${cartTotal.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="cart-checkout-button"
                  onClick={checkout}
                  disabled={checkingOut}
                >
                  {checkingOut
                    ? "Placing order..."
                    : "Checkout"}
                </button>

                <button
                  type="button"
                  className="cart-clear-button"
                  onClick={clearCart}
                >
                  Clear cart
                </button>
              </>
            )}
          </aside>
        </>
      )}
    </section>
  );
}

export default Menu;
