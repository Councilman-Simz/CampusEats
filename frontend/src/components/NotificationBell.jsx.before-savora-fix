import { useEffect, useMemo, useRef, useState } from "react";

const WS_BASE_URL = import.meta.env.VITE_WS_URL;

function formatNotificationTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getNotificationIcon(type, status) {
  if (type === "new_order") {
    return "🧾";
  }

  if (status === "accepted") {
    return "👍";
  }

  if (status === "preparing") {
    return "👨‍🍳";
  }

  if (status === "ready") {
    return "✅";
  }

  if (status === "completed") {
    return "🎉";
  }

  if (status === "cancelled") {
    return "❌";
  }

  return "🔔";
}

function NotificationBell() {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  }, []);

  const userId = storedUser?.id;
  const storageKey = userId
    ? `campusEatsNotifications:${userId}`
    : "campusEatsNotifications";

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const toastTimerRef = useRef(null);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify(notifications)
    );
  }, [notifications, storageKey]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    let stopped = false;

    function clearConnectionTimers() {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    function connect() {
      if (stopped) {
        return;
      }

      const socket = new WebSocket(
        `${WS_BASE_URL}/ws/notifications/${userId}`
      );

      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);

        heartbeatRef.current = setInterval(() => {
          if (
            socket.readyState === WebSocket.OPEN
          ) {
            socket.send("ping");
          }
        }, 25000);
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          const notification = {
            id: `${Date.now()}-${Math.random()}`,
            type: payload.type || "notification",
            title:
              payload.title || "New notification",
            message:
              payload.message ||
              "You have a new update.",
            order_id: payload.order_id ?? null,
            restaurant_id:
              payload.restaurant_id ?? null,
            status: payload.status || null,
            created_at: new Date().toISOString(),
            read: false,
          };

          setNotifications((current) => [
            notification,
            ...current,
          ].slice(0, 50));

          window.dispatchEvent(
            new CustomEvent(
              "campuseats-notification",
              {
                detail: notification,
              }
            )
          );

          setToast(notification);

          if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
          }

          toastTimerRef.current = setTimeout(() => {
            setToast(null);
          }, 5000);
        } catch (error) {
          console.error(
            "Invalid WebSocket notification:",
            error
          );
        }
      };

      socket.onerror = (error) => {
        console.error(
          "Notification WebSocket error:",
          error
        );
      };

      socket.onclose = () => {
        setConnected(false);

        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }

        if (!stopped) {
          reconnectTimerRef.current = setTimeout(
            connect,
            3000
          );
        }
      };
    }

    connect();

    return () => {
      stopped = true;
      clearConnectionTimers();

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userId]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function toggleDropdown() {
    setOpen((current) => !current);
  }

  function markAllRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  function markAsRead(notificationId) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  }

  function clearNotifications() {
    setNotifications([]);
    setOpen(false);
  }

  if (!userId) {
    return null;
  }

  return (
    <>
      <div
        className="notification-bell-wrapper"
        ref={dropdownRef}
      >
        <button
          type="button"
          className="notification-bell-button"
          onClick={toggleDropdown}
          aria-label="Open notifications"
          aria-expanded={open}
        >
          <span>🔔</span>

          {unreadCount > 0 && (
            <b>
              {unreadCount > 9
                ? "9+"
                : unreadCount}
            </b>
          )}
        </button>

        <span
          className={`notification-connection-dot ${
            connected
              ? "notification-connected"
              : "notification-disconnected"
          }`}
          title={
            connected
              ? "Live notifications connected"
              : "Notifications reconnecting"
          }
        />

        {open && (
          <div className="notification-dropdown">
            <div className="notification-dropdown-header">
              <div>
                <strong>Notifications</strong>
                <span>
                  {unreadCount} unread
                </span>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="notification-empty">
                <span>🔔</span>
                <strong>No notifications yet</strong>
                <p>
                  Order updates will appear here.
                </p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map(
                  (notification) => (
                    <button
                      type="button"
                      className={`notification-item ${
                        notification.read
                          ? ""
                          : "notification-unread"
                      }`}
                      key={notification.id}
                      onClick={() =>
                        markAsRead(
                          notification.id
                        )
                      }
                    >
                      <span className="notification-icon">
                        {getNotificationIcon(
                          notification.type,
                          notification.status
                        )}
                      </span>

                      <div>
                        <strong>
                          {notification.title}
                        </strong>

                        <p>
                          {notification.message}
                        </p>

                        <small>
                          {formatNotificationTime(
                            notification.created_at
                          )}
                        </small>
                      </div>
                    </button>
                  )
                )}
              </div>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                className="notification-clear-button"
                onClick={clearNotifications}
              >
                Clear notifications
              </button>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div className="notification-toast">
          <span>
            {getNotificationIcon(
              toast.type,
              toast.status
            )}
          </span>

          <div>
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>

          <button
            type="button"
            aria-label="Close notification"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

export default NotificationBell;
