import { createContext, useContext, useState } from "react";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orderInfo, setOrderInfo] = useState(() => {
    const savedOrder = localStorage.getItem("restaurantOrder");

    return savedOrder
      ? JSON.parse(savedOrder)
      : null;
  });

  function saveOrderInfo(data) {
    setOrderInfo(data);

    localStorage.setItem(
      "restaurantOrder",
      JSON.stringify(data)
    );
  }

  function clearOrderInfo() {
    setOrderInfo(null);

    localStorage.removeItem("restaurantOrder");
  }

  return (
    <OrderContext.Provider
      value={{
        orderInfo,
        saveOrderInfo,
        clearOrderInfo,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}