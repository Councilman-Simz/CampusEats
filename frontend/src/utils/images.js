const FOOD_CATEGORIES = {
  pizza: {
    emoji: "🍕",
    gradient: "linear-gradient(135deg, #fff4e6 0%, #ffb347 55%, #ff8c42 100%)",
  },
  burger: {
    emoji: "🍔",
    gradient: "linear-gradient(135deg, #fff8e7 0%, #f4c97a 55%, #e8a838 100%)",
  },
  salad: {
    emoji: "🥗",
    gradient: "linear-gradient(135deg, #eaf8ef 0%, #95d5b2 55%, #52b788 100%)",
  },
  bowl: {
    emoji: "🍲",
    gradient: "linear-gradient(135deg, #e8f5ed 0%, #74c69d 55%, #40916c 100%)",
  },
  drink: {
    emoji: "🥤",
    gradient: "linear-gradient(135deg, #e3f2fd 0%, #90caf9 55%, #42a5f5 100%)",
  },
  dessert: {
    emoji: "🍰",
    gradient: "linear-gradient(135deg, #fce4ec 0%, #f48fb1 55%, #ec407a 100%)",
  },
  sushi: {
    emoji: "🍣",
    gradient: "linear-gradient(135deg, #fff3e0 0%, #ffcc80 55%, #ff7043 100%)",
  },
  default: {
    emoji: "🍽️",
    gradient: "linear-gradient(135deg, #eaf8ef 0%, #b7e4c7 55%, #74c69d 100%)",
  },
};

const RESTAURANT_VARIANTS = [
  {
    emoji: "🏪",
    gradient: "linear-gradient(135deg, #123c2b 0%, #1b5a40 55%, #52b788 100%)",
  },
  {
    emoji: "🍽️",
    gradient: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 55%, #95d5b2 100%)",
  },
  {
    emoji: "☕",
    gradient: "linear-gradient(135deg, #10271c 0%, #40916c 55%, #d8f3dc 100%)",
  },
  {
    emoji: "🥡",
    gradient: "linear-gradient(135deg, #2d6a4f 0%, #52b788 55%, #b7e4c7 100%)",
  },
];

function detectCategory(name = "", tags = "", ingredients = "") {
  const text = `${name} ${tags} ${ingredients}`.toLowerCase();

  if (text.includes("pizza")) return "pizza";
  if (text.includes("burger") || text.includes("sandwich")) return "burger";
  if (text.includes("salad") || text.includes("vegan") || text.includes("vegetarian")) {
    return "salad";
  }
  if (
    text.includes("bowl") ||
    text.includes("tofu") ||
    text.includes("rice") ||
    text.includes("noodle") ||
    text.includes("soup")
  ) {
    return "bowl";
  }
  if (
    text.includes("coffee") ||
    text.includes("tea") ||
    text.includes("smoothie") ||
    text.includes("drink")
  ) {
    return "drink";
  }
  if (
    text.includes("cake") ||
    text.includes("cookie") ||
    text.includes("dessert") ||
    text.includes("sweet")
  ) {
    return "dessert";
  }
  if (text.includes("sushi") || text.includes("roll")) return "sushi";

  return "default";
}

export function getFoodArt(name = "", tags = "", ingredients = "") {
  const category = detectCategory(name, tags, ingredients);
  return FOOD_CATEGORIES[category];
}

export function getRestaurantArt(index = 0) {
  return RESTAURANT_VARIANTS[index % RESTAURANT_VARIANTS.length];
}
