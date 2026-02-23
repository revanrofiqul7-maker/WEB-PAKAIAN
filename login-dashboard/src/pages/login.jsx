import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    // backend expects `username`; allow user to enter email or username
    const username = email.includes('@') ? email.split('@')[0] : email;

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login gagal');
        return;
      }

      // store tokens
      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

      // fetch profile
      try {
        const profileRes = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${data.accessToken}` }
        });

        if (profileRes.ok) {
          const profile = await profileRes.json();
          localStorage.setItem('user', JSON.stringify(profile));
        } else {
          // fallback: save a minimal user
          localStorage.setItem('user', JSON.stringify({ name: username, email }));
        }
      } catch (err) {
        localStorage.setItem('user', JSON.stringify({ name: username, email }));
      }

      localStorage.setItem('isLoggedIn', 'true');
      navigate('/dashboard');
    } catch (err) {
      setError('Gagal terhubung ke server');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>👗 Toko Pakaian</h1>
          <p>Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email atau Username</label>
            <input
              type="text"
              id="email"
              placeholder="Masukkan email atau username Anda"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
            />
          </div>

          <div className="remember-forgot">
            <label>
              <input type="checkbox" /> Ingat saya
            </label>
            <a href="#forgot">Lupa password?</a>
          </div>

          <button type="submit" className="login-btn">
            Masuk
          </button>
        </form>

        <div className="login-footer">
          <p>Belum punya akun? <Link to="/register">Daftar sekarang</Link></p>
        </div>

        <div className="demo-info">
          <p className="demo-title">🔓 Demo Login:</p>
          <p>Email/Username: demo</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </div>
  );
}
