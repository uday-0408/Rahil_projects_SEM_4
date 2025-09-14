const express = require("express")
const Order = require("../models/Order")
const User = require("../models/User")
const MenuItem = require("../models/MenuItem")
const auth = require("../middleware/auth")

const router = express.Router()

// Create order
router.post("/", async (req, res) => {
  try {
    const { items, dineType, usedPoints, isGuestOrder } = req.body

    let user = null
    if (!isGuestOrder && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1]
      const jwt = require("jsonwebtoken")
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      user = await User.findById(decoded.userId)
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.id)
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item not found` })
      }

      subtotal += menuItem.price * item.quantity
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      })
    }

    const tax = subtotal * 0.05
    const pointsToUse = user && usedPoints ? Math.min(usedPoints, user.rewardPoints) : 0
    const total = subtotal + tax - pointsToUse
    const earnedPoints = user && !isGuestOrder ? Math.floor(subtotal * 0.05) : 0

    // Generate order number
    const orderNumber = Math.floor(Math.random() * 9000) + 1000

    // Create order
    const order = new Order({
      orderNumber: orderNumber.toString(),
      user: user ? user._id : null,
      items: orderItems,
      dineType,
      subtotal,
      tax,
      usedPoints: pointsToUse,
      earnedPoints,
      total,
      isGuestOrder: isGuestOrder || !user,
    })

    await order.save()

    // Update user points
    if (user && !isGuestOrder) {
      user.rewardPoints = user.rewardPoints - pointsToUse + earnedPoints
      await user.save()
    }

    res.json({
      orderNumber: order.orderNumber,
      total: order.total,
      earnedPoints: order.earnedPoints,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get user orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).populate("items.menuItem").sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get all orders (Admin only)
router.get("/all", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Access denied" })
    }

    const orders = await Order.find().populate("user", "name email").populate("items.menuItem").sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Update order status (Admin only)
router.put("/:id/status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Access denied" })
    }

    const { status } = req.body
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
