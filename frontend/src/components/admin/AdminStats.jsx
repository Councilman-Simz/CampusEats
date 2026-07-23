function AdminStats({ data, onRefresh }) {
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
    <>
      <section className="admin-dashboard-header">
        <div>
          <span className="owner-kicker">
            Platform administration
          </span>

          <h1>Savora Admin</h1>

          <p>
            Monitor users, restaurants, orders,
            revenue, and overall platform activity.
          </p>
        </div>

        <button
          type="button"
          className="owner-refresh-button"
          onClick={onRefresh}
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
    </>
  );
}

export default AdminStats;
