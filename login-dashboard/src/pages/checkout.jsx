import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useContext(CartContext);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'cash'
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    // Validasi form
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      alert('Semua data harus diisi');
      return;
    }

    if (cart.length === 0) {
      alert('Keranjang kosong');
      return;
    }

    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      const orderData = {
        orderID: 'ORD-' + Date.now(),
        timestamp: new Date().toLocaleString('id-ID'),
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        },
        items: cart,
        totalPrice: getTotalPrice(),
        paymentMethod: formData.paymentMethod,
        status: 'Berhasil'
      };

      // Save order data for receipt
      localStorage.setItem('lastOrder', JSON.stringify(orderData));

      // Clear cart
      clearCart();

      setLoading(false);

      // Redirect to receipt
      navigate('/receipt');
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <h2>Keranjang Kosong</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>💳 Checkout</h1>
        <button onClick={() => navigate('/cart')} className="btn-back">
          ← Kembali ke Keranjang
        </button>
      </div>

      <div className="checkout-content">
        <div className="checkout-form">
          <h2>Data Pelanggan</h2>
          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label>Nama Lengkap *</label>
              <input
                type="text"
                name="fullName"
                placeholder="Masukkan nama lengkap"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>No. Telepon *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Alamat Pengiriman *</label>
              <textarea
                name="address"
                placeholder="Jl. ... No. ... Kota"
                rows="3"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Metode Pembayaran</label>
              <div className="payment-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                  />
                  💵 Tunai (COD)
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={formData.paymentMethod === 'transfer'}
                    onChange={handleInputChange}
                  />
                  🏦 Transfer Bank
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ewallet"
                    checked={formData.paymentMethod === 'ewallet'}
                    onChange={handleInputChange}
                  />
                  📱 E-Wallet
                </label>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Memproses...' : 'Selesaikan Pembayaran'}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h2>Ringkasan Pesanan</h2>
          <div className="order-items">
            {cart.map((item) => (
              <div key={item.id} className="order-item">
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <span className="item-qty">x{item.quantity}</span>
                </div>
                <p className="item-price">
                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <strong>Rp {getTotalPrice().toLocaleString('id-ID')}</strong>
            </div>
            <div className="summary-row">
              <span>Ongkos Kirim:</span>
              <strong>Rp 0</strong>
            </div>
            <div className="summary-row total">
              <span>Total Pembayaran:</span>
              <strong className="total-amount">
                Rp {getTotalPrice().toLocaleString('id-ID')}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
