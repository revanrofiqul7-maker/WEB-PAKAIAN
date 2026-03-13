import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000';

export default function AdminTransactions() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        logout();
        navigate('/');
        return;
      }
      const data = await res.json();
      setTransactions(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-content"><p>Loading...</p></div>;

  return (
    <div className="admin-container">
      <nav className="admin-nav">
        <h1>Lihat Transaksi</h1>
        <button onClick={() => { logout(); navigate('/'); }} className="logout-btn">Logout</button>
      </nav>

      <div className="admin-content">
        <div style={{ marginBottom: '20px', background: '#e3f2fd', padding: '10px', borderRadius: '4px' }}>
          <strong>Total Transaksi:</strong> {transactions.length}
        </div>

        {transactions.length === 0 ? (
          <p style={{ background: '#f5f5f5', padding: '20px', textAlign: 'center', borderRadius: '4px' }}>Belum ada transaksi</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer ID</th>
                <th>Cashier By</th>
                <th>Diskon</th>
                <th>Total Harga</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.customer_id}</td>
                  <td>{transaction.cashier_by}</td>
                  <td>Rp {transaction.discount_applied?.toLocaleString('id-ID') || '0'}</td>
                  <td>Rp {transaction.total_amount?.toLocaleString('id-ID')}</td>
                  <td>{new Date(transaction.created_at).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
