import { useEffect, useState } from "react";
import api from "../services/api";
import { getCurrentUserId } from "../utils/auth";

function Recommendations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/recommendations/", {
          params: {
          user_id: getCurrentUserId(),
          limit: 5,
       },
     });

        setItems(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        console.error("Recommendations error:", requestError);

        setError(
          requestError.response?.data?.detail ||
            "Unable to load recommendations."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, []);

  function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return "Price unavailable";
    }

    return `$${numericPrice.toFixed(2)}`;
  }

  if (loading) {
    return (
      <section className="recommendations-section">
        <div className="section-heading">
          <div>
            <span className="page-eyebrow">Savora picks</span>
            <h2>Recommended for You</h2>
          </div>
        </div>

        <div className="recommendations-loading">
          Loading recommendations...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="recommendations-section">
        <div className="section-heading">
          <div>
            <span className="page-eyebrow">Savora picks</span>
            <h2>Recommended for You</h2>
          </div>
        </div>

        <div className="recommendations-error">{error}</div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="recommendations-section">
        <div className="section-heading">
          <div>
            <span className="page-eyebrow">Savora picks</span>
            <h2>Recommended for You</h2>
          </div>
        </div>

        <div className="recommendations-empty">
          No recommendations are available yet.
        </div>
      </section>
    );
  }

  return (
    <section className="recommendations-section">
      <div className="section-heading">
        <div>
          <span className="page-eyebrow">Savora picks</span>
          <h2>Recommended for You</h2>
        </div>

        <p>Meals selected from the latest Savora menu.</p>
      </div>

      <div className="recommendations-grid">
        {items.map((item) => (
          <article className="recommendation-card" key={item.id}>
            <div className="recommendation-card-icon" aria-hidden="true">
              🍽️
            </div>

            <div className="recommendation-card-content">
              <span className="recommendation-restaurant">
                Restaurant #{item.restaurant_id}
              </span>

              <div className="recommendation-title-row">
                <h3>{item.name}</h3>
                <strong>{formatPrice(item.price)}</strong>
              </div>

              <p>{item.description || "A Savora menu recommendation."}</p>

              {item.tags && (
                <div className="recommendation-tags">
                  {item.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Recommendations;