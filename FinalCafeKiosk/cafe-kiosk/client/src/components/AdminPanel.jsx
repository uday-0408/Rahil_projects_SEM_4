import React from "react"

export default function AdminPanel({ orders, onUpdateOrderStatus, onBack }) {
  const activeOrders = orders.filter((o) => o.status !== "Completed")
  const completedOrders = orders.filter((o) => o.status === "Completed")

  return (
    <div className="page admin-page">
      <div className="container">
        <div className="header">
          <button className="btn btn-ghost" onClick={onBack}>← Back to Menu</button>
          <h1>⚙️ Admin Panel</h1>
        </div>

        {/* Statistics */}
        <div className="stats">
          <div className="stat-card"><h3>Total Orders</h3><p>{orders.length}</p></div>
          <div className="stat-card"><h3>Active Orders</h3><p>{activeOrders.length}</p></div>
          <div className="stat-card"><h3>Completed Orders</h3><p>{completedOrders.length}</p></div>
        </div>

        {/* Active Orders */}
        <div className="section">
          <h2>Active Orders ({activeOrders.length})</h2>
          {activeOrders.length === 0 ? (
            <p>No active orders</p>
          ) : (
            <div className="orders-grid">
              {activeOrders.map((order) => (
                <div key={order._id} className="admin-order-card">
                  <div className="order-header">
                    <div>
                      <h4>Order #{order.orderNumber}</h4>
                      <p>{new Date(order.createdAt).toLocaleString()}</p>
                      <p>{order.dineType}</p>
                      <p>{order.user ? `Customer: ${order.user.name}` : "Guest Order"}</p>
                    </div>
                    <div>
                      <p className="order-total">₹{order.total.toFixed(2)}</p>
                      <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                    </div>
                  </div>

                  <div className="order-items">
                    <h5>Items:</h5>
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="status-controls">
                    <label>Status:</label>
                    <select value={order.status} onChange={(e) => onUpdateOrderStatus(order._id, e.target.value)}>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
