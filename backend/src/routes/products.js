const express = require("express");
const router = express.Router();
const supabase = require("../db/supabase");
const { verifyToken, verifyAdmin } = require("../middleware/authorization");

// multer setup to handle image uploads for products
const multer = require("multer");
const path = require("path");

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

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
    let imageUrl = null;
    
    // Upload image to Supabase Storage jika ada file
    if (req.file) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${req.file.originalname.split('.').pop()}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('products')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype
        });
      
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      
      // Get public URL
      const { data } = supabase
        .storage
        .from('products')
        .getPublicUrl(fileName);
      
      imageUrl = data?.publicUrl;
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category_id: category_id ? parseInt(category_id) : null,
        image: imageUrl
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
    const { name, description, price, stock, category_id } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (category_id !== undefined) updateData.category_id = category_id ? parseInt(category_id) : null;
    
    // Handle image upload to Supabase Storage
    if (req.file) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${req.file.originalname.split('.').pop()}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('products')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype
        });
      
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      
      const { data } = supabase
        .storage
        .from('products')
        .getPublicUrl(fileName);
      
      updateData.image = data?.publicUrl;
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
    res.status(500).json({ error: err.message });
  }
});

// === DELETE product (Admin Only) ===
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Get product first to get image URL
    const { data: product, error: getError } = await supabase
      .from('products')
      .select('image')
      .eq('id', req.params.id)
      .single();
    
    if (getError) throw getError;
    
    // Delete image from Supabase Storage if exists
    if (product?.image) {
      try {
        const fileName = product.image.split('/').pop();
        await supabase
          .storage
          .from('products')
          .remove([fileName]);
      } catch (storageError) {
        console.warn('Warning: Could not delete image from storage', storageError);
      }
    }
    
    // Delete product from database
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);
    
    if (deleteError) throw deleteError;
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
