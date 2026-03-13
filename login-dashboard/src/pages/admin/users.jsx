import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000';

export default function AdminUsers() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'customer',
    membership: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        logout();
        navigate('/');
        return;
      }
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_BASE}/api/users/${editingId}`
        : `${API_BASE}/api/users`;

      const body = editingId
        ? { name: formData.name, username: formData.username, email: formData.email, role: formData.role, membership: formData.membership }
        : formData;

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        fetchUsers();
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', username: '', email: '', password: '', role: 'customer', membership: true });
        alert(editingId ? 'User diperbarui' : 'User ditambahkan');
      } else {
        alert('Gagal menyimpan user');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus user ini?')) {
      try {
        const res = await fetch(`${API_BASE}/api/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchUsers();
          alert('User dihapus');
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Nonaktifkan user ini?')) {
      try {
        const res = await fetch(`${API_BASE}/api/users/${id}/deactivate`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchUsers();
          alert('User dinonaktifkan');
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      membership: user.membership !== null
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  if (loading) return <div className="admin-content"><p>Loading...</p></div>;

  return (
    <div className="admin-container">
      <nav className="admin-nav">
        <h1>Kelola Users</h1>
        <button onClick={() => { logout(); navigate('/'); }} className="logout-btn">Logout</button>
      </nav>

      <div className="admin-content">
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', username: '', email: '', password: '', role: 'customer', membership: true }); }} className="btn-primary">
            {showForm ? 'Batal' : 'Tambah User'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
            <input type="text" placeholder="Nama" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <input type="text" placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            {!editingId && <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />}
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
            <label>
              <input type="checkbox" checked={formData.membership} onChange={(e) => setFormData({ ...formData, membership: e.target.checked })} />
              Aktif
            </label>
            <button type="submit" className="btn-success">{editingId ? 'Update' : 'Simpan'}</button>
          </form>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td><span style={{ background: user.role === 'admin' ? '#ff6b6b' : '#4CAF50', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>{user.role}</span></td>
                <td>{user.membership ? 'Aktif' : 'Nonaktif'}</td>
                <td>
                  <button onClick={() => handleEdit(user)} className="btn-edit">Edit</button>
                  {user.membership && <button onClick={() => handleDeactivate(user.id)} className="btn-deactivate">Nonaktifkan</button>}
                  <button onClick={() => handleDelete(user.id)} className="btn-delete">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
