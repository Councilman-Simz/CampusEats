import { useEffect, useRef, useState } from "react";
import api from "../services/api";

import healthyBowl from "../assets/food/healthy-spinach-bowl.jpg";
import bbqPlatter from "../assets/food/grilled-bbq-platter.jpg";
import pizza from "../assets/food/hawaiian-chicken-pizza.jpg";
import cheesecake from "../assets/food/orange-cheesecake.jpg";
import skewers from "../assets/food/grilled-beef-skewers.jpg";
import bbqChicken from "../assets/food/bbq-sausages-and-chicken.jpg";

function getFoodImage(name = "", tags = "", category = "") {
  const text = `${name} ${tags} ${category}`.toLowerCase();

  if (text.includes("pizza")) {
    return pizza;
  }

  if (
    text.includes("bbq") ||
    text.includes("sausage")
  ) {
    return bbqChicken;
  }

  if (
    text.includes("chicken") ||
    text.includes("wings") ||
    text.includes("barbecue") ||
    text.includes("burger")
  ) {
    return bbqPlatter;
  }

  if (
    text.includes("beef") ||
    text.includes("steak") ||
    text.includes("kebab") ||
    text.includes("skewer")
  ) {
    return skewers;
  }

  if (
    text.includes("dessert") ||
    text.includes("cake") ||
    text.includes("cheesecake") ||
    text.includes("muffin")
  ) {
    return cheesecake;
  }

  return healthyBowl;
}

