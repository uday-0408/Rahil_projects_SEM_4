import React from "react"

export default function StartPage({ onLogin, onRegister, onGuestOrder }) {
  return (
    <div className="page start-page">
      <div className="container">
        <div className="logo">
        <img src="/Images/logo.png" 
        alt="Cafe Logo" 
        className="logo" 
        style={{ width: "40px", height: "40px", objectFit: "contain" }}/>
      </div>
        <h1>Welcome to Cafe's Delight</h1>
        <p>Your favorite coffee destination</p>

        <div className="featured-image">
          <img src="/Images/ColdCoffee/CaramelFrappe.jpg" alt="Featured Coffee" />
          <p>Today's Special: Caramel Frappe</p>
        </div>

        <div className="buttons">
          <button className="btn btn-primary" onClick={onLogin}>Login</button>
          <button className="btn btn-secondary" onClick={onRegister}>Register</button>
          <button className="btn btn-primary" onClick={onGuestOrder}>Guest Order</button>
        </div>
      </div>
    </div>
  )
}
