import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000';

export default function AdminProducts() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        logout();
        navigate('/');
        return;
      }
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_BASE}/api/products/${editingId}`
        : `${API_BASE}/api/products`;

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          category_id: parseInt(formData.category_id)
        })
      });

      if (res.ok) {
        fetchProducts();
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', description: '', price: '', stock: '', category_id: '' });
        alert(editingId ? 'Produk diperbarui' : 'Produk ditambahkan');
      } else {
        alert('Gagal menyimpan produk');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus produk ini?')) {
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchProducts();
          alert('Produk dihapus');
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowForm(true);
  };

  if (loading) return <div className="admin-content"><p>Loading...</p></div>;

  return (
    <div className="admin-container">
      <nav className="admin-nav">
        <h1>Kelola Produk</h1>
        <button onClick={() => { logout(); navigate('/'); }} className="logout-btn">Logout</button>
      </nav>

      <div className="admin-content">
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', description: '', price: '', stock: '', category_id: '' }); }} className="btn-primary">
            {showForm ? 'Batal' : 'Tambah Produk'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
            <input type="text" placeholder="Nama Produk" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <textarea placeholder="Deskripsi" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            <input type="number" placeholder="Harga" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            <input type="number" placeholder="Stok" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
            <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} required>
              <option value="">Pilih Kategori</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.category_name}</option>)}
            </select>
            <button type="submit" className="btn-success">{editingId ? 'Update' : 'Simpan'}</button>
          </form>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Kategori</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>Rp {product.price?.toLocaleString('id-ID')}</td>
                <td>{product.stock}</td>
                <td>{categories.find(c => c.id === product.category_id)?.category_name || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(product)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="btn-delete">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
