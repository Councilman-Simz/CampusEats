import { getFoodArt, getRestaurantArt } from "../utils/images";

function FoodPhotoArt({ name, tags, ingredients, variant = "food", index = 0, className = "" }) {
  const art =
    variant === "restaurant"
      ? getRestaurantArt(index)
      : getFoodArt(name, tags, ingredients);

  return (
    <div
      className={`photo-art ${variant === "restaurant" ? "restaurant-photo-art" : "food-photo-art"} ${className}`}
      style={{ background: art.gradient }}
      aria-hidden="true"
    >
      <span className="photo-art-emoji">{art.emoji}</span>
    </div>
  );
}

export default FoodPhotoArt;
