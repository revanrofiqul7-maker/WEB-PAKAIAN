import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000';

export default function AdminCategories() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category_name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        logout();
        navigate('/');
        return;
      }
      const data = await res.json();
      setCategories(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_BASE}/api/categories/${editingId}`
        : `${API_BASE}/api/categories`;

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchCategories();
        setShowForm(false);
        setEditingId(null);
        setFormData({ category_name: '', description: '' });
        alert(editingId ? 'Kategori diperbarui' : 'Kategori ditambahkan');
      } else {
        const errData = await res.json();
        alert('Error: ' + (errData.error || 'Gagal menyimpan kategori'));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus kategori ini?')) {
      try {
        const res = await fetch(`${API_BASE}/api/categories/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchCategories();
          alert('Kategori dihapus');
        } else {
          const errData = await res.json();
          alert('Error: ' + (errData.error || 'Gagal menghapus kategori'));
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  const handleEdit = (category) => {
    setFormData(category);
    setEditingId(category.id);
    setShowForm(true);
  };

  if (loading) return <div className="admin-content"><p>Loading...</p></div>;

  return (
    <div className="admin-container">
      <nav className="admin-nav">
        <h1>Kelola Kategori</h1>
        <button onClick={() => { logout(); navigate('/'); }} className="logout-btn">Logout</button>
      </nav>

      <div className="admin-content">
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ category_name: '', description: '' }); }} className="btn-primary">
            {showForm ? 'Batal' : 'Tambah Kategori'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
            <input type="text" placeholder="Nama Kategori" value={formData.category_name} onChange={(e) => setFormData({ ...formData, category_name: e.target.value })} required />
            <textarea placeholder="Deskripsi" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            <button type="submit" className="btn-success">{editingId ? 'Update' : 'Simpan'}</button>
          </form>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Kategori</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.category_name}</td>
                <td>{category.description}</td>
                <td>
                  <button onClick={() => handleEdit(category)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(category.id)} className="btn-delete">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
