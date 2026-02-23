const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyToken } = require("../middleware/authorization");

// === GET all transactions ===
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GET transaction by ID ===
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions WHERE id=$1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Transaction not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === POST new transaction ===
router.post("/", verifyToken, async (req, res) => {
  try {
    const { customer_id, cashier_by, discount_applied, total_amount } = req.body;

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

// === PUT update transaction ===
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { customer_id, cashier_by, discount_applied, total_amount } = req.body;
    const result = await pool.query(
      `UPDATE transactions
       SET customer_id = $1,
           cashier_by = $2,
           discount_applied = $3,
           total_amount = $4
       WHERE id = $5
       RETURNING *`,
      [customer_id, cashier_by, discount_applied, total_amount, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({
      message: "Transaction updated successfully",
      data: result.rows[0],
    });
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
      security: [{ bearerAuth: [] }],   // ← DITAMBAHKAN DI SINI
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } }
      ],
      responses: { 200: { description: "Detail transaksi" } }
    },

    put: {
      summary: "Perbarui transaksi berdasarkan ID",
      tags: ["Transactions (cashier)"],
      security: [{ bearerAuth: [] }],   // ← DITAMBAHKAN DI SINI
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
