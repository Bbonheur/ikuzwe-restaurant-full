import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useOrder } from "../context/OrderContext";

function StartOrderPage() {

  const navigate = useNavigate();

  const { orderInfo, saveOrderInfo } = useOrder();

  const [customerName, setCustomerName] = useState(
    orderInfo?.customerName || ""
  );

  const [phone, setPhone] = useState(
    orderInfo?.phone || ""
  );

  const [numberOfGuests, setNumberOfGuests] = useState(
    orderInfo?.numberOfGuests || ""
  );

  const [tableNumber, setTableNumber] = useState(
    orderInfo?.tableNumber || ""
  );

  const [error, setError] = useState("");


  function handleSubmit(event) {

    event.preventDefault();

    setError("");


    if (!customerName.trim()) {
      setError("Please enter your name.");
      return;
    }


    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }


    if (!numberOfGuests) {
      setError("Please enter the number of clients.");
      return;
    }


    if (numberOfGuests < 1) {
      setError("Number of clients must be at least 1.");
      return;
    }


    if (!tableNumber) {
      setError("Please select a table.");
      return;
    }


    const customerOrder = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      numberOfGuests: Number(numberOfGuests),
      tableNumber: tableNumber,
    };


    saveOrderInfo(customerOrder);


    navigate("/menu");
  }


  return (

    <div className="start-order-page">

      <div className="order-form-container">

        <div className="order-form-header">

          <p>WELCOME</p>

          <h1>Start Your Order</h1>

          <span>
            Please provide your information before
            choosing your food.
          </span>

        </div>


        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>
              Customer Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={customerName}
              onChange={(event) =>
                setCustomerName(event.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              Phone Number
            </label>

            <input
              type="tel"
              placeholder="0788 000 000"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              Number of Clients
            </label>

            <input
              type="number"
              min="1"
              placeholder="Example: 4"
              value={numberOfGuests}
              onChange={(event) =>
                setNumberOfGuests(event.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              Choose Your Table
            </label>

            <select
              value={tableNumber}
              onChange={(event) =>
                setTableNumber(event.target.value)
              }
            >

              <option value="">
                Select a table
              </option>

              <option value="T01">
                Table T01
              </option>

              <option value="T02">
                Table T02
              </option>

              <option value="T03">
                Table T03
              </option>

              <option value="T04">
                Table T04
              </option>

              <option value="T05">
                Table T05
              </option>

            </select>

          </div>


          {error && (

            <div className="form-error">
              {error}
            </div>

          )}


          <button
            type="submit"
            className="continue-btn"
          >
            Continue to Menu →
          </button>

        </form>

      </div>

    </div>
  );
}

export default StartOrderPage;