function ImageSearch({ onOpenRestaurant }) {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteLoadingIds, setFavoriteLoadingIds] =
    useState([]);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const response = await api.get("/favorites/", {
          params: {
            user_id: 1,
          },
        });

        const items = Array.isArray(response.data)
          ? response.data
          : [];

        setFavoriteIds(items.map((item) => item.id));
      } catch (error) {
        console.error(
          "Failed to load favorites:",
          error
        );
      }
    }

    loadFavorites();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function chooseFile(file) {
    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "Upload a JPEG, PNG, or WebP image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage(
        "Image must be smaller than 5 MB."
      );
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults([]);
    setMessage("");
  }

  function handleFileChange(event) {
    chooseFile(event.target.files?.[0]);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setDragActive(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);

    chooseFile(
      event.dataTransfer.files?.[0]
    );
  }

  async function handleImageSearch() {
    if (!selectedFile) {
      setMessage(
        "Choose a food image first."
      );
      return;
    }

    setLoading(true);
    setMessage("");
    setResults([]);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post(
        "/image-search/",
        formData,
        {
          params: {
            limit: 5,
          },
        }
      );

      const items = Array.isArray(response.data)
        ? response.data
        : [];

      setResults(items);

      if (items.length === 0) {
        setMessage(
          "No visually similar meals were found."
        );
      }
    } catch (error) {
      console.error(
        "Image search failed:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Unable to process the selected image."
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(itemId) {
    if (
      favoriteLoadingIds.includes(itemId)
    ) {
      return;
    }

    const isFavorite =
      favoriteIds.includes(itemId);

    setFavoriteLoadingIds((currentIds) => [
      ...currentIds,
      itemId,
    ]);

    try {
      if (isFavorite) {
        await api.delete(
          `/favorites/${itemId}`,
          {
            params: {
              user_id: 1,
            },
          }
        );

        setFavoriteIds((currentIds) =>
          currentIds.filter(
            (id) => id !== itemId
          )
        );
      } else {
        await api.post(
          `/favorites/${itemId}`,
          null,
          {
            params: {
              user_id: 1,
            },
          }
        );

        setFavoriteIds((currentIds) => [
          ...currentIds,
          itemId,
        ]);
      }
    } catch (error) {
      console.error(
        "Favorite update failed:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Unable to update favorite."
      );
    } finally {
      setFavoriteLoadingIds(
        (currentIds) =>
          currentIds.filter(
            (id) => id !== itemId
          )
      );
    }
  }

  function resetSearch() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setResults([]);
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openRestaurant(item) {
    if (
      typeof onOpenRestaurant !== "function"
    ) {
      return;
    }

    onOpenRestaurant({
      id: item.restaurant_id,
      name:
        item.restaurant_name ||
        `Restaurant #${item.restaurant_id}`,
    });
  }

  function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return "Price unavailable";
    }

    return `$${numericPrice.toFixed(2)}`;
  }

  return (
    <main className="image-search-page">
      <section className="image-search-header">
        <span className="search-eyebrow">
          Multimodal AI discovery
        </span>

        <h1>Find meals using a photo</h1>

        <p>
          Upload a food picture and CampusEats will use
          CLIP to identify visually similar menu items.
        </p>
      </section>

      <section className="image-search-workspace">
        <article className="image-upload-panel">
          <div
            className={`image-drop-zone ${
              dragActive
                ? "image-drop-zone-active"
                : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() =>
              fileInputRef.current?.click()
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              hidden
            />

            {previewUrl ? (
              <div className="image-preview-wrapper">
                <img
                  src={previewUrl}
                  alt="Selected food preview"
                  className="image-search-preview"
                />

                <span className="image-preview-label">
                  Ready to analyze
                </span>
              </div>
            ) : (
              <div className="image-upload-empty">
                <span className="image-upload-icon">
                  📷
                </span>

                <h2>Upload a food photo</h2>

                <p>
                  Drag and drop an image here or click to
                  choose one from your computer.
                </p>

                <small>
                  JPEG, PNG or WebP · maximum 5 MB
                </small>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="selected-image-details">
              <div>
                <strong>
                  {selectedFile.name}
                </strong>

                <span>
                  {(
                    selectedFile.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </span>
              </div>

              <button
                type="button"
                onClick={resetSearch}
              >
                Remove
              </button>
            </div>
          )}

          <button
            type="button"
            className="image-search-submit-button"
            onClick={handleImageSearch}
            disabled={!selectedFile || loading}
          >
            {loading
              ? "Analyzing image..."
              : "Find similar meals"}
          </button>

          {message && (
            <div className="image-search-message">
              <span>ℹ️</span>
              <p>{message}</p>
            </div>
          )}
        </article>

        <aside className="image-search-guide">
          <div className="image-guide-icon">
            ✨
          </div>

          <span className="search-eyebrow">
            How it works
          </span>

          <h2>Visual food matching</h2>

          <p>
            CLIP turns your image into a vector and compares
            it with menu-item vectors stored in PostgreSQL.
          </p>

          <div className="image-guide-steps">
            <div>
              <strong>1</strong>

              <span>
                Choose a clear food photo
              </span>
            </div>

            <div>
              <strong>2</strong>

              <span>
                CampusEats analyzes the image
              </span>
            </div>

            <div>
              <strong>3</strong>

              <span>
                Similar menu items are ranked
              </span>
            </div>
          </div>

          <div className="image-guide-tip">
            <span>💡</span>

            <p>
              Photos with one main meal and good lighting
              usually produce the best matches.
            </p>
          </div>
        </aside>
      </section>

      {loading && (
        <section className="image-search-status">
          <div className="search-spinner" />

          <div>
            <h2>Analyzing your photo</h2>

            <p>
              CampusEats is comparing it with menu
              embeddings.
            </p>
          </div>
        </section>
      )}

      {!loading && results.length > 0 && (
        <section className="image-search-results">
          <div className="image-results-heading">
            <div>
              <span className="search-eyebrow">
                Visual matches
              </span>

              <h2>
                {results.length} similar meal
                {results.length !== 1 ? "s" : ""}
              </h2>
            </div>

            <button
              type="button"
              onClick={resetSearch}
            >
              Search another photo
            </button>
          </div>

          <div className="image-result-list">
            {results.map((item, index) => {
              const itemId = item.id ?? index;

              const isFavorite =
                favoriteIds.includes(itemId);

              const isFavoriteLoading =
                favoriteLoadingIds.includes(
                  itemId
                );

              const tags = (item.tags || "")
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);

              return (
                <article
                  className="image-result-card"
                  key={itemId}
                >
                  <div className="image-result-media">
                    <img
                      src={
                        item.image_url ||
                        getFoodImage(
                          item.name,
                          item.tags,
                          item.category
                        )
                      }
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.src =
                          getFoodImage(
                            item.name,
                            item.tags,
                            item.category
                          );
                      }}
                    />

                    <span className="image-match-rank">
                      Match #{index + 1}
                    </span>
                  </div>

                  <div className="image-result-content">
                    <span className="image-result-restaurant">
                      🍴 Restaurant #
                      {item.restaurant_id}
                    </span>

                    <h3>{item.name}</h3>

                    <p>
                      {item.description ||
                        "A visually similar CampusEats meal."}
                    </p>

                    <div className="image-result-tags">
                      {tags
                        .slice(0, 4)
                        .map((tag) => (
                          <span key={tag}>
                            {tag}
                          </span>
                        ))}
                    </div>

                    <div className="image-result-footer">
                      <strong>
                        {formatPrice(item.price)}
                      </strong>

                      <div>
                        <button
                          type="button"
                          className="image-details-button"
                          onClick={() =>
                            openRestaurant(item)
                          }
                        >
                          View details
                        </button>

                        <button
                          type="button"
                          className={`favorite-result-button ${
                            isFavorite
                              ? "favorite-active"
                              : ""
                          }`}
                          onClick={() =>
                            toggleFavorite(itemId)
                          }
                          disabled={
                            isFavoriteLoading
                          }
                          aria-label={
                            isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          {isFavoriteLoading
                            ? "…"
                            : isFavorite
                              ? "♥"
                              : "♡"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

export default ImageSearch;
