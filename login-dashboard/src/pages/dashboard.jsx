import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './dashboard.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { addToCart, getTotalItems } = useContext(CartContext);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const accessToken = localStorage.getItem('accessToken');
    if (!isLoggedIn || !accessToken) {
      navigate('/');
      return;
    }

    // Try to fetch protected profile from backend
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (res.ok) {
          const profile = await res.json();
          setUser(profile);
        } else {
          // token invalid or expired
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching profile', err);
        navigate('/');
      }
    };

    fetchProfile();

    // Load produk (data dummy)
    setProducts([
      {
        id: 1,
        name: 'Kemeja Kasual',
        category: 'Pria',
        price: 150000,
        stock: 25,
        image: '/kemeja-casual.png'
      },
      {
        id: 2,
        name: 'Dress Wanita',
        category: 'Wanita',
        price: 250000,
        stock: 15,
        image: '/dress-wanita.png'
      },
      {
        id: 3,
        name: 'Jaket Denim',
        category: 'Pria',
        price: 350000,
        stock: 8,
        image: '/jaket-denim.png'
      },
      {
        id: 4,
        name: 'T-Shirt Premium',
        category: 'Unisex',
        price: 100000,
        stock: 50,
        image: '/T-shirt.png'
      },
      {
        id: 5,
        name: 'Celana Jeans',
        category: 'Pria',
        price: 200000,
        stock: 30,
        image: '/celana-jeans.png'
      },
      {
        id: 6,
        name: 'Blouse Cantik',
        category: 'Wanita',
        price: 180000,
        stock: 20,
        image: '/blouse.png'
      }
    ]);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert(`${product.name} ditambahkan ke keranjang!`);
  };

  if (!user) {
    return <div className="loading">Memuat...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>👗 Toko Pakaian</h1>
          <div className="user-info">
            <span>Selamat datang, <strong>{user.name}</strong></span>
            <button onClick={() => navigate('/cart')} className="cart-btn">
              🛒 Keranjang ({getTotalItems()})
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        <nav className="sidebar">
          <ul className="nav-menu">
            <li>
              <button
                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Ringkasan
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                📦 Produk ({products.length})
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                📋 Pesanan
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Pengaturan
              </button>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          {/* Tab Overview */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h2>Ringkasan Dashboard</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Produk</h3>
                  <p className="stat-number">{products.length}</p>
                  <span className="stat-label">Item tersedia</span>
                </div>
                <div className="stat-card">
                  <h3>Total Stok</h3>
                  <p className="stat-number">
                    {products.reduce((sum, p) => sum + p.stock, 0)}
                  </p>
                  <span className="stat-label">Barang dalam gudang</span>
                </div>
                <div className="stat-card">
                  <h3>Total Penjualan</h3>
                  <p className="stat-number">Rp {(4500000).toLocaleString('id-ID')}</p>
                  <span className="stat-label">Bulan ini</span>
                </div>
                <div className="stat-card">
                  <h3>Total Pelanggan</h3>
                  <p className="stat-number">324</p>
                  <span className="stat-label">Terdaftar</span>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Aktivitas Terbaru</h3>
                <ul className="activity-list">
                  <li>
                    <span className="activity-icon">📦</span>
                    <div>
                      <p>Pesanan baru diterima</p>
                      <small>2 jam yang lalu</small>
                    </div>
                  </li>
                  <li>
                    <span className="activity-icon">👤</span>
                    <div>
                      <p>Pelanggan baru terdaftar</p>
                      <small>5 jam yang lalu</small>
                    </div>
                  </li>
                  <li>
                    <span className="activity-icon">✅</span>
                    <div>
                      <p>Pesanan berhasil dikirim</p>
                      <small>1 hari yang lalu</small>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab Produk */}
          {activeTab === 'products' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Daftar Produk</h2>
                <button className="btn-add">➕ Tambah Produk</button>
              </div>

              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      {product.image.startsWith('/') ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        product.image
                      )}
                    </div>
                    <div className="product-details">
                      <h4>{product.name}</h4>
                      <p className="category">{product.category}</p>
                      <div className="product-info">
                        <span className="price">Rp {product.price.toLocaleString('id-ID')}</span>
                        <span className={`stock ${product.stock < 10 ? 'low' : ''}`}>
                          Stok: {product.stock}
                        </span>
                      </div>
                      <div className="product-actions">
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="btn-cart"
                          disabled={product.stock === 0}
                        >
                          🛒 Tambah ke Keranjang
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Pesanan */}
          {activeTab === 'orders' && (
            <div className="tab-content">
              <h2>Pesanan Anda</h2>
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>No. Pesanan</th>
                      <th>Tanggal</th>
                      <th>Pelanggan</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#ORD-001</td>
                      <td>03-02-2026</td>
                      <td>Budi Santoso</td>
                      <td>Rp 450.000</td>
                      <td><span className="status pending">Menunggu</span></td>
                      <td><button className="btn-view">Lihat</button></td>
                    </tr>
                    <tr>
                      <td>#ORD-002</td>
                      <td>02-02-2026</td>
                      <td>Siti Nurhaliza</td>
                      <td>Rp 750.000</td>
                      <td><span className="status shipped">Dikirim</span></td>
                      <td><button className="btn-view">Lihat</button></td>
                    </tr>
                    <tr>
                      <td>#ORD-003</td>
                      <td>01-02-2026</td>
                      <td>Ahmad Rizki</td>
                      <td>Rp 320.000</td>
                      <td><span className="status completed">Selesai</span></td>
                      <td><button className="btn-view">Lihat</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Pengaturan */}
          {activeTab === 'settings' && (
            <div className="tab-content">
              <h2>Pengaturan Akun</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={user.email} readOnly />
                </div>
                <div className="form-group">
                  <label>Nama Toko</label>
                  <input type="text" placeholder="Masukkan nama toko" defaultValue="Toko Pakaian" />
                </div>
                <div className="form-group">
                  <label>Alamat</label>
                  <textarea placeholder="Masukkan alamat toko" rows="3"></textarea>
                </div>
                <div className="form-group">
                  <label>Nomor Telepon</label>
                  <input type="tel" placeholder="Masukkan nomor telepon" />
                </div>
                <div className="form-actions">
                  <button className="btn-save">💾 Simpan Perubahan</button>
                  <button className="btn-cancel">Batal</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
