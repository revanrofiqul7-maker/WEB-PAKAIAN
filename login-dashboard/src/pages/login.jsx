import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login /*, user, token */ } = useContext(AuthContext);

  // the root route is now responsible for redirecting authenticated users,
  // so we don't need an effect here. keep `user`/`token` in context in case
  // other components need them.

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      setError('Email dan password harus diisi');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    // send whatever the user typed (could be username or email)
    const loginValue = email.trim();

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginValue, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || 'Login gagal');
        setLoading(false);
        return;
      }

      // Save to auth context with refreshToken
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Gagal terhubung ke server');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Toko Pakaian "ATELVIA"</h1>
          <p>Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group email">
            <label htmlFor="email">Username</label>
            <input
              type="text"
              id="email"
              name="username"
              autoComplete="off"
              placeholder="Masukkan username Anda"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              disabled={loading}
            />
          </div>

          <div className="form-group password">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              disabled={loading}
            />
          </div>

          <div className="password-toggle">
            <label>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((v) => !v)}
                disabled={loading}
              />{' '}
              Tampilkan kata sandi
            </label>
          </div>

          <div className="remember-forgot">
            <label>
              <input type="checkbox" disabled={loading} /> Ingat saya
            </label>
            <a href="#forgot">Lupa password?</a>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="login-footer">
          <p>Belum punya akun? <Link to="/register">Daftar sekarang</Link></p>
        </div>
      </div>
    </div>
  );
}
