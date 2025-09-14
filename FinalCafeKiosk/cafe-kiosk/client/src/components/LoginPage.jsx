import React, { useState } from "react"

export default function LoginPage({ onLogin, onBack, onRegister, loading }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!email || !password) { setError("Please fill in all fields"); return }
    const result = await onLogin(email, password)
    if (!result.success) setError(result.message)
  }

  return (
    <div className="page auth-page">
      <div className="container">
        <div className="logo"><img 
    src="/Images/logo.png" 
    alt="Cafe Logo" 
    className="logo" 
    style={{ width: "40px", height: "40px", objectFit: "contain" }}
  /></div>
        <h2>Login to Cafe's Delight</h2>

        <form onSubmit={handleSubmit} className="form">
          {error && <div className="error">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter your password" />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="links">
          <button className="link" onClick={onRegister}>Don't have an account? Register</button>
          <button className="link" onClick={onBack}>← Back to Home</button>
        </div>
      </div>
    </div>
  )
}
