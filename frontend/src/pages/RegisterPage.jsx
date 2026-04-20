import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await register(form)
      navigate('/user')
    } catch (err) {
      const responseData = err?.response?.data
      const fieldErrors = responseData?.data && typeof responseData.data === 'object'
        ? Object.values(responseData.data).join(' ')
        : ''

      setError(fieldErrors || responseData?.message || err.message || 'Registration failed')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-eyebrow">New user account</div>
        <div className="brand big">Smart Campus Operations Hub</div>
        <p>Register as a normal user. Admin accounts are created only by admins.</p>
        <form onSubmit={handleSubmit} className="form-grid">
          <input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Full name" />
          <input value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Email" />
          <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Password" />
          <button className="primary-btn">Create User Account</button>
        </form>
        {error && <div className="error-box">{error}</div>}
        <div className="demo-box">
          <strong>Already registered?</strong>
          <div><Link to="/login">Back to login</Link></div>
        </div>
      </div>
    </div>
  )
}
