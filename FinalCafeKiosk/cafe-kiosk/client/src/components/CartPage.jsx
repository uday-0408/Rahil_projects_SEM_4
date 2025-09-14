import React, { useState } from "react"

export default function CartPage({ cart, user, onUpdateQuantity, onRemoveItem, onPlaceOrder, onBack, loading }) {
  const [dineType, setDineType] = useState("Dine-In")
  const [usedPoints, setUsedPoints] = useState(0)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.05
  const maxUsablePoints = user ? Math.min(user.rewardPoints, subtotal + tax) : 0
  const total = subtotal + tax - usedPoints
  const earnedPoints = user ? Math.floor(subtotal * 0.05) : 0

  const handlePlaceOrder = async () => {
    const result = await onPlaceOrder(dineType, usedPoints)
    if (!result.success) alert(result.message)
  }

  if (cart.length === 0) {
    return (
      <div className="page cart-page">
        <div className="container">
          <div className="header">
            <button className="btn btn-ghost" onClick={onBack}>← Back to Menu</button>
            <h1>Your Cart</h1>
          </div>

          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some delicious items to your cart!</p>
            <button className="btn btn-primary" onClick={onBack}>Browse Menu</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page cart-page">
      <div className="container">
        <div className="header">
          <button className="btn btn-ghost" onClick={onBack}>← Back to Menu</button>
          <h1>Your Cart</h1>
        </div>

        {/* Cart Items */}
        <div className="section">
          <h2>Order Items</h2>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image || "/placeholder.svg"} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>₹{item.price}</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <div className="item-total">
                  <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                  <button className="remove-btn" onClick={() => onRemoveItem(item.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Options */}
        <div className="section">
          <h2>Order Options</h2>

          <div className="dine-options">
            <label>
              <input type="radio" value="Dine-In" checked={dineType === "Dine-In"} onChange={(e)=>setDineType(e.target.value)} />
              Dine-In
            </label>
            <label>
              <input type="radio" value="Takeaway" checked={dineType === "Takeaway"} onChange={(e)=>setDineType(e.target.value)} />
              Takeaway
            </label>
          </div>

          {user && user.rewardPoints > 0 && (
            <div className="points-section">
              <label>
                <input
                  type="checkbox"
                  checked={usedPoints > 0}
                  onChange={(e) => setUsedPoints(e.target.checked ? maxUsablePoints : 0)}
                />
                Use Reward Points (Available: {user.rewardPoints})
              </label>
              {usedPoints > 0 && (
                <p className="points-info">
                  Using {usedPoints} points (₹{usedPoints} discount)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="section">
          <h2>Order Summary</h2>
          <div className="summary">
            <div className="summary-row"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>Tax (5%):</span><span>₹{tax.toFixed(2)}</span></div>
            {usedPoints > 0 && <div className="summary-row discount"><span>Points Applied:</span><span>-₹{usedPoints.toFixed(2)}</span></div>}
            {user && <div className="summary-row earn-points"><span>Points to Earn:</span><span>+{earnedPoints} points</span></div>}
            <hr />
            <div className="summary-row total"><span>Total:</span><span>₹{total.toFixed(2)}</span></div>
          </div>
        </div>

        <button className="btn btn-primary full-width" onClick={handlePlaceOrder} disabled={loading || total <= 0}>
          {loading ? "Placing Order..." : `Place Order - ₹${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}
