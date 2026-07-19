import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function OwnerAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/owner/analytics"
      );

      setData(response.data);
    } catch (requestError) {
      console.error(
        "Owner analytics loading failed:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to load restaurant analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  const engagementTotal = useMemo(() => {
    if (!data) {
      return 0;
    }

    return (
      Number(data.favorite_count || 0) +
      Number(data.claim_count || 0)
    );
  }, [data]);

  const dealPercentage = useMemo(() => {
    if (!data?.menu_count) {
      return 0;
    }

    return Math.round(
      (Number(data.active_deals || 0) /
        Number(data.menu_count)) *
        100
    );
  }, [data]);

  const maxPrice = Math.max(
    1,
    Number(data?.highest_price || 0)
  );

  if (loading) {
    return (
      <section className="owner-analytics-state">
        <div className="search-spinner" />
        <h2>Loading restaurant analytics</h2>
        <p>
          Preparing menu and promotion insights.
        </p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="owner-analytics-state owner-error-card">
        <span>⚠️</span>
        <h2>Analytics unavailable</h2>
        <p>{error}</p>

        <button
          type="button"
          className="owner-primary-button"
          onClick={loadAnalytics}
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="owner-analytics-page">
      <div className="owner-analytics-heading">
        <div>
          <span className="owner-kicker">
            Restaurant performance
          </span>

          <h2>Analytics overview</h2>

          <p>
            Live statistics from your menu,
            flash deals, favorites, and claims.
          </p>
        </div>

        <button
          type="button"
          className="owner-refresh-button"
          onClick={loadAnalytics}
        >
          Refresh data
        </button>
      </div>

      <section className="owner-analytics-business-grid">
        <article>
          <span>💰</span>
          <div>
            <p>Total revenue</p>
            <strong>
              ${Number(data.total_revenue || 0).toFixed(2)}
            </strong>
            <small>Excludes cancelled orders</small>
          </div>
        </article>

        <article>
          <span>📦</span>
          <div>
            <p>Total orders</p>
            <strong>{data.order_count || 0}</strong>
            <small>Completed and active orders</small>
          </div>
        </article>

        <article>
          <span>📈</span>
          <div>
            <p>Today&apos;s revenue</p>
            <strong>
              ${Number(data.today_revenue || 0).toFixed(2)}
            </strong>
            <small>Revenue generated today</small>
          </div>
        </article>

        <article>
          <span>🏆</span>
          <div>
            <p>Best seller</p>
            <strong>{data.best_seller || "No sales yet"}</strong>
            <small>
              {data.best_seller
                ? `${data.best_seller_quantity || 0} sold`
                : "Waiting for order data"}
            </small>
          </div>
        </article>
      </section>

      <section className="owner-analytics-stat-grid">
        <article>
          <span>📋</span>
          <div>
            <p>Menu items</p>
            <strong>{data.menu_count}</strong>
            <small>
              Across {data.restaurant_count} restaurant
              {data.restaurant_count !== 1 ? "s" : ""}
            </small>
          </div>
        </article>

        <article>
          <span>🔥</span>
          <div>
            <p>Active deals</p>
            <strong>{data.active_deals}</strong>
            <small>
              {dealPercentage}% of the menu
            </small>
          </div>
        </article>

        <article>
          <span>🎟️</span>
          <div>
            <p>Deal claims</p>
            <strong>{data.claim_count}</strong>
            <small>Student redemptions</small>
          </div>
        </article>

        <article>
          <span>♥</span>
          <div>
            <p>Favorites</p>
            <strong>{data.favorite_count}</strong>
            <small>Saved by students</small>
          </div>
        </article>
      </section>

      <section className="owner-panel owner-revenue-chart-panel">
        <div className="owner-panel-heading">
          <div>
            <span className="owner-kicker">
              Revenue trend
            </span>
            <h2>Last 7 days</h2>
          </div>
        </div>

        <div className="owner-revenue-chart">
          {(data.revenue_by_day || []).map((day) => {
            const maxRevenue = Math.max(
              1,
              ...(data.revenue_by_day || []).map(
                (entry) => Number(entry.revenue || 0)
              )
            );

            const height = Math.max(
              6,
              (Number(day.revenue || 0) / maxRevenue) * 100
            );

            return (
              <div
                className="owner-revenue-bar-column"
                key={day.date}
              >
                <span>
                  ${Number(day.revenue || 0).toFixed(2)}
                </span>

                <div className="owner-revenue-bar-track">
                  <b
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <small>{day.label}</small>
              </div>
            );
          })}
        </div>
      </section>

      <section className="owner-analytics-content-grid">
        <article className="owner-panel">
          <div className="owner-panel-heading">
            <div>
              <span className="owner-kicker">
                Pricing
              </span>
              <h2>Menu price range</h2>
            </div>
          </div>

          <div className="owner-price-summary">
            <div>
              <span>Lowest price</span>
              <strong>
                $
                {Number(
                  data.lowest_price || 0
                ).toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Average price</span>
              <strong>
                $
                {Number(
                  data.average_price || 0
                ).toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Highest price</span>
              <strong>
                $
                {Number(
                  data.highest_price || 0
                ).toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="owner-price-bars">
            <div className="owner-price-row">
              <span>Lowest</span>
              <div>
                <b
                  style={{
                    width: `${
                      (Number(
                        data.lowest_price || 0
                      ) /
                        maxPrice) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="owner-price-row">
              <span>Average</span>
              <div>
                <b
                  style={{
                    width: `${
                      (Number(
                        data.average_price || 0
                      ) /
                        maxPrice) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="owner-price-row">
              <span>Highest</span>
              <div>
                <b style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        </article>

        <article className="owner-panel">
          <div className="owner-panel-heading">
            <div>
              <span className="owner-kicker">
                Engagement
              </span>
              <h2>Student activity</h2>
            </div>
          </div>

          <div className="owner-engagement-total">
            <span>Total interactions</span>
            <strong>{engagementTotal}</strong>
            <p>
              Combined favorites and flash-deal
              claims.
            </p>
          </div>

          <div className="owner-engagement-list">
            <div>
              <span>Deal claims</span>
              <strong>{data.claim_count}</strong>
            </div>

            <div>
              <span>Favorites</span>
              <strong>{data.favorite_count}</strong>
            </div>

            <div>
              <span>Claims per menu item</span>
              <strong>
                {data.menu_count
                  ? (
                      Number(data.claim_count || 0) /
                      Number(data.menu_count)
                    ).toFixed(1)
                  : "0.0"}
              </strong>
            </div>
          </div>
        </article>
      </section>

      <section className="owner-insight-card">
        <div>
          <span>💡</span>
        </div>

        <section>
          <span className="owner-kicker">
            Business insight
          </span>

          <h3>
            Most of your menu currently appears as
            flash deals
          </h3>

          <p>
            {data.active_deals} of {data.menu_count} menu
            items have an expiry date. Keep expiry dates
            only on real promotions so students can
            distinguish regular meals from limited-time
            offers.
          </p>
        </section>
      </section>
    </section>
  );
}

export default OwnerAnalytics;
