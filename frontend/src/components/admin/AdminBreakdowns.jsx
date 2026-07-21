function formatLabel(value = "") {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function AdminBreakdowns({
  roleCounts = {},
  orderStatusCounts = {},
}) {
  return (
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
          {Object.entries(roleCounts).map(
            ([role, count]) => (
              <div key={role}>
                <span>{formatLabel(role)}</span>
                <strong>{count}</strong>
              </div>
            )
          )}
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
          {Object.entries(orderStatusCounts).map(
            ([status, count]) => (
              <div key={status}>
                <span>{formatLabel(status)}</span>
                <strong>{count}</strong>
              </div>
            )
          )}
        </div>
      </article>
    </section>
  );
}

export default AdminBreakdowns;
