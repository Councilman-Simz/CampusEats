import { useEffect, useState } from "react";
import api from "../services/api";

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setMessage("");

        const response = await api.get("/analytics/summary");
        setData(response.data);
      } catch (error) {
        console.error("Analytics loading failed:", error);

        setMessage(
          error.response?.data?.detail ||
            "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <main className="analytics-page">
        <div className="analytics-state">
          <div className="search-spinner" />
          <h2>Loading analytics</h2>
          <p>Preparing Savora activity data...</p>
        </div>
      </main>
    );
  }

  if (message || !data) {
    return (
      <main className="analytics-page">
        <div className="analytics-state analytics-error">
          <span>⚠️</span>
          <h2>Analytics unavailable</h2>
          <p>{message}</p>
        </div>
      </main>
    );
  }

  const maxQueryCount = Math.max(
    1,
    ...data.top_queries.map((item) => item.count)
  );

  const maxFavoriteCount = Math.max(
    1,
    ...data.top_favorites.map(
      (item) => item.favorite_count
    )
  );

  return (
    <main className="analytics-page">
      <section className="analytics-header">
        <span className="search-eyebrow">
          Platform insights
        </span>

        <h1>Savora Analytics</h1>

        <p>
          Track search activity, menu engagement, and the meals
          students save most often.
        </p>
      </section>

      <section className="analytics-stat-grid">
        <article className="analytics-stat-card">
          <span>🔎</span>
          <div>
            <p>Total searches</p>
            <strong>{data.total_searches}</strong>
          </div>
        </article>

        <article className="analytics-stat-card">
          <span>📈</span>
          <div>
            <p>Searches this week</p>
            <strong>{data.recent_searches}</strong>
          </div>
        </article>

        <article className="analytics-stat-card">
          <span>♥</span>
          <div>
            <p>Saved favorites</p>
            <strong>{data.total_favorites}</strong>
          </div>
        </article>

        <article className="analytics-stat-card">
          <span>🍽️</span>
          <div>
            <p>Menu items</p>
            <strong>{data.total_menu_items}</strong>
          </div>
        </article>
      </section>

      <section className="analytics-content-grid">
        <article className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <span className="search-eyebrow">
                Search behavior
              </span>
              <h2>Top search queries</h2>
            </div>
          </div>

          {data.top_queries.length === 0 ? (
            <div className="analytics-empty">
              <span>🔎</span>
              <p>No search activity recorded yet.</p>
            </div>
          ) : (
            <div className="analytics-ranking-list">
              {data.top_queries.map((item, index) => (
                <div
                  className="analytics-ranking-item"
                  key={item.query}
                >
                  <span className="analytics-rank">
                    {index + 1}
                  </span>

                  <div className="analytics-ranking-content">
                    <div>
                      <strong>{item.query}</strong>
                      <span>{item.count} searches</span>
                    </div>

                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-fill"
                        style={{
                          width: `${
                            (item.count / maxQueryCount) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <span className="search-eyebrow">
                Popular meals
              </span>
              <h2>Most favorited</h2>
            </div>
          </div>

          {data.top_favorites.length === 0 ? (
            <div className="analytics-empty">
              <span>♡</span>
              <p>No favorite activity recorded yet.</p>
            </div>
          ) : (
            <div className="analytics-ranking-list">
              {data.top_favorites.map((item, index) => (
                <div
                  className="analytics-ranking-item"
                  key={item.id}
                >
                  <span className="analytics-rank">
                    {index + 1}
                  </span>

                  <div className="analytics-ranking-content">
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.favorite_count} favorite
                        {item.favorite_count !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-fill analytics-bar-favorite"
                        style={{
                          width: `${
                            (item.favorite_count /
                              maxFavoriteCount) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default Analytics;