const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
require("dotenv").config();

// ===== Fungsi Buat Token =====
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// ===== REGISTER =====
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, name, role = 'customer', membership = true } = req.body;

    // Validasi input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, dan password harus diisi" });
    }

    // Cek username/email
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE username=$1 OR email=$2",
      [username, email]
    );
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "Username atau email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const displayName = name || username; // Jika name tidak dikirim, gunakan username

    const newUser = await pool.query(
      `INSERT INTO users (name, username, email, password, role, membership)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, username, email, role, membership`,
      [displayName, username, email, hashedPassword, role, membership]
    );

    res.json({ message: "Registrasi berhasil", user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== LOGIN =====
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // allow login by username or email
    const result = await pool.query("SELECT * FROM users WHERE username=$1 OR email=$1", [username]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: "User not found" });

    // CEK USER DINONAKTIFKAN
    if (!user.membership) {
      return res.status(403).json({ error: "Akun Anda telah dinonaktifkan." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await pool.query(
      `INSERT INTO tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );

    const { password: _, ...userData } = user;

    res.json({
      message: "Login Berhasil",
      user: userData,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== REFRESH TOKEN =====
router.post("/token", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const tokenCheck = await pool.query("SELECT * FROM tokens WHERE token=$1", [refreshToken]);
    if (tokenCheck.rowCount === 0) return res.status(403).json({ error: "Invalid token" });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid or expired token" });

      const userResult = await pool.query("SELECT * FROM users WHERE id=$1", [decoded.id]);
      const currentUser = userResult.rows[0];

      // CEK USER DINONAKTIFKAN
      if (!currentUser || !currentUser.membership) {
        return res.status(403).json({ error: "Akun Anda telah dinonaktifkan." });
      }

      const accessToken = generateAccessToken(currentUser);
      res.json({ accessToken });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== LOGOUT =====
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "No refresh token" });

  try {
    await pool.query("DELETE FROM tokens WHERE token=$1", [refreshToken]);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// ===== Swagger Docs =====
module.exports.swaggerDocs = {
  "/auth/register": {
    post: {
      summary: "Register user baru",
      tags: ["Authentication"],
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
      responses: {
        200: { description: "User registered successfully" },
        400: { description: "Username or email already exists" }
      }
    }
  },
  "/auth/login": {
    post: {
      summary: "Login user dan dapatkan token JWT",
      tags: ["Authentication"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                username: { type: "string" },
                password: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Login berhasil dan token diberikan" },
        401: { description: "Password salah" },
        400: { description: "User tidak ditemukan" },
        403: { description: "Akun dinonaktifkan" }
      }
    }
  },
  "/auth/token": {
    post: {
      summary: "Perbarui access token menggunakan refresh token",
      tags: ["Authentication"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { refreshToken: { type: "string" } }
            }
          }
        }
      },
      responses: {
        200: { description: "Token diperbarui" },
        403: { description: "Akun dinonaktifkan / token invalid" }
      }
    }
  },
  "/auth/logout": {
    post: {
      summary: "Logout user dan hapus refresh token",
      tags: ["Authentication"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { refreshToken: { type: "string" } }
            }
          }
        }
      },
      responses: { 200: { description: "Logout berhasil" } }
    }
  }
};
