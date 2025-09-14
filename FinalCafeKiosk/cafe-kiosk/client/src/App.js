import React, { useState, useEffect } from "react"
import axios from "axios"
import "./App.css"

// Components
import StartPage from "./components/StartPage"
import LoginPage from "./components/LoginPage"
import RegisterPage from "./components/RegisterPage"
import MenuPage from "./components/MenuPage"
import CartPage from "./components/CartPage"
import ProfilePage from "./components/ProfilePage"
import AdminPanel from "./components/AdminPanel"
import OrderConfirmation from "./components/OrderConfirmation"

// Set axios base URL
axios.defaults.baseURL = "http://localhost:5000/api"

function App() {
  // App state 
  const [currentPage, setCurrentPage] = useState("start")
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [menuData, setMenuData] = useState({})
  const [orders, setOrders] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [orderNumber, setOrderNumber] = useState("")
  const [loading, setLoading] = useState(false)

  // Load user from token on app start
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      loadUser()
    }
    loadMenu()
  }, [])

  // Load current user
  const loadUser = async () => {
    try {
      const res = await axios.get("/auth/me")
      setUser(res.data)
    } catch (error) {
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
    }
  }

  // Load menu
  const loadMenu = async () => {
    try {
      const res = await axios.get("/menu")
      setMenuData(res.data)
    } catch (error) {
      console.error("Error loading menu:", error)
    }
  }

  // Load user orders
  const loadOrders = async () => {
    if (!user) return
    try {
      const res = await axios.get("/orders/my-orders")
      setOrders(res.data)
    } catch (error) {
      console.error("Error loading orders:", error)
    }
  }

  // Load all orders (admin)
  const loadAllOrders = async () => {
    if (!user || !user.isAdmin) return
    try {
      const res = await axios.get("/orders/all")
      setAllOrders(res.data)
    } catch (error) {
      console.error("Error loading all orders:", error)
    }
  }

  const handleLogin = async (email, password) => {
    try {
      setLoading(true)
      const res = await axios.post("/auth/login", { email, password })
      localStorage.setItem("token", res.data.token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`
      setUser(res.data.user)
      setCurrentPage(res.data.user.isAdmin ? "admin" : "menu")
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login failed" }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (name, email, password) => {
    try {
      setLoading(true)
      const res = await axios.post("/auth/register", { name, email, password })
      localStorage.setItem("token", res.data.token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`
      setUser(res.data.user)
      setCurrentPage("menu")
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration failed" }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    setCart([])
    setOrders([])
    setAllOrders([])
    setCurrentPage("start")
  }

  const addToCart = (item, quantity = 1) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item._id)
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item._id ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem
        )
      )
    } else {
      setCart([...cart, { id: item._id, name: item.name, price: item.price, image: item.image, quantity }])
    }

    // NOTE: This direct DOM effect is preserved for now (we'll improve later)
    const cartBar = document.querySelector(".cart-bar")
    if (cartBar) {
      cartBar.style.backgroundColor = "#28a745"
      setTimeout(() => { cartBar.style.backgroundColor = "#333" }, 500)
    }
  }

  const removeFromCart = (itemId) => setCart(cart.filter((item) => item.id !== itemId))

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) removeFromCart(itemId)
    else setCart(cart.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  const clearCart = () => setCart([])

  // Order functions
  const placeOrder = async (dineType, usedPoints) => {
    try {
      setLoading(true)
      const orderData = { items: cart, dineType, usedPoints, isGuestOrder: !user }
      const res = await axios.post("/orders", orderData)

      if (user) {
        const updatedUser = { ...user, rewardPoints: user.rewardPoints - usedPoints + res.data.earnedPoints }
        setUser(updatedUser)
      }

      setOrderNumber(res.data.orderNumber)
      clearCart()
      setCurrentPage("confirmation")
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Order failed" }
    } finally {
      setLoading(false)
    }
  }

  // Admin functions
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/orders/${orderId}/status`, { status: newStatus })
      setAllOrders(allOrders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)))
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  // Navigation
  const goToPage = (page) => {
    if (page === "profile" && user) loadOrders()
    if (page === "admin" && user && user.isAdmin) loadAllOrders()
    setCurrentPage(page)
  }

  // Guest order
  const handleGuestOrder = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    setCart([])
    setOrders([])
    setAllOrders([])
    setCurrentPage("menu")
  }

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case "start":
        return <StartPage onLogin={() => goToPage("login")} onRegister={() => goToPage("register")} onGuestOrder={handleGuestOrder} />
      case "login":
        return <LoginPage onLogin={handleLogin} onBack={() => goToPage("start")} onRegister={() => goToPage("register")} loading={loading} />
      case "register":
        return <RegisterPage onRegister={handleRegister} onBack={() => goToPage("start")} onLogin={() => goToPage("login")} loading={loading} />
      case "menu":
        return (
          <MenuPage
            menuData={menuData}
            cart={cart}
            user={user}
            onAddToCart={addToCart}
            onGoToCart={() => goToPage("cart")}
            onGoToProfile={() => goToPage("profile")}
            onGoToAdmin={() => goToPage("admin")}
            onLogout={handleLogout}
            onLeave={() => goToPage("start")}
          />
        )
      case "cart":
        return (
          <CartPage
            cart={cart}
            user={user}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onPlaceOrder={placeOrder}
            onBack={() => goToPage("menu")}
            loading={loading}
          />
        )
      case "profile":
        return <ProfilePage user={user} orders={orders} onLogout={handleLogout} onBack={() => goToPage("menu")} />
      case "admin":
        return <AdminPanel orders={allOrders} onUpdateOrderStatus={updateOrderStatus} onBack={() => goToPage("menu")} />
      case "confirmation":
        return <OrderConfirmation orderNumber={orderNumber} onStartNewOrder={() => goToPage("start")} />
      default:
        return <StartPage onLogin={() => goToPage("login")} onRegister={() => goToPage("register")} onGuestOrder={handleGuestOrder} />
    }
  }

  return <div className="App">{renderPage()}</div>
}

export default App
