import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart({ cart: cartProp, setCart: setCartProp }) {
const navigate = useNavigate();
const cartContext = useCart();

const cart = cartProp ?? cartContext.cart;
const setCart = setCartProp ?? cartContext.setCart;

function increaseQuantity(id) {
setCart(
cart.map((item) =>
item.id === id
? { ...item, quantity: item.quantity + 1 }
: item
)
);
}

function decreaseQuantity(id) {
setCart(
cart
.map((item) =>
item.id === id
? { ...item, quantity: item.quantity - 1 }
: item
)
.filter((item) => item.quantity > 0)
);
}

function removeItem(id) {
setCart(cart.filter((item) => item.id !== id));
}

const total = cart.reduce(
(sum, item) => sum + Number(item.price) * item.quantity,
0
);

const itemCount = cart.reduce(
(sum, item) => sum + item.quantity,
0
);

return (
<section className="cart-section">
<div className="cart-heading">
<div className="section-title">
<p>YOUR ORDER</p>
<h2>Your Shopping Cart</h2>
<span>
Review your selections before placing your order.
</span>
</div>

    <button
      type="button"
      className="continue-shopping-btn"
      onClick={() => navigate("/menu")}
    >
      ← Continue Shopping
    </button>
  </div>

  {cart.length === 0 ? (
    <div className="empty-cart">
      <div className="empty-cart-icon">🛒</div>
      <h3>Your cart is waiting for something delicious!</h3>
      <p>
        You haven’t added any items yet. Explore our menu
        and find something you’ll love.
      </p>
      <button
        type="button"
        className="checkout-btn"
        onClick={() => navigate("/menu")}
      >
        Explore Our Menu
      </button>
    </div>
  ) : (
    <div className="cart-layout">
      <div className="cart-items-panel">
        <div className="cart-items-heading">
          <h3>Order Items</h3>
          <span>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="cart-items-list">
          {cart.map((item) => (
            <article className="cart-item" key={item.id}>
              <div className="cart-item-image">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span>{item.emoji || "🍽️"}</span>
                )}
              </div>

              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>
                  {Number(item.price).toLocaleString()} RWF each
                </p>

                <div className="quantity-controls">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.name}`}
                    onClick={() => decreaseQuantity(item.id)}
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    aria-label={`Increase quantity of ${item.name}`}
                    onClick={() => increaseQuantity(item.id)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-item-right">
                <strong>
                  {(
                    Number(item.price) * item.quantity
                  ).toLocaleString()}{" "}
                  RWF
                </strong>

                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="cart-summary">
        <h3>Order Summary</h3>

        <div className="summary-row">
          <span>Items</span>
          <span>{itemCount}</span>
        </div>

        <div className="summary-row">
          <span>Subtotal</span>
          <span>{total.toLocaleString()} RWF</span>
        </div>

        <div className="summary-row">
          <span>Delivery / extra charges</span>
          <span>Calculated at checkout</span>
        </div>

        <div className="summary-divider" />

        <div className="summary-total">
          <span>Total</span>
          <strong>{total.toLocaleString()} RWF</strong>
        </div>

        <button
          type="button"
          className="checkout-btn"
          onClick={() => navigate("/checkout")}
        >
          Proceed to Checkout →
        </button>

        <p className="cart-summary-note">
          Your order details will be reviewed at checkout.
        </p>
      </aside>
    </div>
  )}
</section>

);
}

export default Cart;