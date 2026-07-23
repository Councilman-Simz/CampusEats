import { useEffect, useState } from "react";
import api from "../services/api";
import { getCurrentUserId } from "../utils/auth";

export default function useFavorites(userId = getCurrentUserId()) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [removingIds, setRemovingIds] = useState([]);

  async function loadFavorites() {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/favorites/", {
        params: { user_id: userId },
      });

      setFavorites(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      setMessage(
        err.response?.data?.detail ||
          "Unable to load favorites."
      );
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(id) {
    if (removingIds.includes(id)) return;

    setRemovingIds((x) => [...x, id]);

    try {
      await api.delete(`/favorites/${id}`, {
        params: { user_id: userId },
      });

      setFavorites((items) =>
        items.filter((item) => item.id !== id)
      );
    } finally {
      setRemovingIds((x) =>
        x.filter((i) => i !== id)
      );
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  return {
    favorites,
    loading,
    message,
    removingIds,
    loadFavorites,
    removeFavorite,
  };
}