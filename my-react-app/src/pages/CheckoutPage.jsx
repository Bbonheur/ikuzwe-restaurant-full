
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";

const API_URL = "http://localhost:5000/api";

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getTotal, clearCart } = useCart();
  const { orderInfo } = useOrder();

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!orderInfo) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h2>Please start an order first.</h2>
          <button
            className="primary-btn"
            onClick={() => navigate("/start-order")}
          >
            Start Order
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h2>Your cart is empty.</h2>
          <button
            className="primary-btn"
            onClick={() => navigate("/menu")}
          >
            Go To Menu
          </button>
        </div>
      </div>
    );
  }

  const total = getTotal();

  async function placeOrder() {
    if (submitting) return;
     if (!orderInfo) {
  setError("Please go back and enter your customer information.");
  return;
}

if (!cart || cart.length === 0) {
  setError("Your cart is empty. Please add an item.");
  return;
}

if (
  !orderInfo.customerName ||
  !orderInfo.phone ||
  !orderInfo.numberOfGuests ||
  !orderInfo.tableNumber
) {
  setError("Please complete all customer information.");
  return;
}
    setSubmitting(true);
    setError("");

    const orderNumber =
      "ORD-" + Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      orderNumber,
      customerName: orderInfo.customerName,
      phone: orderInfo.phone,
      numberOfClients: Number(orderInfo.numberOfGuests),
      tableNumber: orderInfo.tableNumber,
      items: cart.map((item) => ({
        name: item.name,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      totalAmount: Number(total),
      paymentMethod,
      status: "Pending",
    };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save your order.");
      }

      // Keep a convenience copy in the browser, but MongoDB
      // is the source of truth for saved orders.
      localStorage.setItem(
        "currentOrder",
        JSON.stringify(data.order)
      );

      clearCart();

      navigate(`/order/${encodeURIComponent(orderNumber)}`);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the restaurant server. Make sure the backend is running."
          : err.message || "Could not place your order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>
        <p className="checkout-subtitle">
          Review your order before placing it.
        </p>

        <div className="customer-summary">
          <h2>Customer Information</h2>
          <p><strong>Name:</strong> {orderInfo.customerName}</p>
          <p><strong>Phone:</strong> {orderInfo.phone}</p>
          <p><strong>Clients:</strong> {orderInfo.numberOfGuests}</p>
          <p><strong>Table:</strong> {orderInfo.tableNumber}</p>
        </div>

        <div className="checkout-items">
          <h2>Order Items</h2>
          {cart.map((item) => (
            <div className="checkout-item" key={item.id ?? item.name}>
              <span>
                {item.emoji} {item.name} × {item.quantity}
              </span>
              <strong>
                {(Number(item.price) * Number(item.quantity)).toLocaleString()} RWF
              </strong>
            </div>
          ))}
        </div>

        <div className="payment-section">
          <h2>Payment Method</h2>
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
          >
            <option value="Cash">Cash</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Card">Card</option>
          </select>
        </div>

        <div className="checkout-total">
          <span>Total</span>
          <strong>{Number(total).toLocaleString()} RWF</strong>
        </div>

        {error && <p role="alert">{error}</p>}

        <button
          className="place-order-btn"
          onClick={placeOrder}
          disabled={submitting}
        >
          {submitting ? "Saving Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}

export default CheckoutPage;
