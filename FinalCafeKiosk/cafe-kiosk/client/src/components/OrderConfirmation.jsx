import React from "react"

export default function OrderConfirmation({ orderNumber, onStartNewOrder }) {
  return (
    <div className="page confirmation-page">
      <div className="container">
        <div className="confirmation-content">
          <div className="success-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <div className="order-details">
            <h2>Your Order Number: {orderNumber}</h2>
            <p style={{color:'#4b2310'}}>Thank you for your order! We'll have it ready for you soon.</p>
          </div>
          <div className="confirmation-note">
            <p>Please keep this order number for reference</p>
          </div>
          <button className="btn btn-primary" onClick={onStartNewOrder}>Start New Order</button>
        </div>
      </div>
    </div>
  )
}
