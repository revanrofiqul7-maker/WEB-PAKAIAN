const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { verifyToken, verifyAdmin } = require("../middleware/authorization");

// === GET semua user (Admin Only) ===
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, username, email, role, membership FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GET profil user login (Untuk semua user yang sudah login) ===
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await pool.query('SELECT id, name, username, email, role, membership FROM users WHERE id=$1', [req.user.id]);
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === POST tambah user baru (Admin Only) ===
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, username, email, password, role, membership } = req.body;

    if (!name || !username || !email || !password || !role) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    const result = await pool.query(
      `INSERT INTO users (name, username, email, password, role, membership)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, username, email, role, membership`,
      [name, username, email, password, role, membership]
    );

    res.status(201).json({
      message: "User berhasil ditambahkan.",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PUT update user (Admin Only) ===
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, username, email, role, membership } = req.body;
    const result = await pool.query(
      `UPDATE users SET name=$1, username=$2, email=$3, role=$4, membership=$5 WHERE id=$6 
       RETURNING id, name, username, email, role, membership`,
      [name, username, email, role, membership, req.params.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PUT nonaktifkan user (Admin Only) ===
router.put('/:id/deactivate', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await pool.query('UPDATE users SET membership = NULL WHERE id=$1', [userId]);
    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === DELETE user (Admin Only) ===
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

module.exports.swaggerDocs = {
  "/users": {
    get: {
      summary: "Ambil semua user",
      tags: ["User Management (admin)"],
      responses: { 200: { description: "Daftar user" } }
    },
    post: {
      summary: "Tambah users baru",
      tags: ["User Management (admin)"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                username: { type: "string" },
                email: { type: "string" },
                password: { type: "string" },
                role: { type: "string" },
                membership: { type: "string" }
              }
            }
          }
        }
      },
      responses: { 201: { description: "User ditambahkan" } }
    }
  },
  "/users/profile": {
    get: {
      summary: "Lihat profil user login",
      tags: ["User Management (admin)"],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Profil user" } }
    }
  },
  "/users/deactivate-user": {
    put: {
      summary: "Nonaktifkan user berdasarkan ID",
      tags: ["User Management (admin)"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { id: { type: "integer" } }
            }
          }
        }
      },
      responses: { 200: { description: "User dinonaktifkan" } }
    }
  }
};
