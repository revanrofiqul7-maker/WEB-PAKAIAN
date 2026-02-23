const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyToken, verifyAdmin } = require("../middleware/authorization");

// === GET all products ===
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GET product by ID ===
router.get("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === POST new product ===
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, price, stock, category_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PUT update product ===
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const result = await pool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, stock=$4 WHERE id=$5 RETURNING *`,
      [name, description, price, stock, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === DELETE product ===
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id=$1", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

module.exports.swaggerDocs = {
  "/products": {
    get: {
      summary: "Ambil semua produk",
      tags: ["Product (admin)"],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Daftar produk" } }
    },
    post: {
      summary: "Tambah produk baru",
      tags: ["Product (admin)"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                stock: { type: "integer" },
                category_id: { type: "integer" }
              }
            }
          }
        }
      },
      responses: { 201: { description: "Produk ditambahkan" } }
    }
  },

  "/products/{id}": {
    get: {
      summary: "Ambil produk berdasarkan ID",
      tags: ["Product (admin)"],
      security: [{ bearerAuth: [] }],   // <--- WAJIB DITAMBAHKAN DI SINI
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: { 200: { description: "Detail produk" } }
    },

    put: {
      summary: "Perbarui produk berdasarkan ID",
      tags: ["Product (admin)"],
      security: [{ bearerAuth: [] }],   // <--- DITAMBAHKAN DI SINI
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                stock: { type: "integer" }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Produk diperbarui" } }
    },

    delete: {
      summary: "Hapus produk berdasarkan ID",
      tags: ["Product (admin)"],
      security: [{ bearerAuth: [] }],   // <--- DITAMBAHKAN DI SINI
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: { 200: { description: "Produk dihapus" } }
    }
  }
};
