function RestaurantManager({
  restaurants,
  updatingRestaurantId,
  onUpdateStatus,
  onToggleActive,
}) {
  return (
    <section className="owner-panel admin-restaurant-panel">
      <div className="owner-panel-heading">
        <div>
          <span className="owner-kicker">
            Restaurant operations
          </span>

          <h2>Restaurant management</h2>

          <p>
            Approve, reject, suspend,
            activate or deactivate restaurants.
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
                    Status:
                    <strong>
                      {" "}
                      {restaurant.status}
                    </strong>
                  </span>

                  <span>
                    {restaurant.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                  <span>
                    Owner ID:
                    {" "}
                    {restaurant.owner_id ??
                      "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="admin-restaurant-actions">
                <select
                  value={restaurant.status}
                  onChange={(e) =>
                    onUpdateStatus(
                      restaurant.id,
                      e.target.value
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
                  disabled={
                    updatingRestaurantId ===
                    restaurant.id
                  }
                  onClick={() =>
                    onToggleActive(
                      restaurant
                    )
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
  );
}

export default RestaurantManager;
