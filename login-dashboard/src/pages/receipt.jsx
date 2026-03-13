import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './receipt.css';

export default function Receipt() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      setOrder(JSON.parse(lastOrder));
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return <div className="loading">Memuat struk...</div>;
  }

  return (
    <div className="receipt-container">
      <div className="receipt-box">
        <div className="receipt-header">
          <h1>TOKO PAKAIAN</h1>
          <p>Struk Pembayaran / Invoice</p>
        </div>

        <div className="receipt-content">
          <div className="order-number">
            <strong>Order ID:</strong> {order.orderID}
          </div>

          <div className="order-datetime">
            <strong>Tanggal & Waktu:</strong> {order.timestamp}
          </div>

          <div className="divider"></div>

          <div className="customer-info">
            <h3>DATA PELANGGAN</h3>
            <p>
              <strong>Nama:</strong> {order.customer.fullName}
            </p>
            <p>
              <strong>Email:</strong> {order.customer.email}
            </p>
            <p>
              <strong>Telepon:</strong> {order.customer.phone}
            </p>
            <p>
              <strong>Alamat:</strong> {order.customer.address}
            </p>
          </div>

          <div className="divider"></div>

          <div className="items-section">
            <h3>DAFTAR BARANG</h3>
            <table className="receipt-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Qty</th>
                  <th>Harga</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="qty">{item.quantity}</td>
                    <td>Rp {item.price.toLocaleString('id-ID')}</td>
                    <td className="total">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divider"></div>

          <div className="payment-section">
            <h3>💳 RINCIAN PEMBAYARAN</h3>
            <div className="payment-row">
              <span>Subtotal:</span>
              <strong>Rp {order.totalPrice.toLocaleString('id-ID')}</strong>
            </div>
            <div className="payment-row">
              <span>Pajak (0%):</span>
              <strong>Rp 0</strong>
            </div>
            <div className="payment-row">
              <span>Ongkos Kirim:</span>
              <strong>Rp 0</strong>
            </div>
            <div className="payment-row total-row">
              <span>Total Pembayaran:</span>
              <strong className="total-amount">
                Rp {order.totalPrice.toLocaleString('id-ID')}
              </strong>
            </div>
            <div className="payment-row">
              <span>Metode:</span>
              <strong>
                {order.paymentMethod === 'cash'
                  ? 'Tunai (COD)'
                  : order.paymentMethod === 'transfer'
                  ? 'Transfer Bank'
                  : 'E-Wallet'}
              </strong>
            </div>
            <div className="payment-row">
              <span>Status:</span>
              <strong className="status-success">✓ {order.status}</strong>
            </div>
          </div>

          <div className="divider"></div>

          <div className="receipt-footer">
            <p>Terima kasih telah berbelanja di Toko Pakaian kami!</p>
            <p className="footer-note">Struk ini dapat dijadikan bukti pembayaran</p>
          </div>
        </div>

        <div className="receipt-actions">
          <button onClick={handlePrint} className="btn-print">
            Cetak Struk
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-home">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
