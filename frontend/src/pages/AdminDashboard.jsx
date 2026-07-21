import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRestaurantId, setUpdatingRestaurantId] =
    useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadOverview() {
    try {
      setLoading(true);
      setError("");

      const [
        overviewResponse,
        restaurantsResponse,
        usersResponse,
      ] = await Promise.all([
        api.get("/admin/overview"),
        api.get("/admin/restaurants"),
        api.get("/admin/users"),
      ]);

      setData(overviewResponse.data);

      setRestaurants(
        Array.isArray(restaurantsResponse.data)
          ? restaurantsResponse.data
          : []
      );

      setUsers(
        Array.isArray(usersResponse.data)
          ? usersResponse.data
          : []
      );
    } catch (requestError) {
      console.error(
        "Admin overview failed:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to load the admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateRestaurantStatus(
    restaurantId,
    nextStatus
  ) {
    try {
      setUpdatingRestaurantId(restaurantId);
      setError("");
      setMessage("");

      const response = await api.patch(
        `/admin/restaurants/${restaurantId}/status`,
        {
          status: nextStatus,
        }
      );

      setRestaurants((currentRestaurants) =>
        currentRestaurants.map((restaurant) =>
          restaurant.id === restaurantId
            ? {
                ...restaurant,
                ...response.data,
              }
            : restaurant
        )
      );

      setMessage(
        `Restaurant status updated to ${nextStatus}.`
      );

      await loadOverview();
    } catch (requestError) {
      console.error(
        "Restaurant status update failed:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to update restaurant status."
      );
    } finally {
      setUpdatingRestaurantId(null);
    }
  }

  async function toggleRestaurantActive(
    restaurant
  ) {
    try {
      setUpdatingRestaurantId(restaurant.id);
      setError("");
      setMessage("");

      const response = await api.patch(
        `/admin/restaurants/${restaurant.id}/active`,
        {
          is_active: !restaurant.is_active,
        }
      );

      setRestaurants((currentRestaurants) =>
        currentRestaurants.map((currentRestaurant) =>
          currentRestaurant.id === restaurant.id
            ? {
                ...currentRestaurant,
                ...response.data,
              }
            : currentRestaurant
        )
      );

      setMessage(
        response.data.is_active
          ? "Restaurant activated successfully."
          : "Restaurant deactivated successfully."
      );

      await loadOverview();
    } catch (requestError) {
      console.error(
        "Restaurant active-state update failed:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to update restaurant availability."
      );
    } finally {
      setUpdatingRestaurantId(null);
    }
  }

  async function updateUserRole(
    userId,
    nextRole
  ) {
    try {
      setError("");
      setMessage("");

      const response = await api.patch(
        `/admin/users/${userId}/role`,
        {
          role: nextRole,
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? response.data
            : user
        )
      );

      setMessage(
        `User role updated to ${nextRole}.`
      );

      await loadOverview();
    } catch (requestError) {
      console.error(
        "User role update failed:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to update user role."
      );
    }
  }

  useEffect(() => {
    loadOverview();
  }, []);

  if (loading) {
    return (
      <main className="admin-dashboard">
        <section className="owner-analytics-state">
          <div className="search-spinner" />
          <h2>Loading platform analytics</h2>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="admin-dashboard">
        <section className="owner-analytics-state owner-error-card">
          <span>⚠️</span>
          <h2>Admin dashboard unavailable</h2>
          <p>{error}</p>

          <button
            type="button"
            className="owner-primary-button"
            onClick={loadOverview}
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  const stats = [
    {
      label: "Users",
      value: data.user_count || 0,
      icon: "👥",
      note: "Registered accounts",
    },
    {
      label: "Restaurants",
      value: data.restaurant_count || 0,
      icon: "🍽️",
      note: `${data.active_restaurant_count || 0} active`,
    },
    {
      label: "Orders",
      value: data.order_count || 0,
      icon: "📦",
      note: "Platform orders",
    },
    {
      label: "Revenue",
      value: `$${Number(
        data.total_revenue || 0
      ).toFixed(2)}`,
      icon: "💰",
      note: "Excludes cancelled orders",
    },
    {
      label: "Menu items",
      value: data.menu_item_count || 0,
      icon: "📋",
      note: "Across all restaurants",
    },
  ];

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-header">
        <div>
          <span className="owner-kicker">
            Platform administration
          </span>
          <h1>CampusEats Admin</h1>
          <p>
            Monitor users, restaurants, orders,
            revenue, and overall platform activity.
          </p>
        </div>

        <button
          type="button"
          className="owner-refresh-button"
          onClick={loadOverview}
        >
          Refresh data
        </button>
      </section>

      <section className="admin-stat-grid">
        {stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.icon}</span>

            <div>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
              <small>{stat.note}</small>
            </div>
          </article>
        ))}
      </section>

      {message && (
        <p className="owner-form-success">
          {message}
        </p>
      )}

      <section className="owner-panel admin-restaurant-panel">
        <div className="owner-panel-heading">
          <div>
            <span className="owner-kicker">
              Restaurant operations
            </span>
            <h2>Restaurant management</h2>
            <p>
              Approve, reject, suspend, activate,
              or deactivate restaurants.
            </p>
          </div>
        </div>

        {restaurants.length === 0 ? (
          <p className="owner-empty-text">
            No restaurants are registered yet.
          </p>
        ) : (
          <div className="admin-restaurant-list">
            {restaurants.map((restaurant) => (
              <article
                className="admin-restaurant-row"
                key={restaurant.id}
              >
                <div className="admin-restaurant-copy">
                  <span className="owner-kicker">
                    Restaurant #{restaurant.id}
                  </span>

                  <h3>{restaurant.name}</h3>

                  <p>
                    {restaurant.cuisine ||
                      "Cuisine not provided"}
                    {" · "}
                    {restaurant.location ||
                      "Location not provided"}
                  </p>

                  <div className="admin-restaurant-meta">
                    <span>
                      Status:{" "}
                      <strong>
                        {restaurant.status || "pending"}
                      </strong>
                    </span>

                    <span>
                      {restaurant.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                    <span>
                      Owner ID:{" "}
                      {restaurant.owner_id ?? "Unassigned"}
                    </span>
                  </div>
                </div>

                <div className="admin-restaurant-actions">
                  <select
                    value={restaurant.status || "pending"}
                    onChange={(event) =>
                      updateRestaurantStatus(
                        restaurant.id,
                        event.target.value
                      )
                    }
                    disabled={
                      updatingRestaurantId ===
                      restaurant.id
                    }
                  >
                    <option value="pending">
                      Pending
                    </option>
                    <option value="approved">
                      Approved
                    </option>
                    <option value="rejected">
                      Rejected
                    </option>
                    <option value="suspended">
                      Suspended
                    </option>
                  </select>

                  <button
                    type="button"
                    className={
                      restaurant.is_active
                        ? "owner-delete-button"
                        : "owner-primary-button"
                    }
                    onClick={() =>
                      toggleRestaurantActive(
                        restaurant
                      )
                    }
                    disabled={
                      updatingRestaurantId ===
                      restaurant.id
                    }
                  >
                    {updatingRestaurantId ===
                    restaurant.id
                      ? "Saving..."
                      : restaurant.is_active
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="owner-panel admin-user-panel">
        <div className="owner-panel-heading">
          <div>
            <span className="owner-kicker">
              Account administration
            </span>
            <h2>User management</h2>
            <p>
              Review registered users and manage
              platform roles.
            </p>
          </div>
        </div>

        {users.length === 0 ? (
          <p className="owner-empty-text">
            No users are registered yet.
          </p>
        ) : (
          <div className="admin-user-list">
            {users.map((user) => (
              <article
                className="admin-user-row"
                key={user.id}
              >
                <div>
                  <span className="owner-kicker">
                    User #{user.id}
                  </span>

                  <h3>{user.email}</h3>

                  <p>
                    {user.campus ||
                      "Campus not provided"}
                    {" · "}
                    {user.dietary_preferences ||
                      "No dietary preference"}
                  </p>
                </div>

                <select
                  value={user.role || "student"}
                  onChange={(event) =>
                    updateUserRole(
                      user.id,
                      event.target.value
                    )
                  }
                >
                  <option value="student">
                    Student
                  </option>
                  <option value="restaurant_owner">
                    Restaurant owner
                  </option>
                  <option value="restaurant_staff">
                    Restaurant staff
                  </option>
                  <option value="admin">
                    Admin
                  </option>
                </select>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-content-grid">
        <article className="owner-panel">
          <div className="owner-panel-heading">
            <div>
              <span className="owner-kicker">
                Accounts
              </span>
              <h2>Users by role</h2>
            </div>
          </div>

          <div className="admin-breakdown-list">
            {Object.entries(
              data.role_counts || {}
            ).map(([role, count]) => (
              <div key={role}>
                <span>
                  {role
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (letter) =>
                      letter.toUpperCase()
                    )}
                </span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="owner-panel">
          <div className="owner-panel-heading">
            <div>
              <span className="owner-kicker">
                Operations
              </span>
              <h2>Orders by status</h2>
            </div>
          </div>

          <div className="admin-breakdown-list">
            {Object.entries(
              data.order_status_counts || {}
            ).map(([status, count]) => (
              <div key={status}>
                <span>
                  {status
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (letter) =>
                      letter.toUpperCase()
                    )}
                </span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

export default AdminDashboard;
