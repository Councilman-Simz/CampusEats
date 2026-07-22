import useFavorites from "../hooks/useFavorites";
import FoodCard from "../components/FoodCard";

import healthyBowl from "../assets/food/healthy-spinach-bowl.jpg";
import bbqPlatter from "../assets/food/grilled-bbq-platter.jpg";
import pizza from "../assets/food/hawaiian-chicken-pizza.jpg";
import cheesecake from "../assets/food/orange-cheesecake.jpg";
import skewers from "../assets/food/grilled-beef-skewers.jpg";
import bbqChicken from "../assets/food/bbq-sausages-and-chicken.jpg";

function getFoodImage(
  name = "",
  tags = "",
  category = ""
) {
  const text =
    `${name} ${tags} ${category}`.toLowerCase();

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

function Favorites() {
  const {
    favorites,
    loading,
    message,
    removingIds,
    removeFavorite,
  } = useFavorites();

  return (
    <main className="favorites-page">
      <section className="favorites-header">
        <span className="search-eyebrow">
          Saved meals
        </span>

        <h1>My Favorites</h1>

        <p>
          Meals you saved for quick access.
        </p>
      </section>

      {loading && (
        <div className="favorites-state">
          <div className="search-spinner" />
          <h2>Loading favorites</h2>
          <p>Fetching your saved meals...</p>
        </div>
      )}

      {!loading && message && (
        <div className="favorites-state favorites-error">
          <span>⚠️</span>
          <h2>Favorites update</h2>
          <p>{message}</p>
        </div>
      )}

      {!loading &&
        !message &&
        favorites.length === 0 && (
          <div className="favorites-state">
            <span className="favorites-empty-icon">
              ♡
            </span>

            <h2>No favorites yet</h2>

            <p>
              Browse meals and click the heart
              icon to save them.
            </p>
          </div>
        )}

      {!loading &&
        !message &&
        favorites.length > 0 && (
          <section className="favorites-grid">
            {favorites.map((item) => {
              const fallbackImage =
                getFoodImage(
                  item.name,
                  item.tags,
                  item.category
                );

              return (
                <FoodCard
                  key={item.id}
                  item={item}
                  imageSrc={
                    item.image_url ||
                    fallbackImage
                  }
                  fallbackImageSrc={
                    fallbackImage
                  }
                  isFavorite
                  favoriteDisabled={
                    removingIds.includes(
                      item.id
                    )
                  }
                  onToggleFavorite={
                    removeFavorite
                  }
                />
              );
            })}
          </section>
        )}
    </main>
  );
}

export default Favorites;
