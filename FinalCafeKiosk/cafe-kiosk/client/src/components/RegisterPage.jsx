import React, { useState } from "react"

export default function RegisterPage({ onRegister, onBack, onLogin, loading }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!name || !email || !password || !confirmPassword) { setError("Please fill in all fields"); return }
    if (password !== confirmPassword) { setError("Passwords do not match"); return }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }
    const result = await onRegister(name, email, password)
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
        <h2>Join Cafe's Delight</h2>

        <form onSubmit={handleSubmit} className="form">
          {error && <div className="error">{error}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Enter your full name" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Create a password" />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirm your password" />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="links">
          <button className="link" onClick={onLogin}>Already have an account? Login</button>
          <button className="link" onClick={onBack}>← Back to Home</button>
        </div>
      </div>
    </div>
  )
}
