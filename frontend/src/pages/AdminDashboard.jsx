import { useEffect, useState } from "react";
import api from "../services/api";
import AdminStats from "../components/admin/AdminStats";
import RestaurantManager from "../components/admin/RestaurantManager";
import UserManager from "../components/admin/UserManager";
import AdminBreakdowns from "../components/admin/AdminBreakdowns";

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

  return (
    <main className="admin-dashboard">
      <AdminStats
        data={data}
        onRefresh={loadOverview}
      />

      {message && (
        <p className="owner-form-success">
          {message}
        </p>
      )}

      <RestaurantManager
        restaurants={restaurants}
        updatingRestaurantId={
          updatingRestaurantId
        }
        onUpdateStatus={
          updateRestaurantStatus
        }
        onToggleActive={
          toggleRestaurantActive
        }
      />

      <UserManager
        users={users}
        onUpdateRole={updateUserRole}
      />

      <AdminBreakdowns
        roleCounts={data.role_counts}
        orderStatusCounts={
          data.order_status_counts
        }
      />
    </main>
  );

}

export default AdminDashboard;
