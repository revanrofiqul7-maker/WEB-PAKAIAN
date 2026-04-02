const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const bcrypt = require('bcrypt');
const { verifyToken, verifyAdmin } = require("../middleware/authorization");

// === GET semua user (Admin Only) ===
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, username, email, role, membership');
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GET profil user login (Untuk semua user yang sudah login) ===
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, username, email, role, membership')
      .eq('id', req.user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "User not found" });
      }
      throw error;
    }
    
    res.json(data);
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([{
        name,
        username,
        email,
        password: hashedPassword,
        role,
        membership: membership ? new Date() : null
      }])
      .select('id, name, username, email, role, membership');

    if (error) throw error;

    res.status(201).json({
      message: "User berhasil ditambahkan.",
      data: data[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PUT update user (Admin Only) ===
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, username, email, role, membership } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .update({ name, username, email, role, membership })
      .eq('id', req.params.id)
      .select('id, name, username, email, role, membership');
    
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      message: "User updated successfully",
      data: data[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PUT nonaktifkan user (Admin Only) ===
router.put('/:id/deactivate', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { error } = await supabase
      .from('users')
      .update({ membership: null })
      .eq('id', userId);
    
    if (error) throw error;
    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === DELETE user (Admin Only) ===
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


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
