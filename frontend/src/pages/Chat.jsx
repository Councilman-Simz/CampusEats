import { useEffect, useRef, useState } from "react";
import api from "../services/api";

import healthyBowl from "../assets/food/healthy-spinach-bowl.jpg";
import bbqPlatter from "../assets/food/grilled-bbq-platter.jpg";
import pizza from "../assets/food/hawaiian-chicken-pizza.jpg";
import cheesecake from "../assets/food/orange-cheesecake.jpg";
import skewers from "../assets/food/grilled-beef-skewers.jpg";
import bbqChicken from "../assets/food/bbq-sausages-and-chicken.jpg";

function getFoodImage(name = "", tags = "") {
  const text = `${name} ${tags}`.toLowerCase();

  if (text.includes("pizza")) return pizza;

  if (
    text.includes("bbq") ||
    text.includes("sausage")
  ) {
    return bbqChicken;
  }

  if (
    text.includes("burger") ||
    text.includes("chicken")
  ) {
    return bbqPlatter;
  }

  if (
    text.includes("beef") ||
    text.includes("steak") ||
    text.includes("skewer")
  ) {
    return skewers;
  }

  if (
    text.includes("cake") ||
    text.includes("dessert") ||
    text.includes("muffin")
  ) {
    return cheesecake;
  }

  return healthyBowl;
}

function Chat({ onOpenRestaurant }) {
  const messagesEndRef = useRef(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text:
        "Hi! I’m the CampusEats AI assistant. Tell me what you’re craving, your budget, or any dietary preference.",
      items: [],
    },
  ]);

  const suggestions = [
    "Healthy meal under $10",
    "Show me vegetarian food",
    "I want high-protein chicken",
    "What is the cheapest meal?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(messageText = input) {
    const cleanMessage = messageText.trim();

    if (!cleanMessage || loading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: cleanMessage,
      items: [],
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/chat/", {
        message: cleanMessage,
        user_id: 1,
        limit: 5,
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text:
          response.data?.reply ||
          "Here are some matching meals.",
        items: Array.isArray(response.data?.items)
          ? response.data.items
          : [],
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          text:
            error.response?.data?.detail ||
            "I couldn't process that request. Please try again.",
          items: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return "Price unavailable";
    }

    return `$${numericPrice.toFixed(2)}`;
  }

  function openRestaurant(item) {
    if (typeof onOpenRestaurant !== "function") {
      return;
    }

    onOpenRestaurant({
      id: item.restaurant_id,
      name: `Restaurant #${item.restaurant_id}`,
    });
  }

  return (
    <main className="chat-page">
      <section className="chat-header">
        <span className="search-eyebrow">
          Conversational food discovery
        </span>

        <h1>CampusEats AI Assistant</h1>

        <p>
          Ask naturally about food, prices, dietary preferences,
          ingredients, or meal ideas.
        </p>
      </section>

      <section className="chat-shell">
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message-row chat-message-${message.role}`}
            >
              <div className="chat-avatar">
                {message.role === "assistant" ? "🤖" : "👤"}
              </div>

              <div className="chat-message-content">
                <div className="chat-bubble">
                  {message.text}
                </div>

                {message.items.length > 0 && (
                  <div className="chat-meal-grid">
                    {message.items.map((item) => (
                      <article
                        className="chat-meal-card"
                        key={item.id}
                      >
                        <img
                          src={getFoodImage(
                            item.name,
                            item.tags
                          )}
                          alt={item.name}
                        />

                        <div>
                          <span>
                            Restaurant #{item.restaurant_id}
                          </span>

                          <h3>{item.name}</h3>

                          <p>
                            {item.description ||
                              "CampusEats meal recommendation."}
                          </p>

                          <div className="chat-meal-footer">
                            <strong>
                              {formatPrice(item.price)}
                            </strong>

                            <button
                              type="button"
                              onClick={() =>
                                openRestaurant(item)
                              }
                            >
                              View details
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message-row chat-message-assistant">
              <div className="chat-avatar">🤖</div>

              <div className="chat-bubble chat-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-suggestions">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          className="chat-input-form"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Ask: I want a vegan meal under $10..."
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
          >
            Send
          </button>
        </form>
      </section>
    </main>
  );
}

export default Chat;
