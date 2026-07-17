import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function formatStatus(value = "") {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    function handleNotification(event) {
      const notification = event.detail;

      if (
        notification?.type !== "order_status" ||
        !notification?.order_id
      ) {
        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === notification.order_id
            ? {
                ...order,
                status: notification.status,
              }
            : order
        )
      );
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
      setMessage("");

      const response = await api.get(
        "/orders/my"
      );

      setOrders(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "My orders loading failed:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
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

  const activeOrders = useMemo(
    () =>
      orders.filter((order) =>
        [
          "pending",
          "accepted",
          "preparing",
          "ready",
        ].includes(order.status)
      ).length,
    [orders]
  );

  if (loading) {
    return (
      <main className="my-orders-page">
        <div className="analytics-state">
          <div className="search-spinner" />
          <h2>Loading your orders</h2>
          <p>
            Checking your latest order status.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="my-orders-page">
      <section className="my-orders-header">
        <div>
          <span className="search-eyebrow">
            Order tracking
          </span>

          <h1>My Orders</h1>

          <p>
            Review your order history and track
            current pickup progress.
          </p>
        </div>

        <div className="my-orders-header-actions">
          <span>
            {activeOrders} active
          </span>

          <button
            type="button"
            onClick={loadOrders}
          >
            Refresh
          </button>
        </div>
      </section>

      <section className="my-orders-filter-bar">
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
      </section>

      {message && (
        <p className="error-message">
          {message}
        </p>
      )}

      {filteredOrders.length === 0 ? (
        <section className="my-orders-empty">
          <span>🧾</span>
          <h2>No orders found</h2>
          <p>
            Your orders will appear here after
            checkout.
          </p>
        </section>
      ) : (
        <section className="my-orders-list">
          {filteredOrders.map((order) => (
            <article
              className="my-order-card"
              key={order.id}
            >
              <div className="my-order-card-header">
                <div>
                  <span className="search-eyebrow">
                    Order #{order.id}
                  </span>

                  <h2>
                    ${Number(
                      order.total || 0
                    ).toFixed(2)}
                  </h2>

                  <small>
                    {formatDate(
                      order.created_at
                    )}
                  </small>
                </div>

                <span
                  className={`my-order-status my-order-status-${order.status}`}
                >
                  {formatStatus(order.status)}
                </span>
              </div>

              <div className="my-order-progress">
                {[
                  "pending",
                  "accepted",
                  "preparing",
                  "ready",
                  "completed",
                ].map((status, index) => {
                  const currentIndex = [
                    "pending",
                    "accepted",
                    "preparing",
                    "ready",
                    "completed",
                  ].indexOf(order.status);

                  const reached =
                    order.status !==
                      "cancelled" &&
                    index <= currentIndex;

                  return (
                    <div
                      className={
                        reached
                          ? "my-order-step reached"
                          : "my-order-step"
                      }
                      key={status}
                    >
                      <span>
                        {reached ? "✓" : index + 1}
                      </span>

                      <small>
                        {formatStatus(status)}
                      </small>
                    </div>
                  );
                })}
              </div>

              <div className="my-order-items">
                {(order.items || []).map(
                  (item) => (
                    <div
                      key={item.id}
                      className="my-order-item"
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
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default MyOrders;
