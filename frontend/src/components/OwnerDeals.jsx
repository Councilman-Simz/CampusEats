import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 16);
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(
    date.getTime() - offset * 60 * 1000
  );

  return localDate.toISOString().slice(0, 16);
}

function OwnerDeals({
  menuItems = [],
  onMenuItemsChange,
}) {
  const [deals, setDeals] = useState([]);
  const [selectedItemId, setSelectedItemId] =
    useState("");
  const [price, setPrice] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] =
    useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedItem = useMemo(
    () =>
      menuItems.find(
        (item) =>
          item.id === Number(selectedItemId)
      ) || null,
    [menuItems, selectedItemId]
  );

  const selectedDeal = useMemo(
    () =>
      deals.find(
        (item) =>
          item.id === Number(selectedItemId)
      ) || null,
    [deals, selectedItemId]
  );

  useEffect(() => {
    loadDeals();
  }, []);

  async function loadDeals() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/owner/deals"
      );

      setDeals(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (requestError) {
      console.error(
        "Failed to load owner deals:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to load flash deals."
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseMenuItem(event) {
    const itemId = event.target.value;
    setSelectedItemId(itemId);
    setMessage("");
    setError("");

    const item = menuItems.find(
      (menuItem) =>
        menuItem.id === Number(itemId)
    );

    if (!item) {
      setPrice("");
      setExpiresAt("");
      return;
    }

    setPrice(String(item.price ?? ""));
    setExpiresAt(
      toDateTimeLocal(item.expires_at)
    );
  }

  function editDeal(item) {
    setSelectedItemId(String(item.id));
    setPrice(String(item.price ?? ""));
    setExpiresAt(
      toDateTimeLocal(item.expires_at)
    );
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setSelectedItemId("");
    setPrice("");
    setExpiresAt("");
    setMessage("");
    setError("");
  }

  function updateParentMenu(updatedItem) {
    if (
      typeof onMenuItemsChange !== "function"
    ) {
      return;
    }

    onMenuItemsChange((currentItems) =>
      currentItems.map((item) =>
        item.id === updatedItem.id
          ? updatedItem
          : item
      )
    );
  }

  async function saveDeal(event) {
    event.preventDefault();

    if (!selectedItem) {
      setError("Choose a menu item.");
      return;
    }

    const numericPrice = Number(price);

    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      setError("Enter a valid deal price.");
      return;
    }

    if (!expiresAt) {
      setError("Choose a deal expiry time.");
      return;
    }

    const payload = {
      price: numericPrice,
      expires_at: `${expiresAt}:00`,
    };

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = selectedDeal
        ? await api.patch(
            `/owner/deals/${selectedItem.id}`,
            payload
          )
        : await api.post(
            `/owner/deals/${selectedItem.id}`,
            payload
          );

      setDeals((currentDeals) => {
        const alreadyExists =
          currentDeals.some(
            (deal) =>
              deal.id === response.data.id
          );

        if (alreadyExists) {
          return currentDeals.map((deal) =>
            deal.id === response.data.id
              ? response.data
              : deal
          );
        }

        return [
          response.data,
          ...currentDeals,
        ];
      });

      updateParentMenu(response.data);

      setMessage(
        selectedDeal
          ? "Flash deal updated successfully."
          : "Flash deal created successfully."
      );

      if (selectedDeal) {
        setTimeout(() => {
          resetForm();
        }, 2500);
      } else {
        resetForm();
      }
    } catch (requestError) {
      console.error(
        "Failed to save deal:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to save the flash deal."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeDeal(item) {
    const confirmed = window.confirm(
      `Remove the flash deal for "${item.name}"?`
    );

    if (!confirmed) return;

    try {
      setRemovingId(item.id);
      setMessage("");
      setError("");

      await api.delete(
        `/owner/deals/${item.id}`
      );

      setDeals((currentDeals) =>
        currentDeals.filter(
          (deal) => deal.id !== item.id
        )
      );

      if (
        typeof onMenuItemsChange ===
        "function"
      ) {
        onMenuItemsChange((currentItems) =>
          currentItems.map((menuItem) =>
            menuItem.id === item.id
              ? {
                  ...menuItem,
                  expires_at: null,
                }
              : menuItem
          )
        );
      }

      if (
        Number(selectedItemId) === item.id
      ) {
        resetForm();
      }

      setMessage(
        "Flash deal removed successfully."
      );
    } catch (requestError) {
      console.error(
        "Failed to remove deal:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to remove the flash deal."
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="owner-deals-grid">
      <article className="owner-panel">
        <div className="owner-panel-heading">
          <div>
            <span className="search-eyebrow">
              Deal editor
            </span>

            <h2>
              {selectedDeal
                ? "Update flash deal"
                : "Create flash deal"}
            </h2>
          </div>

          {selectedItemId && (
            <button
              type="button"
              className="owner-cancel-button"
              onClick={resetForm}
            >
              Clear
            </button>
          )}
        </div>

        <form
          className="owner-form"
          onSubmit={saveDeal}
        >
          <label>
            Menu item
            <select
              value={selectedItemId}
              onChange={chooseMenuItem}
              required
            >
              <option value="">
                Select a menu item
              </option>

              {menuItems.map((item) => (
                <option
                  value={item.id}
                  key={item.id}
                >
                  {item.name} — $
                  {Number(
                    item.price || 0
                  ).toFixed(2)}
                </option>
              ))}
            </select>
          </label>

          <div className="owner-form-row">
            <label>
              Deal price
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="7.99"
                required
              />
            </label>

            <label>
              Deal expires
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(event) =>
                  setExpiresAt(
                    event.target.value
                  )
                }
                required
              />
            </label>
          </div>

          {selectedItem && (
            <div className="owner-deal-selection">
              <span>Selected item</span>
              <strong>
                {selectedItem.name}
              </strong>
              <small>
                Current menu price: $
                {Number(
                  selectedItem.price || 0
                ).toFixed(2)}
              </small>
            </div>
          )}

          {error && (
            <p className="owner-form-error">
              {error}
            </p>
          )}

          {message && (
            <p className="owner-form-success">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="owner-save-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : selectedDeal
                 ? "Update flash deal"
                : "Create flash deal"}
              </button>
        </form>
      </article>

      <article className="owner-panel owner-deals-panel">
        <div className="owner-panel-heading">
          <div>
            <span className="search-eyebrow">
              Active promotions
            </span>

            <h2>
              {deals.length} flash deal
              {deals.length !== 1 ? "s" : ""}
            </h2>
          </div>

          <button
            type="button"
            className="owner-refresh-button"
            onClick={loadDeals}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="owner-empty-state">
            <div className="search-spinner" />
            <p>Loading flash deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="owner-empty-state">
            <span>🔥</span>
            <h3>No flash deals yet</h3>
            <p>
              Select a menu item and create
              your first promotion.
            </p>
          </div>
        ) : (
          <div className="owner-deals-list">
            {deals.map((item) => (
              <article
                className="owner-deal-card"
                key={item.id}
              >
                <div>
                  <span>
                    Deal #{item.id}
                  </span>

                  <h3>{item.name}</h3>

                  <p>
                    {item.description ||
                      "CampusEats flash deal"}
                  </p>

                  <small>
                    Expires:{" "}
                    {item.expires_at
                      ? new Date(
                          item.expires_at
                        ).toLocaleString()
                      : "No expiry"}
                  </small>
                </div>

                <div className="owner-deal-actions">
                  <strong>
                    $
                    {Number(
                      item.price || 0
                    ).toFixed(2)}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      editDeal(item)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="owner-delete-button"
                    onClick={() =>
                      removeDeal(item)
                    }
                    disabled={
                      removingId === item.id
                    }
                  >
                    {removingId === item.id
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default OwnerDeals;
