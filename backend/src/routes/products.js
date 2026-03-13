const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyToken, verifyAdmin } = require("../middleware/authorization");

// NOTE: the products table should include an `image` column (TEXT) to store the URL/path.
// Example SQL, run via psql or your migration tool:
//   ALTER TABLE products ADD COLUMN image TEXT;
// multer setup to handle image uploads for products
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // store uploads in backend/public/uploads
    // __dirname is backend/src/routes, so go up 2 levels to backend, then into public
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// === GET all products (Customer & Admin can read) ===
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GET product by ID (Customer & Admin can read) ===
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === POST new product (Admin Only) ===
// accepts multipart/form-data with an optional image file (field name "image")
router.post("/", verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    // image may come as a URL in req.body.image or as an uploaded file
    let imagePath = req.body.image || null;
    if (req.file) {
      // prepend slash to make it a public path
      imagePath = `/uploads/${req.file.filename}`;
    }
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id, image)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, price, stock, category_id, imagePath]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PUT update product (Admin Only) ===
// can update fields and optionally replace image (via multipart/form-data)
router.put("/:id", verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    // debug log incoming data
    console.log('PUT /products', req.params.id, 'body=', req.body, 'file=', req.file);

    const { name, description, price, stock, category_id } = req.body;
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    // use COALESCE so that when imagePath is null we leave the existing value
    // also update category_id if provided (form sends it)
    const result = await pool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, stock=$4,
           image=COALESCE($5, image), category_id=COALESCE($6, category_id)
           WHERE id=$7 RETURNING *`,
      [name, description, price, stock, imagePath, category_id || null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /products error', err);
    res.status(500).json({ error: err.message });
  }
});

// === DELETE product (Admin Only) ===
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
                category_id: { type: "integer" },
                image: { type: "string", description: "URL atau path ke gambar (opsional)" }
              }
            }
          },
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                stock: { type: "integer" },
                category_id: { type: "integer" },
                image: { type: "string", format: "binary", description: "File gambar" }
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
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: { 200: { description: "Detail produk" } }
    },

    put: {
      summary: "Perbarui produk berdasarkan ID",
      tags: ["Product (admin)"],
      security: [{ bearerAuth: [] }],
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
                stock: { type: "integer" },
                image: { type: "string", description: "URL atau path gambar (opsional)" }
              }
            }
          },
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                stock: { type: "integer" },
                image: { type: "string", format: "binary", description: "File gambar" }
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
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: { 200: { description: "Produk dihapus" } }
    }
  }
};
