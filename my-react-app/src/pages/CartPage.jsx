import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartPage() {
  const navigate = useNavigate();

  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getTotal,
  } = useCart();

  const total = getTotal();

  return (
    <div className="cart-page">

      <div className="page-header">
        <p>YOUR ORDER</p>
        <h1>Your Cart</h1>
        <span>Review your food before checkout.</span>
      </div>

      {cart.length === 0 ? (

        <div className="empty-cart-page">

          <h2>Your cart is empty 🛒</h2>

          <p>
            You haven't added any food yet.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/menu")}
          >
            Browse Menu
          </button>

        </div>

      ) : (

        <div className="cart-page-container">

          {cart.map((item) => (

            <div
              className="cart-page-item"
              key={item.id}
            >

              <div className="cart-food-icon">
                {item.emoji}
              </div>

              <div className="cart-food-info">

                <h3>{item.name}</h3>

                <p>
                  {item.price.toLocaleString()} RWF
                </p>

              </div>

              <div className="quantity-controls">

                <button
                  onClick={() =>
                    decreaseQuantity(item.id)
                  }
                >
                  -
                </button>

                <span>
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    increaseQuantity(item.id)
                  }
                >
                  +
                </button>

              </div>

              <strong>
                {(
                  item.price * item.quantity
                ).toLocaleString()}{" "}
                RWF
              </strong>

              <button
                className="remove-btn"
                onClick={() =>
                  removeFromCart(item.id)
                }
              >
                Remove
              </button>

            </div>

          ))}

          <div className="cart-summary">

            <div>
              <span>Subtotal</span>

              <strong>
                {total.toLocaleString()} RWF
              </strong>
            </div>

            <div>
              <span>Service</span>

              <strong>
                0 RWF
              </strong>
            </div>

            <hr />

            <div className="grand-total">

              <span>Total</span>

              <strong>
                {total.toLocaleString()} RWF
              </strong>

            </div>

            <button
              className="checkout-btn"
              onClick={() =>
                navigate("/checkout")
              }
            >
              Continue to Checkout →
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default CartPage;