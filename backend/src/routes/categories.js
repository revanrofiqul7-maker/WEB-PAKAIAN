const express = require("express");
const router = express.Router();
const supabase = require("../db/supabase");
const { verifyToken, verifyAdmin, verifyCategoryNotInUse } = require("../middleware/authorization");

// === GET all categories ===
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GET category by ID ===
router.get("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Category not found" });
      }
      throw error;
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === POST new category ===
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { category_name, description } = req.body;
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        category_name,
        description
      }])
      .select('*');
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PUT update category ===
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { category_name, description } = req.body;
    
    const { data, error } = await supabase
      .from('categories')
      .update({ category_name, description })
      .eq('id', req.params.id)
      .select('*');
    
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === DELETE category (dengan validasi) ===
router.delete("/:id", verifyToken, verifyAdmin, verifyCategoryNotInUse, async (req, res) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
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
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: { 200: { description: "Detail kategori" } }
    },

    put: {
      summary: "Perbarui kategori berdasarkan ID",
      tags: ["Category (admin)"],
      security: [{ bearerAuth: [] }],
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
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: { 200: { description: "Kategori dihapus" } }
    }
  }
};