
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const API_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const statuses = [
  {
    name: "Pending",
    description: "Your order has been received.",
    icon: "📝",
  },
  {
    name: "Preparing",
    description: "Our kitchen is preparing your meal.",
    icon: "👨‍🍳",
  },
  {
    name: "Ready",
    description: "Your delicious meal is ready.",
    icon: "🍽️",
  },
  {
    name: "Delivered",
    description: "Enjoy your meal!",
    icon: "✓",
  },
];

function OrderTrackingPage() {
  const { orderNumber } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch the latest order from the backend.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchOrder() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/orders/${encodeURIComponent(orderNumber)}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Order not found.");
        }

        const fetchedOrder = data.order ?? data;

        setOrder(fetchedOrder);
        setLastUpdated(new Date());
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Could not load your order.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    return () => controller.abort();
  }, [orderNumber]);

  // Listen for real-time status changes from the backend.
  useEffect(() => {
    if (!orderNumber) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setIsLive(true);

      // The backend must handle this event and join the matching room.
      socket.emit("joinOrderRoom", orderNumber);
    });

    socket.on("disconnect", () => {
      setIsLive(false);
    });

    socket.on("connect_error", () => {
      setIsLive(false);
    });

    function handleOrderUpdate(updatedOrder) {
      if (!updatedOrder) return;

      const updatedOrderNumber =
        updatedOrder.orderNumber ?? updatedOrder.order?.orderNumber;

      // Ignore updates belonging to another customer's order.
      if (
        updatedOrderNumber &&
        updatedOrderNumber !== orderNumber
      ) {
        return;
      }

      const orderData = updatedOrder.order ?? updatedOrder;

      setOrder((previousOrder) => {
        if (!previousOrder) return previousOrder;

        return {
          ...previousOrder,
          ...orderData,
          status: orderData.status ?? previousOrder.status,
        };
      });

      setLastUpdated(new Date());
    }

    socket.on("orderStatusUpdated", handleOrderUpdate);
    socket.on("orderUpdated", handleOrderUpdate);

    return () => {
      socket.off("orderStatusUpdated", handleOrderUpdate);
      socket.off("orderUpdated", handleOrderUpdate);
      socket.disconnect();
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <main className="tracking-page">
        <div className="tracking-container tracking-message">
          <div className="tracking-loader">🍽️</div>
          <h1>Preparing your tracking page...</h1>
          <p>Please wait while we retrieve your order.</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="tracking-page">
        <div className="tracking-container tracking-message">
          <span className="tracking-label">IKUZWE RESTAURANT</span>
          <h1>Order unavailable</h1>
          <p role="alert">
            {error || "We could not find this order."}
          </p>
          <Link className="tracking-back-link" to="/menu">
            ← Return to menu
          </Link>
        </div>
      </main>
    );
  }

  const currentStatus = order.status || "Pending";
  const cancelled = currentStatus === "Cancelled";
  const currentStep = statuses.findIndex(
    (step) => step.name === currentStatus
  );

  const items = Array.isArray(order.items) ? order.items : [];

  const totalAmount = Number(order.totalAmount) || 0;

  const formatPrice = (amount) =>
    `${Number(amount || 0).toLocaleString()} RWF`;

  const statusMessages = {
    Pending: "Your order has been received and is waiting for the kitchen.",
    Preparing: "Our kitchen is working on your order right now!",
    Ready: "Your meal is ready. Please wait for our staff to serve you.",
    Delivered: "Your order has been delivered. Enjoy your meal!",
    Cancelled: "This order has been cancelled. Please contact our staff if you need assistance.",
  };

  return (
    <main className="tracking-page">
      <div className="tracking-container">
        <header className="tracking-header">
          <span className="tracking-label">
            GOOD FOOD. GREAT MOOD.
          </span>

          <h1>Track Your Order</h1>

          <p>
            Follow your order from our kitchen to your table.
          </p>

          <div className="tracking-order-number">
            <span>ORDER NUMBER</span>
            <strong>{order.orderNumber || orderNumber}</strong>
          </div>
        </header>

        <div className="tracking-live-status" aria-live="polite">
          <span
            className={`tracking-live-dot ${
              isLive ? "connected" : ""
            }`}
          />

          <div>
            <strong>
              {isLive ? "Live order updates connected" : "Order status"}
            </strong>
            <p>
              {isLive
                ? "Updates will appear automatically."
                : "Connecting to live updates…"}
            </p>
          </div>

          <span className="tracking-live-icon">
            {isLive ? "● LIVE" : "○"}
          </span>
        </div>

        <section className="tracking-steps">
          <div className="tracking-section-heading">
            <div>
              <span className="tracking-label">ORDER PROGRESS</span>
              <h2>
                {cancelled ? "Order Cancelled" : currentStatus}
              </h2>
            </div>

            {!cancelled && (
              <span
                className={`tracking-status-badge status-${currentStatus.toLowerCase()}`}
              >
                {currentStatus}
              </span>
            )}
          </div>

          <p className="tracking-status-message" aria-live="polite">
            {statusMessages[currentStatus] ||
              "Your order status has been updated."}
          </p>

          {cancelled ? (
            <div className="tracking-cancelled">
              <span>⚠️</span>
              <div>
                <strong>This order was cancelled</strong>
                <p>
                  Please contact restaurant staff if you have questions
                  about your order.
                </p>
              </div>
            </div>
          ) : (
            <div className="tracking-timeline">
              {statuses.map((step, index) => {
                const completed =
                  currentStep >= 0 && index < currentStep;

                const active = index === currentStep;

                return (
                  <div
                    className={`tracking-step ${
                      completed || active ? "active" : ""
                    } ${completed ? "completed" : ""}`}
                    key={step.name}
                    aria-current={active ? "step" : undefined}
                  >
                    <div className="step-number">
                      {completed ? "✓" : step.icon}
                    </div>

                    <div className="tracking-step-content">
                      <strong>{step.name}</strong>
                      <p>{step.description}</p>

                      {active && (
                        <span className="tracking-current-label">
                          CURRENT STATUS
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {lastUpdated && (
            <p className="tracking-last-updated">
              Last updated at{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </section>

        <section className="tracking-summary">
          <div className="tracking-section-heading">
            <div>
              <span className="tracking-label">ORDER DETAILS</span>
              <h2>Your Order</h2>
            </div>
            <span className="tracking-food-icon">🍽️</span>
          </div>

          <div className="tracking-customer-details">
            <div>
              <span>Customer</span>
              <strong>{order.customerName || "Guest"}</strong>
            </div>

            <div>
              <span>Table</span>
              <strong>{order.tableNumber || "Not assigned"}</strong>
            </div>

            <div>
              <span>Guests</span>
              <strong>{order.numberOfClients ?? "—"}</strong>
            </div>

            <div>
              <span>Payment</span>
              <strong>{order.paymentMethod || "Not specified"}</strong>
            </div>
          </div>

          <hr />

          <h3 className="tracking-items-title">Items Ordered</h3>

          {items.length === 0 ? (
            <p>No items are listed for this order.</p>
          ) : (
            <div className="tracking-items-list">
              {items.map((item, index) => (
                <div
                  className="tracking-item"
                  key={`${item.name}-${index}`}
                >
                  <div className="tracking-item-info">
                    <span className="tracking-item-bullet">🍴</span>
                    <div>
                      <strong>{item.name}</strong>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                  </div>

                  <strong>
                    {formatPrice(
                      Number(item.price) * Number(item.quantity)
                    )}
                  </strong>
                </div>
              ))}
            </div>
          )}

          <div className="tracking-total">
            <span>Total Amount</span>
            <strong>{formatPrice(totalAmount)}</strong>
          </div>

          <div className="tracking-footer">
            <p>
              Thank you for choosing <strong>Ikuzwe Restaurant</strong>!
              ❤️
            </p>

            <Link className="tracking-back-link" to="/menu">
              ← Back to Menu
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default OrderTrackingPage;
