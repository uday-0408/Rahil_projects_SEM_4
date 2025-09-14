"use client"

import React from "react"

export default function ProfilePage({ user, orders, onLogout, onBack }) {
  if (!user) return <div>Please login to view profile</div>

  return (
    <div className="page profile-page">
      <div className="container">
        <div className="header">
          <button className="btn btn-ghost" onClick={onBack}>← Back to Menu</button>
          <h1>My Profile</h1>
          <button className="btn btn-outline" onClick={onLogout}>Logout</button>
        </div>

        {/* Profile Info */}
        <div className="section">
          <h2>👤 Profile Information</h2>
          <div className="profile-info">
            <div className="info-item">
              <label>Name</label>
              <p>{user.name}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            <div className="info-item">
              <label>Reward Points</label>
              <p className="points">{user.rewardPoints}</p>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="section">
          <h2>📋 Order History</h2>
          {orders.length === 0 ? (
            <div className="no-orders">
              <p>No orders yet</p>
              <button className="btn btn-primary" onClick={onBack}>Start Ordering</button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h4>Order #{order.orderNumber}</h4>
                      <p>
                        {new Date(order.createdAt).toLocaleDateString()} -{" "}
                        {order.dineType}
                      </p>
                    </div>
                    <div>
                      <p className="order-total">₹{order.total.toFixed(2)}</p>
                      <span className={`status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="order-items">
                    <p>
                      <strong>Items:</strong>{" "}
                      {order.items
                        .map((it) => `${it.name} (${it.quantity})`)
                        .join(", ")}
                    </p>
                    {order.earnedPoints > 0 && (
                      <p className="earned-points">
                        Earned: {order.earnedPoints} points
                      </p>
                    )}
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
