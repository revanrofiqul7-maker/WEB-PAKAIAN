import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './register.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasi input
    if (!username || !email || !password || !passwordConfirm) {
      setError('Semua field harus diisi');
      return;
    }

    if (username.length < 3) {
      setError('Username minimal 3 karakter');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    if (!email.includes('@')) {
      setError('Email tidak valid');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, name: username })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registrasi gagal');
        setLoading(false);
        return;
      }

      setSuccess('Registrasi berhasil! Mengarahkan ke halaman login...');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError('Gagal terhubung ke server');
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <h1>Toko Pakaian</h1>
          <p>Buat Akun Baru</p>
        </div>

        <form onSubmit={handleRegister}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">Konfirmasi Password</label>
            <input
              type="password"
              id="passwordConfirm"
              placeholder="Ulangi password Anda"
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                setError('');
              }}
              disabled={loading}
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <div className="register-footer">
          <p>Sudah punya akun? <Link to="/">Masuk di sini</Link></p>
        </div>
      </div>
    </div>
  );
}
