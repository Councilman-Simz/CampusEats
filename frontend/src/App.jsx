import { useState } from "react";

import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Restaurants from "./pages/Restaurants";
import Menu from "./pages/Menu";
import Deals from "./pages/Deals";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import ImageSearch from "./pages/ImageSearch";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MyOrders from "./pages/MyOrders";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import "./App.css";

function App() {
  const currentPath = window.location.pathname;

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [activePage, setActivePage] = useState("dashboard");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  setToken("");
  setActivePage("dashboard");
  setSelectedRestaurant(null);
}

  function openRestaurant(restaurant) {
    setSelectedRestaurant(restaurant);
    setActivePage("restaurants");
  }

  function changePage(page) {
    setSelectedRestaurant(null);
    setActivePage(page);
  }

  function renderPage() {
    if (activePage === "restaurants") {
      return (
        <Restaurants
          initialRestaurant={selectedRestaurant}
          onRestaurantChange={setSelectedRestaurant}
        />
      );
    }

    if (activePage === "menu") {
      return <Menu />;
    }

    if (activePage === "deals") {
      return <Deals />;
    }

    if (activePage === "search") {
  return <Search onOpenRestaurant={openRestaurant} />;
}

if (activePage === "image-search") {
  return (
    <ImageSearch
      onOpenRestaurant={openRestaurant}
    />
  );
}

if (activePage === "chat") {
  return (
    <Chat
      onOpenRestaurant={openRestaurant}
    />
  );
}

if (activePage === "favorites") {
  return <Favorites />;
}

if (activePage === "analytics") {
  return <Analytics />;
}
if (activePage === "owner") {
  return <OwnerDashboard />;
}
if (activePage === "admin") {
  return <AdminDashboard />;
}
if (activePage === "my-orders") {
  return <MyOrders />;
}

    return (
      <Dashboard
        setActivePage={changePage}
        openRestaurant={openRestaurant}
      />
    );
  }

  if (currentPath === "/payment/success") {
    return <PaymentSuccess />;
  }

  if (currentPath === "/payment/cancel") {
    return <PaymentCancel />;
  }

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <div className="layout">
      <Navbar
        activePage={activePage}
        setActivePage={changePage}
        onLogout={logout}
      />

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;