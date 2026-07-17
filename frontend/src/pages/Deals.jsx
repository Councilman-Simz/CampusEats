import { useEffect, useState } from "react";
import api from "../services/api";

function Deals() {
  const [deals, setDeals] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  async function loadDeals() {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/deals/");
      setDeals(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Could not load flash deals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeals();
  }, []);

  async function claimDeal(itemId) {
    setClaimingId(itemId);
    setMessage("");

    try {
      const response = await api.post(`/deals/${itemId}/claim`);

      setMessage(
        response.data?.message || "Flash deal claimed successfully."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.detail ||
          "Could not claim this deal."
      );
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Save food and money</p>
          <h1>Flash Deals</h1>
          <p className="page-subtitle">
            Claim discounted meals before they expire.
          </p>
        </div>

        <span className="deal-badge">🔥 Live deals</span>
      </div>

      {loading && (
        <p className="status-message">
          Loading deals...
        </p>
      )}

      {message && (
        <p className="status-message">
          {message}
        </p>
      )}

      {!loading && deals.length === 0 && (
        <div className="empty-state">
          <h3>No flash deals available</h3>
          <p>Check back again soon.</p>
        </div>
      )}

      <div className="card-grid">
        {deals.map((deal) => (
          <article className="deal-card" key={deal.id}>
            <div className="deal-top">
              <span className="discount-label">
                Limited time
              </span>

              <span className="deal-icon">🔥</span>
            </div>

            <h3>{deal.name}</h3>

            <p>
              {deal.description ||
                "Fresh food available at a discount."}
            </p>

            <div className="deal-price-row">
              <strong>
                ${Number(deal.price).toFixed(2)}
              </strong>

              <span>Ends soon</span>
            </div>

            <p className="expiry-text">
              Expires:{" "}
              {deal.expires_at
                ? new Date(deal.expires_at).toLocaleString()
                : "Not specified"}
            </p>

            <button
              type="button"
              className="claim-button"
              disabled={claimingId === deal.id}
              onClick={() => claimDeal(deal.id)}
            >
              {claimingId === deal.id
                ? "Claiming..."
                : "Claim deal"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Deals;