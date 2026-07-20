import { useState } from "react";
import api from "../services/api";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student");

  async function handleLogin() {

  try {
    setLoading(true);
    setMessage("");

    const response = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem(
      "token",
      response.data.access_token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );

    onLogin(response.data.access_token);
  } catch (error) {
    console.error("Login failed:", error);

    setMessage(
      error.response?.data?.detail ||
        "Unable to log in."
    );
  } finally {
    setLoading(false);
  }
}

  async function handleRegister() {
    setLoading(true);
    setMessage("");

    try {
      await api.post("/auth/register", {
        email,
        password,
        dietary_preferences: "Vegetarian",
        campus: "Yeshiva University",
      });

      setMessage("Registration successful. Please log in.");
      setMode("login");
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>CampusEats</h1>
        <p>AI-powered food discovery for students.</p>

        <h2>{mode === "login" ? "Login" : "Register"}</h2>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
        />

        {message && <p className="message">{message}</p>}

        {mode === "login" ? (
          <>
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
            >
              Create account
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Back to login
            </button>
          </>
        )}
      </section>
    </main>
  );
}

export default Login;