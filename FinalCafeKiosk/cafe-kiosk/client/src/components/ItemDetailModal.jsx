import React, { useState } from "react"

export default function ItemDetailModal({ item, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)

  // support both 'desc' and 'description' fields (seed uses desc)
  const description = item?.desc || item?.description || "No description available."

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <img src={item.image || "/placeholder.svg"} alt={item.name} />
          
          {/* Description */}
          <p><strong>Description:</strong> {description}</p>

          <div className="item-details">
            <p className="price">₹{item.price}</p>
            <p className="calories">Calories: {item.calories ?? "N/A"}</p>
          </div>

          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(Math.min(20, quantity + 1))}>+</button>
          </div>

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={() => onAddToCart(item, quantity)}>
              Add {quantity} to Cart - ₹{(item.price * quantity).toFixed(2)}
            </button>
            <button className="btn btn-outline" onClick={onClose}>Back to Menu</button>
          </div>
        </div>
      </div>
    </div>
  )
}
