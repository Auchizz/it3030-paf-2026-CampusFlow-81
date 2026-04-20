import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await login(email, password)
      navigate(user.role === 'ADMIN' ? '/admin' : '/user')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-eyebrow">Campus command center</div>
        <div className="brand big">Smart Campus Operations Hub</div>
        <p>Sign in to continue to your role-based dashboard.</p>
        <form onSubmit={handleSubmit} className="form-grid">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button className="primary-btn">Login</button>
        </form>
        {error && <div className="error-box">{error}</div>}
        <div className="demo-box">
          <strong>Need an account?</strong>
          <div>Users can register directly. Admin accounts must be created by an existing admin.</div>
          <div><Link to="/register">Create user account</Link></div>
        </div>
      </div>
    </div>
  )
}
