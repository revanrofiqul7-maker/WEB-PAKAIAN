const express = require("express");
const router = express.Router();
const supabase = require("../db/supabase");
const { verifyToken, verifyAdmin } = require("../middleware/authorization");

// NOTE: the products table should include an `image` column (TEXT) to store the URL/path.
// multer setup to handle image uploads for products
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // store uploads in backend/public/uploads
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
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GET product by ID (Customer & Admin can read) ===
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Product not found" });
      }
      throw error;
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === POST new product (Admin Only) ===
router.post("/", verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    let imagePath = req.body.image || null;
    
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category_id: category_id ? parseInt(category_id) : null,
        image: imagePath
      }])
      .select('*');
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PUT update product (Admin Only) ===
router.put("/:id", verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('PUT /products', req.params.id, 'body=', req.body, 'file=', req.file);

    const { name, description, price, stock, category_id } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (category_id !== undefined) updateData.category_id = category_id ? parseInt(category_id) : null;
    
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', req.params.id)
      .select('*');
    
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('PUT /products error', err);
    res.status(500).json({ error: err.message });
  }
});

// === DELETE product (Admin Only) ===
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
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
