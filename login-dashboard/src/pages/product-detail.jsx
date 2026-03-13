import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { apiGet } from '../utils/api';
import './product-detail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      const data = await apiGet(`/products/${id}`);
      setProduct(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product detail', err);
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (quantity < 1) {
      alert('Jumlah harus minimal 1');
      return;
    }
    if (quantity > product.stock) {
      alert('Stok tidak cukup');
      return;
    }
    addToCart(product, quantity);
    alert(`${product.name} ditambahkan ke keranjang!`);
    navigate('/cart');
  };

  if (loading) {
    return <div className="loading-page">Memuat data produk...</div>;
  }

  if (!product) {
    return (
      <div className="error-page">
        <h2>Produk tidak ditemukan</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate('/dashboard')} className="btn-back">
        ← Kembali
      </button>

      <div className="product-detail-wrapper">
        {/* Product Image */}
        <div className="product-detail-image">
          {product.image ? (
            <img
              src={
                product.image.startsWith('http')
                  ? product.image
                  : product.image.startsWith('/')
                  ? `${API_URL}${product.image}`
                  : product.image
              }
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder.png';
              }}
            />
          ) : (
            <div className="no-image-placeholder">No Image Available</div>
          )}
        </div>

        {/* Product Details */}
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          
          <div className="product-meta">
            <span className="category-badge">{product.category || 'Uncategorized'}</span>
            <span className={`stock-status ${product.stock > 0 ? 'available' : 'out-of-stock'}`}>
              {product.stock > 0 ? 'Tersedia' : 'Stok Habis'}
            </span>
          </div>

          <div className="product-price">
            <h2>Rp {product.price.toLocaleString('id-ID')}</h2>
            <span className="stock-info">Stok: {product.stock} pcs</span>
          </div>

          <div className="product-description">
            <h3>Deskripsi Produk</h3>
            <p>{product.description || 'Deskripsi tidak tersedia'}</p>
          </div>

          {/* Add to Cart Section */}
          {user?.role === 'customer' && (
            <div className="product-actions">
              <div className="quantity-selector">
                <label>Jumlah:</label>
                <div className="quantity-control">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-add-to-cart"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
              </button>
            </div>
          )}

          {/* Additional Info */}
          <div className="product-additional-info">
            <div className="info-item">
              <strong>ID Produk:</strong>
              <span>#{product.id}</span>
            </div>
            <div className="info-item">
              <strong>Kategori:</strong>
              <span>{product.category || 'Tidak ditentukan'}</span>
            </div>
            {product.created_at && (
              <div className="info-item">
                <strong>Ditambahkan:</strong>
                <span>{new Date(product.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
