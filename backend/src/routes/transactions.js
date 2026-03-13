const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyToken, verifyAdmin, verifyCustomer } = require("../middleware/authorization");

// === GET all transactions (Admin Only) ===
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GET transaction by ID (Admin dapat read semua, Customer hanya bisa read milik sendiri) ===
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions WHERE id=$1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Transaction not found" });
    
    const transaction = result.rows[0];
    
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

    const result = await pool.query(
      `INSERT INTO transactions (customer_id, cashier_by, discount_applied, total_amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [customer_id, cashier_by, discount_applied, total_amount]
    );

    res.status(201).json(result.rows[0]);
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

    put: {
      summary: "Perbarui transaksi berdasarkan ID",
      tags: ["Transactions (cashier)"],
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
                customer_id: { type: "integer" },
                cashier_by: { type: "integer" },
                discount_applied: { type: "number" },
                total_amount: { type: "number" }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Transaksi diperbarui" } }
    }
  }
};
