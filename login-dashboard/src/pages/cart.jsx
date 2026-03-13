import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useContext(CartContext);

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Keranjang Belanja Kosong</h2>
          <p>Belum ada barang di keranjang Anda</p>
          <button onClick={() => navigate('/dashboard')} className="btn-continue">
            Lanjut Belanja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Keranjang Belanja</h1>
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Kembali
        </button>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Kuantitas</th>
                <th>Total</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td className="product-name">{item.name}</td>
                  <td>{item.category}</td>
                  <td>Rp {item.price.toLocaleString('id-ID')}</td>
                  <td>
                    <div className="quantity-control">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="qty-btn"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="item-total">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="btn-remove"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cart-summary">
          <div className="summary-box">
            <div className="summary-row">
              <span>Total Item:</span>
              <strong>{getTotalItems()}</strong>
            </div>
            <div className="summary-row">
              <span>Subtotal:</span>
              <strong>Rp {getTotalPrice().toLocaleString('id-ID')}</strong>
            </div>
            <div className="summary-row">
              <span>Pajak (0%):</span>
              <strong>Rp 0</strong>
            </div>
            <div className="summary-row total">
              <span>Total Harga:</span>
              <strong className="total-price">
                Rp {getTotalPrice().toLocaleString('id-ID')}
              </strong>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-checkout"
            >
              Lanjut ke Pembayaran →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
