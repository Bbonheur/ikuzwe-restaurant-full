import {
  createContext,
  useContext,
  useState,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

  const [cart, setCart] = useState(() => {

    const savedCart =
      localStorage.getItem("restaurantCart");

    return savedCart
      ? JSON.parse(savedCart)
      : [];

  });


  function saveCart(updatedCart) {

    setCart(updatedCart);

    localStorage.setItem(
      "restaurantCart",
      JSON.stringify(updatedCart)
    );

  }


  function addToCart(food) {

    const existingItem = cart.find(
      (item) => item.id === food.id
    );


    if (existingItem) {

      const updatedCart = cart.map((item) =>

        item.id === food.id

          ? {
              ...item,
              quantity: item.quantity + 1,
            }

          : item

      );

      saveCart(updatedCart);

    } else {

      const updatedCart = [
        ...cart,
        {
          ...food,
          quantity: 1,
        },
      ];

      saveCart(updatedCart);

    }

  }


  function increaseQuantity(id) {

    const updatedCart = cart.map((item) =>

      item.id === id

        ? {
            ...item,
            quantity: item.quantity + 1,
          }

        : item

    );

    saveCart(updatedCart);

  }


  function decreaseQuantity(id) {

    const updatedCart = cart
      .map((item) =>

        item.id === id

          ? {
              ...item,
              quantity: item.quantity - 1,
            }

          : item

      )
      .filter((item) => item.quantity > 0);

    saveCart(updatedCart);

  }


  function removeFromCart(id) {

    const updatedCart = cart.filter(
      (item) => item.id !== id
    );

    saveCart(updatedCart);

  }


  function clearCart() {

    setCart([]);

    localStorage.removeItem(
      "restaurantCart"
    );

  }


  function getTotal() {

    return cart.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

  }


  return (

    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        getTotal,
      }}
    >

      {children}

    </CartContext.Provider>

  );
}


export function useCart() {

  return useContext(CartContext);

}