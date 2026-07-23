import { useEffect, useState } from "react";
import api from "../services/api";

export default function useMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadMenu() {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/menu/");

      setMenuItems(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      setMessage(
        err.response?.data?.detail ||
        "Unable to load menu."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  return {
    menuItems,
    loading,
    message,
    reloadMenu: loadMenu,
  };
}
