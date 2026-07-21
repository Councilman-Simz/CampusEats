function UserManager({
  users,
  onUpdateRole,
}) {
  return (
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
                  onUpdateRole(
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
  );
}

export default UserManager;
