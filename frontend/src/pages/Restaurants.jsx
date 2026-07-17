import { useEffect, useState } from "react";
import api from "../services/api";
import RestaurantDetails from "./RestaurantDetails";

import restaurant1 from "../assets/restaurants/restaurant-1.jpg";
import restaurant2 from "../assets/restaurants/restaurant-2.jpg";
import restaurant3 from "../assets/restaurants/restaurant-3.jpg";
import restaurant4 from "../assets/restaurants/restaurant-4.jpg";

const restaurantImages = [
  restaurant1,
  restaurant2,
  restaurant3,
  restaurant4,
];

function Restaurants({
  initialRestaurant = null,
  onRestaurantChange,
}) {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(
    initialRestaurant
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedRestaurant(initialRestaurant);
  }, [initialRestaurant]);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const response = await api.get("/restaurants/");
        const data = Array.isArray(response.data)
          ? response.data
          : [];

        setRestaurants(data);
      } catch (error) {
        console.error("Could not load restaurants:", error);
        setMessage("Could not load restaurants.");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, []);

  function selectRestaurant(restaurant, index) {
    const restaurantWithImage = {
      ...restaurant,
      image: restaurantImages[index % restaurantImages.length],
    };

    setSelectedRestaurant(restaurantWithImage);
    onRestaurantChange?.(restaurantWithImage);
  }

  function closeRestaurantDetails() {
    setSelectedRestaurant(null);
    onRestaurantChange?.(null);
  }

  if (selectedRestaurant) {
    return (
      <RestaurantDetails
        restaurant={selectedRestaurant}
        onBack={closeRestaurantDetails}
      />
    );
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Explore</p>
          <h1>Restaurants</h1>
          <p className="page-subtitle">
            Browse campus dining locations and nearby food spots.
          </p>
        </div>

        <span className="count-badge">
          {restaurants.length} locations
        </span>
      </div>

      {loading && (
        <p className="status-message">
          Loading restaurants...
        </p>
      )}

      {message && (
        <p className="error-message">
          {message}
        </p>
      )}

      <div className="card-grid">
        {restaurants.map((restaurant, index) => (
          <article
            className="restaurant-card"
            key={restaurant.id}
          >
            <img
              className="restaurant-photo"
              src={
                restaurantImages[
                  index % restaurantImages.length
                ]
              }
              alt={restaurant.name}
            />

            <div className="restaurant-body">
              <div className="card-heading">
                <h3>{restaurant.name}</h3>
                <span className="rating">★ 4.8</span>
              </div>

              <p className="restaurant-location">
                📍{" "}
                {restaurant.location ||
                  "Location unavailable"}
              </p>

              <p className="restaurant-hours">
                🕒{" "}
                {restaurant.hours ||
                  "Hours unavailable"}
              </p>

              <div className="tag-row">
                <span className="tag">
                  Student friendly
                </span>

                <span className="tag">
                  Nearby
                </span>
              </div>

              <button
                type="button"
                className="card-action"
                onClick={() =>
                  selectRestaurant(restaurant, index)
                }
              >
                View restaurant
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Restaurants;