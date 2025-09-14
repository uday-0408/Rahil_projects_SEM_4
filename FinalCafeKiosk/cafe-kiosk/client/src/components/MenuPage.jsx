import React, { useState, useEffect } from "react"
import ItemDetailModal from "./ItemDetailModal"

export default function MenuPage({
  menuData, cart, user,
  onAddToCart, onGoToCart, onGoToProfile, onGoToAdmin, onLogout, onLeave
}) {
  const [selectedCategory, setSelectedCategory] = useState("Cold Coffee")
  const [selectedItem, setSelectedItem] = useState(null)

  // Fixed category order
  const categoryOrder = ["Hot Coffee", "Cold Coffee", "Snacks", "Desserts"]

  // Get categories from menuData, sort them by categoryOrder
  const categories = Object.keys(menuData).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  )

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0])
    }
  }, [categories, selectedCategory])

  return (
    <div className="page menu-page">
      {/* Header */}
      <div className="header">
        <button className="btn btn-ghost" onClick={onLeave}>← Leave</button>

        <div className="logo-section">
          <img 
    src="/Images/logo.png" 
    alt="Cafe Logo" 
    className="logo" 
    style={{ width: "40px", height: "40px", marginTop : '10px',objectFit: "contain" }}
  />
          <h1>Cafe's Delight</h1>
        </div>

        <div className="user-section">
          {user ? (
            <div className="user-info">
              <div>
                <p>Hello, {user.name}</p>
                <p>Points: {user.rewardPoints}</p>
              </div>
              <button className="btn btn-ghost" onClick={onGoToProfile}>👤</button>
              {user.isAdmin && <button className="btn btn-ghost" onClick={onGoToAdmin}>⚙️</button>}
              <button className="btn btn-ghost" onClick={onLogout}>Logout</button>
            </div>
          ) : (
            <div className="guest-info"><p>Guest User</p></div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="categories">
        <h2 style={{color : '#4b2310', marginBottom : '10px'}}>Categories</h2>
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="menu-items">
        <div className="items-grid">
          {menuData[selectedCategory]?.map((item) => (
            <div key={item._id} className="menu-item" onClick={() => setSelectedItem(item)}>
              <img src={item.image || "/placeholder.svg"} alt={item.name} />
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="price">₹{item.price}</p>
                <button
                  className="btn btn-primary"
                  onClick={(e) => { e.stopPropagation(); onAddToCart(item, 1) }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Bar */}
      <div className="cart-bar">
        <div className="cart-info">Items: {totalItems} | Total: ₹{totalPrice.toFixed(2)}</div>
        <button className="btn btn-primary" onClick={onGoToCart} disabled={totalItems === 0}>
          🛒 View Cart
        </button>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={(it, qty) => { onAddToCart(it, qty); setSelectedItem(null) }}
        />
      )}
    </div>
  )
}
