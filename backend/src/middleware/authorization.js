const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
require("dotenv").config();

// ====== Verifikasi Token ======
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user; // simpan info user di request
    next();
  });
}

// ====== Verifikasi Admin ======
function verifyAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admin only" });
  }
  next();
}

// ====== Verifikasi Customer/User biasa ======
function verifyCustomer(req, res, next) {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Forbidden - Customer only" });
  }
  next();
}

// ====== Verifikasi Kategori tidak dipakai produk sebelum delete ======
async function verifyCategoryNotInUse(req, res, next) {
  try {
    const categoryId = req.params.id;
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM products WHERE category_id = $1",
      [categoryId]
    );
    
    if (result.rows[0].count > 0) {
      return res.status(400).json({ 
        error: "Cannot delete category - it's being used by products" 
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { verifyToken, verifyAdmin, verifyCustomer, verifyCategoryNotInUse };
