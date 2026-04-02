import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete, apiFormData } from '../utils/api';
import './dashboard.css';
import './admin/admin.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);    // admin only
  const [usersList, setUsersList] = useState([]);      // admin only
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, getTotalItems } = useContext(CartContext);
  const { user: authUser, token, logout } = useContext(AuthContext);

  useEffect(() => {
    // debug logging to ensure auth info is accurate
    console.log('dashboard useEffect', authUser, token);

    // context has already been validated by ProtectedRoute
    setUser(authUser);
    fetchProducts();
    if (authUser?.role === 'admin') {
      fetchCategories();
      fetchUsers();
    }

    // Redirect customer away from overview tab if they try to access it
    if (authUser?.role === 'customer' && activeTab === 'overview') {
      setActiveTab('products');
    }
  }, [authUser, activeTab]);

  const fetchProducts = async () => {
    try {
      const data = await apiGet('/products');
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products', err);
      setLoading(false);
    }
  };

  // admin-only fetch
  const fetchCategories = async () => {
    try {
      const data = await apiGet('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiGet('/users');
      setUsersList(data);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert(`${product.name} ditambahkan ke keranjang!`);
  };

  // --- admin product CRUD helpers ---
  const [showProdForm, setShowProdForm] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image: '',       // URL or existing path
    imageFile: null  // File object when uploading
  });

  const handleProdSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingProd ? 'PUT' : 'POST';
      const endpoint = editingProd ? `/products/${editingProd}` : `/products`;
      // always use FormData so we can send a file if present
      const formData = new FormData();
      formData.append('name', prodForm.name);
      formData.append('description', prodForm.description);
      formData.append('price', parseFloat(prodForm.price));
      formData.append('stock', parseInt(prodForm.stock));
      formData.append('category_id', parseInt(prodForm.category_id));
      if (prodForm.imageFile) {
        formData.append('image', prodForm.imageFile);
      } else if (prodForm.image) {
        formData.append('image', prodForm.image);
      }
      const res = await apiFormData(endpoint, method, formData);
      if (res.ok) {
        fetchProducts();
        setShowProdForm(false);
        setEditingProd(null);
        setProdForm({ name:'',description:'',price:'',stock:'',category_id:'', image: '', imageFile: null });
        alert('Produk berhasil disimpan');
      } else {
        const text = await res.text();
        console.error('Error saving product', res.status, text);
        alert('Gagal menyimpan produk: ' + (text || res.status));
      }
    } catch (err) {
      console.error('prod submit', err);
      alert('Terjadi kesalahan, lihat console');
    }
  };

  const handleProdEdit = (prod) => {
    setProdForm({
      ...prod,
      image: prod.image || '',
      imageFile: null
    });
    setEditingProd(prod.id);
    setShowProdForm(true);
  };

  const handleProdDelete = async (id) => {
    if (!window.confirm('Hapus produk?')) return;
    try {
      await apiDelete(`/products/${id}`);
      fetchProducts();
    } catch(err){console.error('delete prod',err);}  
  };

  // --- admin category CRUD helpers ---
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ category_name: '', description: '' });

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await apiPut(`/categories/${editingCat}`, catForm);
      } else {
        await apiPost(`/categories`, catForm);
      }
      fetchCategories();
      setShowCatForm(false);
      setEditingCat(null);
      setCatForm({ category_name:'', description:'' });
    } catch (err) {
      console.error('cat submit', err);
      alert(err.message || 'Gagal menyimpan kategori');
    }
  };

  const handleCatEdit = (cat) => {
    setCatForm(cat);
    setEditingCat(cat.id);
    setShowCatForm(true);
  };

  const handleCatDelete = async (id) => {
    if (!window.confirm('Hapus kategori?')) return;
    try {
      await apiDelete(`/categories/${id}`);
      fetchCategories();
    } catch(err){
      console.error('delete cat',err);
      alert(err.message || 'Gagal menghapus');
    }
  };

  // --- admin user CRUD helpers ---
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name:'', username:'', email:'', password:'', role:'customer', membership:true });

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = editingUser
        ? { name:userForm.name, username:userForm.username, email:userForm.email, role:userForm.role, membership:userForm.membership }
        : userForm;
      if (editingUser) {
        await apiPut(`/users/${editingUser}`, body);
      } else {
        await apiPost(`/users`, body);
      }
      fetchUsers();
      setShowUserForm(false);
      setEditingUser(null);
      setUserForm({ name:'', username:'', email:'', password:'', role:'customer', membership:true });
    } catch(err){console.error('user submit', err);}    
  };

  const handleUserEdit = (u) => {
    setUserForm({ name:u.name, username:u.username, email:u.email, password:'', role:u.role, membership:u.membership!==null });
    setEditingUser(u.id);
    setShowUserForm(true);
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm('Hapus user?')) return;
    try {
      await apiDelete(`/users/${id}`);
      fetchUsers();
    } catch(err){console.error('delete user',err);}  
  };

  const handleUserDeactivate = async (id) => {
    if (!window.confirm('Nonaktifkan user?')) return;
    try {
      await apiPut(`/users/${id}/deactivate`, {});
      fetchUsers();
    } catch(err){console.error('deact user',err);}  
  };
  if (!user || loading) {
    return <div className="loading">Memuat...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Toko Pakaian "ATELVIA"</h1>
          <div className="user-info">
            <div className="user-details">
              <span>Selamat datang, <strong>{user.name}</strong></span>
              <span className={`role-badge role-${user.role}`}>
                {user.role === 'admin' && 'ADMIN'}
                {user.role === 'cashier' && 'KASIR'}
                {user.role === 'customer' && 'CUSTOMER'}
              </span>
            </div>
            {user.role === 'customer' && (
              <button onClick={() => navigate('/cart')} className="cart-btn">
                Keranjang ({getTotalItems()})
              </button>
            )}
            <button onClick={handleLogout} className="logout-btn">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        <nav className="sidebar">
          <ul className="nav-menu">
            {(user.role === 'admin' || user.role === 'cashier') && (
              <li>
                <button
                  className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Ringkasan
                </button>
              </li>
            )}
            <li>
              <button
                className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                Produk ({products.length})
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Pesanan
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                Pengaturan
              </button>
            </li>
            {user.role === 'admin' && (
              <>  
                <li>
                  <button
                    className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
                    onClick={() => setActiveTab('categories')}
                  >
                    Kategori
                  </button>
                </li>
                <li>
                  <button
                    className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                  >
                    Users
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>

        <main className="main-content">
          {/* Tab Overview - Admin and Cashier Only */}
          {activeTab === 'overview' && (user.role === 'admin' || user.role === 'cashier') && (
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
                    <span className="activity-icon"></span>
                    <div>
                      <p>Pesanan baru diterima</p>
                      <small>2 jam yang lalu</small>
                    </div>
                  </li>
                  <li>
                    <span className="activity-icon"></span>
                    <div>
                      <p>Pelanggan baru terdaftar</p>
                      <small>5 jam yang lalu</small>
                    </div>
                  </li>
                  <li>
                    <span className="activity-icon"></span>
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
                {user.role === 'admin' && (
                  <button onClick={() => { setShowProdForm(!showProdForm); setEditingProd(null); setProdForm({ name:'',description:'',price:'',stock:'',category_id:'', image: '', imageFile: null }); }} className="btn-add">
                    {showProdForm ? 'Batal' : 'Tambah Produk'}
                  </button>
                )}
              </div>

              {showProdForm && user.role === 'admin' && (
                <form onSubmit={handleProdSubmit} style={{ background:'#f5f5f5',padding:'20px',marginBottom:'20px',borderRadius:'8px' }}>
                  <input type="text" placeholder="Nama Produk" value={prodForm.name} onChange={e=>setProdForm({...prodForm,name:e.target.value})} required />
                  {/* allow either URL or file upload for the image */}
                  <input type="text" placeholder="URL Gambar" value={prodForm.image} onChange={e=>setProdForm({...prodForm,image:e.target.value})} style={{marginTop:'8px'}} />
                  <input type="file" accept="image/*" onChange={e=>setProdForm({...prodForm,imageFile: e.target.files[0]})} style={{marginTop:'8px'}} />
                  <textarea placeholder="Deskripsi" value={prodForm.description} onChange={e=>setProdForm({...prodForm,description:e.target.value})}></textarea>
                  <input type="number" placeholder="Harga" step="0.01" value={prodForm.price} onChange={e=>setProdForm({...prodForm,price:e.target.value})} required />
                  <input type="number" placeholder="Stok" value={prodForm.stock} onChange={e=>setProdForm({...prodForm,stock:e.target.value})} required />
                  <select value={prodForm.category_id} onChange={e=>setProdForm({...prodForm,category_id:e.target.value})} required>
                    <option value="">Pilih Kategori</option>
                    {categories.map(c=> <option key={c.id} value={c.id}>{c.category_name}</option>)}
                  </select>
                  <button type="submit" className="btn-success">{editingProd ? 'Update' : 'Simpan'}</button>
                </form>
              )}

              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      {/* display image if provided, otherwise show placeholder text */}
                      {product.image ? (
                        <img
                          src={
                            // if image starts with http, use as-is (external URL)
                            product.image.startsWith('http')
                              ? product.image
                              // if image starts with /, it's a relative path like /uploads/file.jpg
                              // so we need to prepend the API_URL (backend) to reach it
                              : product.image.startsWith('/')
                              ? `${API_URL}${product.image}`
                              // otherwise treat as a complete URL
                              : product.image
                          }
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder.png';
                          }}
                        />
                      ) : (
                        <span>No Image</span>
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
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="btn-view-detail"
                        >
                          Lihat Detail
                        </button>
                        {user.role === 'customer' && (
                          <button 
                            onClick={() => handleAddToCart(product)}
                            className="btn-cart"
                            disabled={product.stock === 0}
                          >
                            Tambah ke Keranjang
                          </button>
                        )}
                        {user.role === 'admin' && (
                          <>
                            <button onClick={() => handleProdEdit(product)} className="btn-edit">Edit</button>
                            <button onClick={() => handleProdDelete(product.id)} className="btn-delete">Hapus</button>
                          </>
                        )}
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

          {user.role === 'admin' && activeTab === 'categories' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Kelola Kategori</h2>
                <button onClick={() => { setShowCatForm(!showCatForm); setEditingCat(null); setCatForm({ category_name:'',description:'' }); }} className="btn-add">
                  {showCatForm ? 'Batal' : 'Tambah Kategori'}
                </button>
              </div>
              {showCatForm && (
                <form onSubmit={handleCatSubmit} style={{ background:'#f5f5f5',padding:'20px',marginBottom:'20px',borderRadius:'8px' }}>
                  <input type="text" placeholder="Nama Kategori" value={catForm.category_name} onChange={e=>setCatForm({...catForm,category_name:e.target.value})} required />
                  <textarea placeholder="Deskripsi" value={catForm.description} onChange={e=>setCatForm({...catForm,description:e.target.value})}></textarea>
                  <button type="submit" className="btn-success">{editingCat ? 'Update' : 'Simpan'}</button>
                </form>
              )}
              <table className="admin-table">
                <thead>
                  <tr><th>ID</th><th>Nama</th><th>Deskripsi</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {categories.map(cat=> (
                    <tr key={cat.id}>
                      <td>{cat.id}</td><td>{cat.category_name}</td><td>{cat.description}</td>
                      <td>
                        <button onClick={()=>handleCatEdit(cat)} className="btn-edit">Edit</button>
                        <button onClick={()=>handleCatDelete(cat.id)} className="btn-delete">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {user.role === 'admin' && activeTab === 'users' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Kelola User</h2>
                <button onClick={() => { setShowUserForm(!showUserForm); setEditingUser(null); setUserForm({ name:'',username:'',email:'',password:'',role:'customer',membership:true }); }} className="btn-add">
                  {showUserForm ? 'Batal' : 'Tambah User'}
                </button>
              </div>
              {showUserForm && (
                <form onSubmit={handleUserSubmit} style={{ background:'#f5f5f5',padding:'20px',marginBottom:'20px',borderRadius:'8px' }}>
                  <input type="text" placeholder="Nama" value={userForm.name} onChange={e=>setUserForm({...userForm,name:e.target.value})} required />
                  <input type="text" placeholder="Username" value={userForm.username} onChange={e=>setUserForm({...userForm,username:e.target.value})} required />
                  <input type="email" placeholder="Email" value={userForm.email} onChange={e=>setUserForm({...userForm,email:e.target.value})} required />
                  {!editingUser && <input type="password" placeholder="Password" value={userForm.password} onChange={e=>setUserForm({...userForm,password:e.target.value})} required />}
                  <select value={userForm.role} onChange={e=>setUserForm({...userForm,role:e.target.value})}>
                    <option value="customer">Customer</option>
                    <option value="cashier">Cashier</option>
                    <option value="admin">Admin</option>
                  </select>
                  <label><input type="checkbox" checked={userForm.membership} onChange={e=>setUserForm({...userForm,membership:e.target.checked})} /> Aktif</label>
                  <button type="submit" className="btn-success">{editingUser ? 'Update' : 'Simpan'}</button>
                </form>
              )}
              <table className="admin-table">
                <thead>
                  <tr><th>ID</th><th>Nama</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {usersList.map(u=> (
                    <tr key={u.id}>
                      <td>{u.id}</td><td>{u.name}</td><td>{u.username}</td><td>{u.email}</td>
                      <td>{u.role}</td><td>{u.membership?'Aktif':'Nonaktif'}</td>
                      <td>
                        <button onClick={()=>handleUserEdit(u)} className="btn-edit">Edit</button>
                        {u.membership && <button onClick={()=>handleUserDeactivate(u.id)} className="btn-deactivate">Nonaktif</button>}
                        <button onClick={()=>handleUserDelete(u.id)} classity="btn-delete">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
