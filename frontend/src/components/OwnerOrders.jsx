import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const statusOptions = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

function formatDate(value) {
  if (!value) return "Time unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatStatus(value = "") {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] =
    useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    function handleNotification(event) {
      const notification = event.detail;

      if (
        notification?.type === "new_order"
      ) {
        loadOrders();
      }
    }

    window.addEventListener(
      "campuseats-notification",
      handleNotification
    );

    return () => {
      window.removeEventListener(
        "campuseats-notification",
        handleNotification
      );
    };
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/owner/orders"
      );

      setOrders(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (requestError) {
      console.error(
        "Owner orders loading failed:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to load restaurant orders."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    orderId,
    nextStatus
  ) {
    try {
      setUpdatingId(orderId);
      setError("");
      setMessage("");

      const response = await api.patch(
        `/owner/orders/${orderId}/status`,
        {
          status: nextStatus,
        }
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? response.data
            : order
        )
      );

      setMessage(
        `Order #${orderId} marked as ${formatStatus(
          nextStatus
        )}.`
      );
    } catch (requestError) {
      console.error(
        "Order status update failed:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to update the order."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    if (filter === "all") {
      return orders;
    }

    return orders.filter(
      (order) => order.status === filter
    );
  }, [orders, filter]);

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(
        (order) => order.status === "pending"
      ).length,
      active: orders.filter((order) =>
        [
          "accepted",
          "preparing",
          "ready",
        ].includes(order.status)
      ).length,
      completed: orders.filter(
        (order) => order.status === "completed"
      ).length,
    };
  }, [orders]);

  if (loading) {
    return (
      <section className="owner-orders-state">
        <div className="search-spinner" />
        <h2>Loading orders</h2>
        <p>
          Checking for new restaurant orders.
        </p>
      </section>
    );
  }

  return (
    <section className="owner-orders-page">
      <div className="owner-orders-heading">
        <div>
          <span className="owner-kicker">
            Order operations
          </span>

          <h2>Restaurant orders</h2>

          <p>
            Track incoming orders and update
            preparation status.
          </p>
        </div>

        <button
          type="button"
          className="owner-refresh-button"
          onClick={loadOrders}
        >
          Refresh orders
        </button>
      </div>

      <section className="owner-orders-stat-grid">
        <article>
          <span>🧾</span>
          <div>
            <p>Total orders</p>
            <strong>{orderStats.total}</strong>
          </div>
        </article>

        <article>
          <span>⏳</span>
          <div>
            <p>Pending</p>
            <strong>{orderStats.pending}</strong>
          </div>
        </article>

        <article>
          <span>👨‍🍳</span>
          <div>
            <p>In progress</p>
            <strong>{orderStats.active}</strong>
          </div>
        </article>

        <article>
          <span>✅</span>
          <div>
            <p>Completed</p>
            <strong>{orderStats.completed}</strong>
          </div>
        </article>
      </section>

      <div className="owner-orders-toolbar">
        <div className="owner-order-filters">
          {[
            "all",
            "pending",
            "accepted",
            "preparing",
            "ready",
            "completed",
            "cancelled",
          ].map((status) => (
            <button
              type="button"
              key={status}
              className={
                filter === status
                  ? "active"
                  : ""
              }
              onClick={() => setFilter(status)}
            >
              {formatStatus(status)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="owner-form-error">
          {error}
        </p>
      )}

      {message && (
        <p className="owner-form-success">
          {message}
        </p>
      )}

      {filteredOrders.length === 0 ? (
        <div className="owner-empty-state owner-orders-empty">
          <span>🧾</span>
          <h3>No orders found</h3>
          <p>
            Orders matching this status will
            appear here.
          </p>
        </div>
      ) : (
        <div className="owner-orders-list">
          {filteredOrders.map((order) => (
            <article
              className="owner-order-card"
              key={order.id}
            >
              <div className="owner-order-card-header">
                <div>
                  <span className="owner-kicker">
                    Order #{order.id}
                  </span>

                  <h3>
                    Customer #{order.user_id}
                  </h3>

                  <small>
                    {formatDate(order.created_at)}
                  </small>
                </div>

                <span
                  className={`owner-order-status owner-order-status-${order.status}`}
                >
                  {formatStatus(order.status)}
                </span>
              </div>

              <div className="owner-order-items">
                {(order.items || []).map(
                  (item) => (
                    <div
                      key={item.id}
                      className="owner-order-item"
                    >
                      <div>
                        <strong>
                          Menu item #
                          {item.menu_item_id}
                        </strong>

                        <span>
                          Quantity: {item.quantity}
                        </span>
                      </div>

                      <strong>
                        $
                        {(
                          Number(item.price || 0) *
                          Number(
                            item.quantity || 0
                          )
                        ).toFixed(2)}
                      </strong>
                    </div>
                  )
                )}
              </div>

              <div className="owner-order-card-footer">
                <div>
                  <span>Order total</span>
                  <strong>
                    $
                    {Number(
                      order.total || 0
                    ).toFixed(2)}
                  </strong>
                </div>

                <label>
                  Update status
                  <select
                    value={order.status}
                    disabled={
                      updatingId === order.id
                    }
                    onChange={(event) =>
                      updateStatus(
                        order.id,
                        event.target.value
                      )
                    }
                  >
                    {statusOptions.map(
                      (status) => (
                        <option
                          value={status}
                          key={status}
                        >
                          {formatStatus(status)}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OwnerOrders;
