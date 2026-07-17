import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import OwnerDeals from "../components/OwnerDeals";
import OwnerAnalytics from "../components/OwnerAnalytics";
import OwnerOrders from "../components/OwnerOrders";
import OwnerInsights from "../components/OwnerInsights";

const DEFAULT_EXPIRY = "2026-12-31T22:00:00";

const emptyMenuForm = {
  name: "",
  description: "",
  price: "",
  tags: "",
  ingredients: "",
  expires_at: DEFAULT_EXPIRY,
};

const emptyRestaurantForm = {
  name: "",
  location: "",
  hours: "",
  description: "",
  cuisine: "",
  phone: "",
  logo_url: "",
  banner_url: "",
};

const ownerTabs = [
  { id: "overview", label: "Overview", icon: "▦" },
  { id: "menu", label: "Menu", icon: "☰" },
  { id: "deals", label: "Flash Deals", icon: "⚡" },
  { id: "settings", label: "Restaurant", icon: "⚙" },
];

function formatPrice(value) {
  const price = Number(value);

  if (Number.isNaN(price)) {
    return "$0.00";
  }

  return `$${price.toFixed(2)}`;
}

function normalizeDateTime(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 16);
}

function getInitials(name = "") {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return initials || "CE";
}

function OwnerDashboard() {
  const [profile, setProfile] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  const [menuForm, setMenuForm] = useState(emptyMenuForm);
  const [restaurantForm, setRestaurantForm] =
    useState(emptyRestaurantForm);

  const [editingId, setEditingId] = useState(null);
  const [activeSection, setActiveSection] =
    useState("overview");

  const [menuSearch, setMenuSearch] = useState("");
  const [menuSort, setMenuSort] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [savingMenu, setSavingMenu] = useState(false);
  const [savingRestaurant, setSavingRestaurant] =
    useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [menuMessage, setMenuMessage] = useState("");
  const [menuError, setMenuError] = useState("");
  const [restaurantMessage, setRestaurantMessage] =
    useState("");
  const [restaurantError, setRestaurantError] =
    useState("");
  const [pageError, setPageError] = useState("");

  const restaurant = useMemo(
    () => profile?.restaurants?.[0] || null,
    [profile]
  );

  const menuStats = useMemo(() => {
    const prices = menuItems
      .map((item) => Number(item.price))
      .filter((price) => !Number.isNaN(price));

    const total = prices.reduce(
      (sum, price) => sum + price,
      0
    );

    return {
      count: menuItems.length,
      average:
        prices.length > 0
          ? (total / prices.length).toFixed(2)
          : "0.00",
      lowest:
        prices.length > 0
          ? Math.min(...prices).toFixed(2)
          : "0.00",
      highest:
        prices.length > 0
          ? Math.max(...prices).toFixed(2)
          : "0.00",
    };
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    const query = menuSearch.trim().toLowerCase();

    const filtered = query
      ? menuItems.filter((item) => {
          const text = [
            item.name,
            item.description,
            item.tags,
            item.ingredients,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return text.includes(query);
        })
      : [...menuItems];

    filtered.sort((a, b) => {
      if (menuSort === "price-low") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (menuSort === "price-high") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      if (menuSort === "name") {
        return String(a.name || "").localeCompare(
          String(b.name || "")
        );
      }

      return Number(b.id || 0) - Number(a.id || 0);
    });

    return filtered;
  }, [menuItems, menuSearch, menuSort]);

  useEffect(() => {
    loadOwnerData();
  }, []);

  useEffect(() => {
    if (!restaurant) {
      return;
    }

    setRestaurantForm({
      name: restaurant.name || "",
      location: restaurant.location || "",
      hours: restaurant.hours || "",
      description: restaurant.description || "",
      cuisine: restaurant.cuisine || "",
      phone: restaurant.phone || "",
      logo_url: restaurant.logo_url || "",
      banner_url: restaurant.banner_url || "",
    });
  }, [restaurant]);

  function clearMenuFeedback() {
    setMenuMessage("");
    setMenuError("");
  }

  function clearRestaurantFeedback() {
    setRestaurantMessage("");
    setRestaurantError("");
  }

  async function loadOwnerData() {
    try {
      setLoading(true);
      setPageError("");

      const [profileResponse, menuResponse] =
        await Promise.all([
          api.get("/owner/profile"),
          api.get("/owner/menu"),
        ]);

      setProfile(profileResponse.data);

      setMenuItems(
        Array.isArray(menuResponse.data)
          ? menuResponse.data
          : []
      );
    } catch (error) {
      console.error(
        "Owner dashboard loading failed:",
        error
      );

      setPageError(
        error.response?.data?.detail ||
          "Unable to load the owner portal."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleMenuChange(event) {
    const { name, value } = event.target;

    setMenuForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleRestaurantChange(event) {
    const { name, value } = event.target;

    setRestaurantForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function startAddItem() {
    setEditingId(null);
    setMenuForm(emptyMenuForm);
    clearMenuFeedback();
    setActiveSection("menu");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function startEdit(item) {
    setEditingId(item.id);
    setActiveSection("menu");

    setMenuForm({
      name: item.name || "",
      description: item.description || "",
      price: String(item.price ?? ""),
      tags: item.tags || "",
      ingredients: item.ingredients || "",
      expires_at:
        item.expires_at || DEFAULT_EXPIRY,
    });

    clearMenuFeedback();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setMenuForm(emptyMenuForm);
    clearMenuFeedback();
  }

  async function handleMenuSubmit(event) {
    event.preventDefault();

    if (!restaurant) {
      setMenuError(
        "No restaurant is assigned to this owner."
      );
      return;
    }

    const cleanName = menuForm.name.trim();
    const price = Number(menuForm.price);

    if (
      !cleanName ||
      Number.isNaN(price) ||
      price < 0
    ) {
      setMenuError(
        "Enter a valid item name and price."
      );
      return;
    }

    const payload = {
      restaurant_id: restaurant.id,
      name: cleanName,
      description: menuForm.description.trim(),
      price,
      tags: menuForm.tags.trim(),
      ingredients: menuForm.ingredients.trim(),
      expires_at: menuForm.expires_at || null,
    };

    try {
      setSavingMenu(true);
      clearMenuFeedback();

      if (editingId) {
        const response = await api.patch(
          `/owner/menu/${editingId}`,
          payload
        );

        setMenuItems((currentItems) =>
          currentItems.map((item) =>
            item.id === editingId
              ? response.data
              : item
          )
        );

        setMenuMessage(
          "Menu item updated successfully."
        );
      } else {
        const response = await api.post(
          "/owner/menu",
          payload
        );

        setMenuItems((currentItems) => [
          response.data,
          ...currentItems,
        ]);

        setMenuMessage(
          "Menu item added successfully."
        );
      }

      setEditingId(null);
      setMenuForm(emptyMenuForm);
    } catch (error) {
      console.error("Menu save failed:", error);

      setMenuError(
        error.response?.data?.detail ||
          "Unable to save the menu item."
      );
    } finally {
      setSavingMenu(false);
    }
  }

  async function deleteItem(item) {
    const confirmed = window.confirm(
      `Delete "${item.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(item.id);
      clearMenuFeedback();

      await api.delete(`/owner/menu/${item.id}`);

      setMenuItems((currentItems) =>
        currentItems.filter(
          (menuItem) => menuItem.id !== item.id
        )
      );

      if (editingId === item.id) {
        cancelEdit();
      }

      setMenuMessage(
        "Menu item deleted successfully."
      );
    } catch (error) {
      console.error("Menu delete failed:", error);

      setMenuError(
        error.response?.data?.detail ||
          "Unable to delete the menu item."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRestaurantSubmit(event) {
    event.preventDefault();

    if (!restaurant) {
      setRestaurantError(
        "No restaurant is assigned to this owner."
      );
      return;
    }

    if (!restaurantForm.name.trim()) {
      setRestaurantError(
        "Restaurant name is required."
      );
      return;
    }

    const payload = {
      name: restaurantForm.name.trim(),
      location: restaurantForm.location.trim(),
      hours: restaurantForm.hours.trim(),
      description:
        restaurantForm.description.trim(),
      cuisine: restaurantForm.cuisine.trim(),
      phone: restaurantForm.phone.trim(),
      logo_url: restaurantForm.logo_url.trim(),
      banner_url: restaurantForm.banner_url.trim(),
    };

    try {
      setSavingRestaurant(true);
      clearRestaurantFeedback();

      const response = await api.patch(
        `/owner/restaurant/${restaurant.id}`,
        payload
      );

      setProfile((current) => ({
        ...current,
        restaurants: [
          response.data,
          ...(current?.restaurants || []).slice(1),
        ],
      }));

      setRestaurantMessage(
        "Restaurant profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Restaurant update failed:",
        error
      );

      setRestaurantError(
        error.response?.data?.detail ||
          "Unable to update the restaurant profile."
      );
    } finally {
      setSavingRestaurant(false);
    }
  }

  function resetRestaurantForm() {
    if (!restaurant) {
      return;
    }

    setRestaurantForm({
      name: restaurant.name || "",
      location: restaurant.location || "",
      hours: restaurant.hours || "",
      description: restaurant.description || "",
      cuisine: restaurant.cuisine || "",
      phone: restaurant.phone || "",
      logo_url: restaurant.logo_url || "",
      banner_url: restaurant.banner_url || "",
    });

    clearRestaurantFeedback();
  }

  if (loading) {
    return (
      <main className="owner-page">
        <div className="owner-state-card">
          <div className="search-spinner" />
          <h2>Loading owner portal</h2>
          <p>
            Preparing your restaurant dashboard.
          </p>
        </div>
      </main>
    );
  }

  if (pageError && !profile) {
    return (
      <main className="owner-page">
        <div className="owner-state-card owner-error-card">
          <span>⚠️</span>
          <h2>Owner portal unavailable</h2>
          <p>{pageError}</p>

          <button
            type="button"
            className="owner-primary-button"
            onClick={loadOwnerData}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="owner-page">
      <section className="owner-hero">
        <div className="owner-hero-main">
          <span className="owner-kicker">
            Restaurant partner workspace
          </span>

          <h1>
            {restaurant?.name ||
              "Restaurant Owner Portal"}
          </h1>

          <p>
            Manage your restaurant profile, menu,
            pricing, availability, and promotions.
          </p>

          <div className="owner-hero-actions">
            <button
              type="button"
              className="owner-primary-button"
              onClick={startAddItem}
            >
              + Add menu item
            </button>

            <button
              type="button"
              className="owner-secondary-button"
              onClick={() =>
                setActiveSection("deals")
              }
            >
              Create flash deal
            </button>
          </div>
        </div>

        {restaurant && (
          <article className="owner-business-card">
            <div className="owner-business-logo">
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={`${restaurant.name} logo`}
                />
              ) : (
                <span>
                  {getInitials(restaurant.name)}
                </span>
              )}
            </div>

            <div className="owner-business-copy">
              <strong>{restaurant.name}</strong>

              <span>
                {restaurant.cuisine ||
                  "Cuisine not specified"}
              </span>

              <small>
                {restaurant.location ||
                  "Location unavailable"}
              </small>
            </div>

            <span
              className={`owner-status-badge ${
                restaurant.is_active
                  ? "owner-status-active"
                  : "owner-status-inactive"
              }`}
            >
              {restaurant.status || "pending"}
            </span>
          </article>
        )}
      </section>

      <section className="owner-tab-bar">
        <button
          type="button"
          className={
            activeSection === "overview"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("overview")
          }
        >
          Overview
        </button>

        <button
          type="button"
          className={
            activeSection === "menu"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("menu")
          }
        >
          Menu management
        </button>

        <button
          type="button"
          className={
            activeSection === "deals"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("deals")
          }
        >
          Flash Deals
        </button>

        <button
          type="button"
          className={
            activeSection === "orders"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("orders")
          }
        >
          Orders
        </button>

        <button
          type="button"
          className={
            activeSection === "insights"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("insights")
          }
        >
          AI Insights
        </button>

        <button
          type="button"
          className={
            activeSection === "analytics"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("analytics")
          }
        >
          Analytics
        </button>

        <button
          type="button"
          className={
            activeSection === "settings"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("settings")
          }
        >
          Restaurant settings
        </button>
      </section>

      {activeSection === "overview" && (
        <>
          <section className="owner-stat-grid">
            <article className="owner-stat-card">
              <span className="owner-stat-icon">📋</span>
              <div>
                <p>Menu items</p>
                <strong>{menuStats.count}</strong>
                <small>Currently listed</small>
              </div>
            </article>

            <article className="owner-stat-card">
              <span className="owner-stat-icon">💵</span>
              <div>
                <p>Average price</p>
                <strong>
                  ${menuStats.average}
                </strong>
                <small>Across the menu</small>
              </div>
            </article>

            <article className="owner-stat-card">
              <span className="owner-stat-icon">🏷️</span>
              <div>
                <p>Lowest price</p>
                <strong>
                  ${menuStats.lowest}
                </strong>
                <small>Best-value item</small>
              </div>
            </article>

            <article className="owner-stat-card">
              <span className="owner-stat-icon">⬆️</span>
              <div>
                <p>Highest price</p>
                <strong>
                  ${menuStats.highest}
                </strong>
                <small>Premium item</small>
              </div>
            </article>
          </section>

          <section className="owner-overview-grid">
            <article className="owner-panel">
              <div className="owner-panel-heading">
                <div>
                  <span className="owner-kicker">
                    Business profile
                  </span>
                  <h2>Restaurant details</h2>
                </div>

                <button
                  type="button"
                  className="owner-link-button"
                  onClick={() =>
                    setActiveSection("settings")
                  }
                >
                  Edit profile
                </button>
              </div>

              <div className="owner-profile-details">
                <div>
                  <span>Restaurant</span>
                  <strong>
                    {restaurant?.name || "—"}
                  </strong>
                </div>

                <div>
                  <span>Cuisine</span>
                  <strong>
                    {restaurant?.cuisine ||
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    {restaurant?.location ||
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>Opening hours</span>
                  <strong>
                    {restaurant?.hours ||
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {restaurant?.phone ||
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {restaurant?.status ||
                      "pending"}
                  </strong>
                </div>
              </div>
            </article>

            <article className="owner-panel">
              <div className="owner-panel-heading">
                <div>
                  <span className="owner-kicker">
                    Menu activity
                  </span>
                  <h2>Recently added</h2>
                </div>

                <button
                  type="button"
                  className="owner-link-button"
                  onClick={() =>
                    setActiveSection("menu")
                  }
                >
                  Manage menu
                </button>
              </div>

              <div className="owner-recent-list">
                {menuItems.slice(0, 5).map((item) => (
                  <div
                    className="owner-recent-item"
                    key={item.id}
                  >
                    <div className="owner-recent-copy">
                      <strong>{item.name}</strong>
                      <span>
                        {item.tags || "No tags"}
                      </span>
                    </div>

                    <b>{formatPrice(item.price)}</b>
                  </div>
                ))}

                {!menuItems.length && (
                  <div className="owner-empty-inline">
                    <span>📋</span>
                    <p>No menu items yet.</p>
                  </div>
                )}
              </div>
            </article>
          </section>
        </>
      )}

      {activeSection === "menu" && (
        <section className="owner-content-grid">
          <article className="owner-panel owner-form-panel">
            <div className="owner-panel-heading">
              <div>
                <span className="owner-kicker">
                  {editingId
                    ? "Edit item"
                    : "New menu item"}
                </span>

                <h2>
                  {editingId
                    ? "Update item"
                    : "Create item"}
                </h2>
              </div>

              {editingId && (
                <button
                  type="button"
                  className="owner-link-button"
                  onClick={cancelEdit}
                >
                  Cancel editing
                </button>
              )}
            </div>

            <form
              className="owner-form"
              onSubmit={handleMenuSubmit}
            >
              <label>
                Item name
                <input
                  name="name"
                  value={menuForm.name}
                  onChange={handleMenuChange}
                  placeholder="Chicken Rice Bowl"
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={menuForm.description}
                  onChange={handleMenuChange}
                  placeholder="Describe the meal"
                  rows="4"
                />
              </label>

              <div className="owner-form-row">
                <label>
                  Price
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={menuForm.price}
                    onChange={handleMenuChange}
                    placeholder="9.99"
                    required
                  />
                </label>

                <label>
                  Available until
                  <input
                    name="expires_at"
                    type="datetime-local"
                    value={normalizeDateTime(
                      menuForm.expires_at
                    )}
                    onChange={(event) =>
                      setMenuForm((current) => ({
                        ...current,
                        expires_at:
                          event.target.value
                            ? `${event.target.value}:00`
                            : "",
                      }))
                    }
                  />
                </label>
              </div>

              <label>
                Tags
                <input
                  name="tags"
                  value={menuForm.tags}
                  onChange={handleMenuChange}
                  placeholder="healthy, chicken, lunch"
                />
              </label>

              <label>
                Ingredients
                <input
                  name="ingredients"
                  value={menuForm.ingredients}
                  onChange={handleMenuChange}
                  placeholder="chicken, rice, broccoli"
                />
              </label>

              {menuError && (
                <p className="owner-form-error">
                  {menuError}
                </p>
              )}

              {menuMessage && (
                <p className="owner-form-success">
                  {menuMessage}
                </p>
              )}

              <div className="owner-form-actions">
                {editingId && (
                  <button
                    type="button"
                    className="owner-secondary-button"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  className="owner-primary-button"
                  disabled={savingMenu}
                >
                  {savingMenu
                    ? "Saving..."
                    : editingId
                      ? "Update item"
                      : "Add item"}
                </button>
              </div>
            </form>
          </article>

          <article className="owner-panel owner-menu-panel">
            <div className="owner-panel-heading">
              <div>
                <span className="owner-kicker">
                  Current menu
                </span>

                <h2>
                  {menuItems.length} item
                  {menuItems.length !== 1
                    ? "s"
                    : ""}
                </h2>
              </div>

              <button
                type="button"
                className="owner-link-button"
                onClick={loadOwnerData}
              >
                Refresh
              </button>
            </div>

            <div className="owner-menu-toolbar">
              <input
                type="search"
                value={menuSearch}
                onChange={(event) =>
                  setMenuSearch(event.target.value)
                }
                placeholder="Search menu items"
              />

              <select
                value={menuSort}
                onChange={(event) =>
                  setMenuSort(event.target.value)
                }
              >
                <option value="newest">
                  Newest
                </option>
                <option value="name">
                  Name
                </option>
                <option value="price-low">
                  Price: low to high
                </option>
                <option value="price-high">
                  Price: high to low
                </option>
              </select>
            </div>

            {menuItems.length === 0 ? (
              <div className="owner-empty-state">
                <span>📋</span>
                <h3>No menu items yet</h3>
                <p>
                  Add your first item using the form.
                </p>
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="owner-empty-state">
                <span>🔎</span>
                <h3>No matching items</h3>
                <p>
                  Try another search phrase.
                </p>
              </div>
            ) : (
              <div className="owner-menu-list">
                {filteredMenuItems.map((item) => {
                  const tags = (item.tags || "")
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean);

                  return (
                    <article
                      className="owner-menu-item"
                      key={item.id}
                    >
                      <div className="owner-menu-item-main">
                        <div className="owner-menu-item-top">
                          <span>
                            Item #{item.id}
                          </span>

                          <strong>
                            {formatPrice(item.price)}
                          </strong>
                        </div>

                        <h3>{item.name}</h3>

                        <p>
                          {item.description ||
                            "No description provided."}
                        </p>

                        <div className="owner-item-tags">
                          {tags
                            .slice(0, 4)
                            .map((tag) => (
                              <span key={tag}>
                                {tag}
                              </span>
                            ))}

                          {!tags.length && (
                            <span>No tags</span>
                          )}
                        </div>
                      </div>

                      <div className="owner-item-actions">
                        <button
                          type="button"
                          onClick={() =>
                            startEdit(item)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="owner-delete-button"
                          onClick={() =>
                            deleteItem(item)
                          }
                          disabled={
                            deletingId === item.id
                          }
                        >
                          {deletingId === item.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </article>
        </section>
      )}

      {activeSection === "deals" && (
        <section className="owner-section-block">
          <div className="owner-section-heading">
            <div>
              <span className="owner-kicker">
                Promotions
              </span>
              <h2>Flash deals</h2>
              <p>
                Create limited-time offers from
                your existing menu.
              </p>
            </div>
          </div>

          <OwnerDeals
            menuItems={menuItems}
            onMenuItemsChange={setMenuItems}
          />
        </section>
      )}

      {activeSection === "deals" && (
        <OwnerDeals
          menuItems={menuItems}
          onMenuItemsChange={setMenuItems}
        />
      )}

      {activeSection === "orders" && (
        <OwnerOrders />
      )}

      {activeSection === "insights" && (
        <OwnerInsights />
      )}

      {activeSection === "analytics" && (
        <OwnerAnalytics />
      )}

      {activeSection === "settings" && (
        <section className="owner-settings-grid">
          <article className="owner-panel">
            <div className="owner-panel-heading">
              <div>
                <span className="owner-kicker">
                  Restaurant settings
                </span>

                <h2>Edit business profile</h2>
              </div>
            </div>

            <form
              className="owner-form"
              onSubmit={handleRestaurantSubmit}
            >
              <label>
                Restaurant name
                <input
                  name="name"
                  value={restaurantForm.name}
                  onChange={
                    handleRestaurantChange
                  }
                  required
                />
              </label>

              <div className="owner-form-row">
                <label>
                  Cuisine
                  <input
                    name="cuisine"
                    value={
                      restaurantForm.cuisine
                    }
                    onChange={
                      handleRestaurantChange
                    }
                    placeholder="American, Healthy"
                  />
                </label>

                <label>
                  Phone
                  <input
                    name="phone"
                    value={
                      restaurantForm.phone
                    }
                    onChange={
                      handleRestaurantChange
                    }
                    placeholder="212-555-0106"
                  />
                </label>
              </div>

              <label>
                Location
                <input
                  name="location"
                  value={
                    restaurantForm.location
                  }
                  onChange={
                    handleRestaurantChange
                  }
                  placeholder="Midtown Manhattan"
                />
              </label>

              <label>
                Opening hours
                <input
                  name="hours"
                  value={
                    restaurantForm.hours
                  }
                  onChange={
                    handleRestaurantChange
                  }
                  placeholder="11am - 12am"
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={
                    restaurantForm.description
                  }
                  onChange={
                    handleRestaurantChange
                  }
                  rows="5"
                  placeholder="Tell students about your restaurant"
                />
              </label>

              <label>
                Logo URL
                <input
                  name="logo_url"
                  value={
                    restaurantForm.logo_url
                  }
                  onChange={
                    handleRestaurantChange
                  }
                  placeholder="https://..."
                />
              </label>

              <label>
                Banner URL
                <input
                  name="banner_url"
                  value={
                    restaurantForm.banner_url
                  }
                  onChange={
                    handleRestaurantChange
                  }
                  placeholder="https://..."
                />
              </label>

              {restaurantError && (
                <p className="owner-form-error">
                  {restaurantError}
                </p>
              )}

              {restaurantMessage && (
                <p className="owner-form-success">
                  {restaurantMessage}
                </p>
              )}

              <div className="owner-form-actions">
                <button
                  type="button"
                  className="owner-secondary-button"
                  onClick={resetRestaurantForm}
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="owner-primary-button"
                  disabled={savingRestaurant}
                >
                  {savingRestaurant
                    ? "Saving profile..."
                    : "Save profile"}
                </button>
              </div>
            </form>
          </article>

          <article className="owner-profile-preview">
            {restaurantForm.banner_url ? (
              <img
                className="owner-preview-banner"
                src={restaurantForm.banner_url}
                alt="Restaurant banner preview"
              />
            ) : (
              <div className="owner-preview-placeholder">
                Restaurant banner preview
              </div>
            )}

            <div className="owner-preview-content">
              <div className="owner-preview-logo">
                {restaurantForm.logo_url ? (
                  <img
                    src={restaurantForm.logo_url}
                    alt="Restaurant logo preview"
                  />
                ) : (
                  <span>
                    {getInitials(
                      restaurantForm.name
                    )}
                  </span>
                )}
              </div>

              <span className="owner-kicker">
                Profile preview
              </span>

              <h2>
                {restaurantForm.name ||
                  "Restaurant name"}
              </h2>

              <p>
                {restaurantForm.description ||
                  "Your restaurant description will appear here."}
              </p>

              <div className="owner-preview-meta">
                <span>
                  📍{" "}
                  {restaurantForm.location ||
                    "Location"}
                </span>

                <span>
                  🕒{" "}
                  {restaurantForm.hours ||
                    "Opening hours"}
                </span>

                <span>
                  🍴{" "}
                  {restaurantForm.cuisine ||
                    "Cuisine"}
                </span>

                <span>
                  ☎️{" "}
                  {restaurantForm.phone ||
                    "Phone"}
                </span>
              </div>
            </div>
          </article>
        </section>
      )}
    </main>
  );
}

export default OwnerDashboard;