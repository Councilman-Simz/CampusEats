import NotificationBell from "./NotificationBell";
const links = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "🏠",
  },
  {
    key: "restaurants",
    label: "Restaurants",
    icon: "🍽️",
  },
  {
    key: "menu",
    label: "Menu",
    icon: "📋",
  },
  {
    key: "deals",
    label: "Flash Deals",
    icon: "🔥",
  },
  {
    key: "search",
    label: "AI Search",
    icon: "🔎",
  },
  {
    key: "image-search",
    label: "Image Search",
    icon: "📷",
  },
  {
    key: "chat",
    label: "AI Chat",
    icon: "💬",
  },
  {
    key: "favorites",
    label: "Favorites",
    icon: "♥",
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: "📊",
  },
];

function Navbar({
  activePage,
  setActivePage,
  onLogout,
}) {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin =
    storedUser?.role === "admin";

  const isRestaurantOwner =
    storedUser?.role === "restaurant_owner" ||
    isAdmin;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">C</div>

        <div>
          <h2>CampusEats</h2>
          <span>Student food finder</span>
        </div>
      </div>

      <nav className="nav-links">
        {links.map((link) => (
          <button
            type="button"
            key={link.key}
            className={`nav-item ${
              activePage === link.key
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage(link.key)
            }
          >
            <span className="nav-icon">
              {link.icon}
            </span>

            <span>{link.label}</span>
          </button>
        ))}

        {isRestaurantOwner && (
          <button
            type="button"
            className={`nav-item ${
              activePage === "owner"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("owner")
            }
          >
            <span className="nav-icon">
              🏪
            </span>

            <span>Owner Portal</span>
          </button>
        )}
        {isAdmin && (
          <button
            type="button"
            className={`nav-item ${
              activePage === "admin"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("admin")
            }
          >
            <span className="nav-icon">
              🛠️
            </span>

            <span>Admin Portal</span>
          </button>
        )}

      </nav>

      <div className="sidebar-notification-area">
        <NotificationBell />
      </div>

      <div className="sidebar-footer">
        <div className="profile-mini">
          <div className="avatar">
            {isRestaurantOwner ? "O" : "S"}
          </div>

          <div>
            <strong>
              {isRestaurantOwner
                ? "Restaurant Owner"
                : "Student"}
            </strong>

            <span>
              {storedUser?.email ||
                "CampusEats user"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Navbar;