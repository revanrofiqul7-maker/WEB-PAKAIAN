import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './admin.css';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-container">
      <nav className="admin-nav">
        <h1>Admin Panel</h1>
        <div className="nav-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="admin-sidebar">
        <ul className="sidebar-menu">
          <li><Link to="/admin/products">Kelola Produk</Link></li>
          <li><Link to="/admin/categories">Kelola Kategori</Link></li>
          <li><Link to="/admin/users">Kelola Users</Link></li>
          <li><Link to="/admin/transactions">Lihat Transaksi</Link></li>
        </ul>
      </div>

      <div className="admin-content">
        <div className="welcome-box">
          <h2>Selamat Datang di Admin Panel</h2>
          <p>Pilih menu di samping untuk mulai mengelola aplikasi</p>
        </div>
      </div>
    </div>
  );
}
