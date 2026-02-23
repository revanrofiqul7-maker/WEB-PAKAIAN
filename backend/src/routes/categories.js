const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyToken, verifyAdmin } = require("../middleware/authorization");

// === GET all categories ===
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GET category by ID ===
router.get("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories WHERE id=$1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Category not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === POST new category ===
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { category_name, description } = req.body;
    const result = await pool.query(
      "INSERT INTO categories (category_name, description) VALUES ($1, $2) RETURNING *",
      [category_name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PUT update category ===
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { category_name, description } = req.body;
    const result = await pool.query(
      "UPDATE categories SET category_name=$1, description=$2 WHERE id=$3 RETURNING *",
      [category_name, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === DELETE category ===
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM categories WHERE id=$1", [req.params.id]);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

module.exports.swaggerDocs = {
  "/categories": {
    get: {
      summary: "Ambil semua kategori",
      tags: ["Category (admin)"],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Daftar kategori" } }
    },
    post: {
      summary: "Tambah kategori baru",
      tags: ["Category (admin)"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                category_name: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        }
      },
      responses: { 201: { description: "Kategori ditambahkan" } }
    }
  },

  "/categories/{id}": {
    get: {
      summary: "Ambil kategori berdasarkan ID",
      tags: ["Category (admin)"],
      security: [{ bearerAuth: [] }],  // ← DITAMBAHKAN DI SINI
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: { 200: { description: "Detail kategori" } }
    },

    put: {
      summary: "Perbarui kategori",
      tags: ["Category (admin)"],
      security: [{ bearerAuth: [] }],  // ← DITAMBAHKAN DI SINI
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                category_name: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Kategori diperbarui" } }
    },

    delete: {
      summary: "Hapus kategori berdasarkan ID",
      tags: ["Category (admin)"],
      security: [{ bearerAuth: [] }],  // ← DITAMBAHKAN DI SINI
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: { 200: { description: "Kategori dihapus" } }
    }
  }
};
