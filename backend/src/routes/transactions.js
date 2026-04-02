const express = require("express");
const router = express.Router();
const supabase = require("../db/supabase");
const { verifyToken, verifyAdmin, verifyCustomer } = require("../middleware/authorization");

// === GET all transactions (Admin Only) ===
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GET transaction by ID (Admin dapat read semua, Customer hanya bisa read milik sendiri) ===
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Transaction not found" });
      }
      throw error;
    }
    
    const transaction = data;
    
    // Jika customer, pastikan transaksi adalah miliknya sendiri
    if (req.user.role === "customer" && transaction.customer_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden - Cannot access other customer's transaction" });
    }
    
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === POST new transaction (Customer Only) ===
router.post("/", verifyToken, verifyCustomer, async (req, res) => {
  try {
    const { cashier_by, discount_applied, total_amount } = req.body;
    
    // Customer ID adalah dari token user yang login
    const customer_id = req.user.id;

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        customer_id,
        cashier_by: cashier_by ? parseInt(cashier_by) : null,
        discount_applied: discount_applied ? parseFloat(discount_applied) : 0,
        total_amount: parseFloat(total_amount)
      }])
      .select('*');

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

module.exports.swaggerDocs = {
  "/transactions": {
    get: {
      summary: "Ambil semua transaksi",
      tags: ["Transactions (cashier)"],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Daftar transaksi" } }
    },
    post: {
      summary: "Simpan transaksi baru",
      tags: ["Transactions (cashier)"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                customer_id: { type: "integer" },
                cashier_by: { type: "integer" },
                discount_applied: { type: "number" },
                total_amount: { type: "number" }
              }
            }
          }
        }
      },
      responses: { 201: { description: "Transaksi berhasil dibuat" } }
    }
  },

  "/transactions/{id}": {
    get: {
      summary: "Ambil transaksi berdasarkan ID",
      tags: ["Transactions (cashier)"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: { 200: { description: "Detail transaksi" } }
    },

    post: {
      summary: "Buat transaksi baru",
      tags: ["Transactions (cashier)"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                cashier_by: { type: "integer" },
                discount_applied: { type: "number" },
                total_amount: { type: "number" }
              }
            }
          }
        }
      },
      responses: { 201: { description: "Transaksi berhasil dibuat" } }
    }
  }
};
