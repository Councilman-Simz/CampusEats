import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function OwnerInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/owner/insights/"
      );

      setData(response.data);
    } catch (requestError) {
      console.error(
        "Owner insights loading failed:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to load business insights."
      );
    } finally {
      setLoading(false);
    }
  }

  const maxItemSales = useMemo(() => {
    if (!data?.top_items?.length) {
      return 1;
    }

    return Math.max(
      ...data.top_items.map(
        (item) => Number(item.quantity_sold || 0)
      ),
      1
    );
  }, [data]);

  const maxRevenue = useMemo(() => {
    if (!data?.revenue_by_day?.length) {
      return 1;
    }

    return Math.max(
      ...data.revenue_by_day.map(
        (item) => Number(item.revenue || 0)
      ),
      1
    );
  }, [data]);

  if (loading) {
    return (
      <section className="owner-insights-state">
        <div className="search-spinner" />
        <h2>Generating business insights</h2>
        <p>
          Analyzing menu sales, revenue, and
          customer ordering behavior.
        </p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="owner-insights-state owner-error-card">
        <span>⚠️</span>
        <h2>Insights unavailable</h2>
        <p>{error}</p>

        <button
          type="button"
          className="owner-primary-button"
          onClick={loadInsights}
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="owner-insights-page">
      <div className="owner-insights-heading">
        <div>
          <span className="owner-kicker">
            AI business intelligence
          </span>

          <h2>Restaurant insights</h2>

          <p>
            Actionable recommendations based on
            your real order and menu data.
          </p>
        </div>

        <button
          type="button"
          className="owner-refresh-button"
          onClick={loadInsights}
        >
          Refresh insights
        </button>
      </div>

      <section className="owner-insights-stat-grid">
        <article>
          <span>🧾</span>
          <div>
            <p>Total orders</p>
            <strong>
              {data.summary.total_orders}
            </strong>
          </div>
        </article>

        <article>
          <span>💰</span>
          <div>
            <p>Total revenue</p>
            <strong>
              $
              {Number(
                data.summary.total_revenue || 0
              ).toFixed(2)}
            </strong>
          </div>
        </article>

        <article>
          <span>🛒</span>
          <div>
            <p>Average order</p>
            <strong>
              $
              {Number(
                data.summary.average_order_value || 0
              ).toFixed(2)}
            </strong>
          </div>
        </article>

        <article>
          <span>🏪</span>
          <div>
            <p>Restaurants</p>
            <strong>
              {data.summary.restaurant_count}
            </strong>
          </div>
        </article>
      </section>

      <section className="owner-insights-recommendations">
        <div className="owner-panel-heading">
          <div>
            <span className="owner-kicker">
              Recommended actions
            </span>
            <h2>What to do next</h2>
          </div>
        </div>

        <div className="owner-recommendation-grid">
          {data.recommendations.map(
            (recommendation, index) => (
              <article
                className={`owner-recommendation-card owner-recommendation-${recommendation.type}`}
                key={`${recommendation.type}-${index}`}
              >
                <span>
                  {recommendation.type ===
                  "popular_item"
                    ? "🔥"
                    : recommendation.type ===
                        "slow_item"
                      ? "📉"
                      : recommendation.type ===
                          "basket_size"
                        ? "🛒"
                        : "💡"}
                </span>

                <div>
                  <h3>
                    {recommendation.title}
                  </h3>

                  <p>
                    {recommendation.message}
                  </p>
                </div>
              </article>
            )
          )}

          {!data.recommendations.length && (
            <div className="owner-empty-state">
              <span>💡</span>
              <h3>No recommendations yet</h3>
              <p>
                More insights will appear as
                additional order data is collected.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="owner-insights-content-grid">
        <article className="owner-panel">
          <div className="owner-panel-heading">
            <div>
              <span className="owner-kicker">
                Menu performance
              </span>
              <h2>Top-selling items</h2>
            </div>
          </div>

          <div className="owner-insight-ranking-list">
            {data.top_items.map(
              (item, index) => (
                <div
                  className="owner-insight-ranking-item"
                  key={item.id}
                >
                  <span>
                    {index + 1}
                  </span>

                  <div>
                    <div>
                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.quantity_sold} sold · $
                        {Number(
                          item.revenue || 0
                        ).toFixed(2)}
                      </small>
                    </div>

                    <div className="owner-insight-bar">
                      <b
                        style={{
                          width: `${
                            (Number(
                              item.quantity_sold || 0
                            ) /
                              maxItemSales) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            )}

            {!data.top_items.length && (
              <div className="owner-empty-state">
                <span>📊</span>
                <h3>No sales data yet</h3>
              </div>
            )}
          </div>
        </article>

        <article className="owner-panel">
          <div className="owner-panel-heading">
            <div>
              <span className="owner-kicker">
                Revenue trend
              </span>
              <h2>Recent revenue</h2>
            </div>
          </div>

          <div className="owner-revenue-chart">
            {data.revenue_by_day.map(
              (day) => (
                <div
                  className="owner-revenue-column"
                  key={day.date}
                >
                  <div>
                    <b
                      style={{
                        height: `${Math.max(
                          12,
                          (Number(
                            day.revenue || 0
                          ) /
                            maxRevenue) *
                            100
                        )}%`,
                      }}
                    />
                  </div>

                  <strong>
                    $
                    {Number(
                      day.revenue || 0
                    ).toFixed(0)}
                  </strong>

                  <span>{day.date}</span>

                  <small>
                    {day.orders} order
                    {day.orders !== 1 ? "s" : ""}
                  </small>
                </div>
              )
            )}

            {!data.revenue_by_day.length && (
              <div className="owner-empty-state">
                <span>📈</span>
                <h3>No recent revenue</h3>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="owner-panel">
        <div className="owner-panel-heading">
          <div>
            <span className="owner-kicker">
              Opportunity list
            </span>
            <h2>Items without recorded sales</h2>
          </div>
        </div>

        <div className="owner-unsold-grid">
          {data.unsold_items.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>Menu item #{item.id}</span>
              </div>

              <b>
                $
                {Number(
                  item.price || 0
                ).toFixed(2)}
              </b>
            </article>
          ))}

          {!data.unsold_items.length && (
            <p>
              Every menu item has recorded sales.
            </p>
          )}
        </div>
      </section>
    </section>
  );
}

export default OwnerInsights;
