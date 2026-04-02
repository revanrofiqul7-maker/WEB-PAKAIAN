const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const supabase = require("../db/supabase");
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

    // Cek username/email di Supabase
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${email}`);

    if (checkError) throw checkError;
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: "Username atau email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const displayName = name || username;

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        name: displayName,
        username,
        email,
        password: hashedPassword,
        role,
        membership: membership ? new Date() : null
      }])
      .select('id, name, username, email, role, membership');

    if (insertError) throw insertError;

    res.json({ message: "Registrasi berhasil", user: newUser[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== LOGIN =====
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cari user berdasarkan username atau email di Supabase
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${username}`);

    if (selectError) throw selectError;
    if (!users || users.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = users[0];

    // CEK USER DINONAKTIFKAN
    if (!user.membership) {
      return res.status(403).json({ error: "Akun Anda telah dinonaktifkan." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Simpan refresh token di Supabase
    const { error: tokenError } = await supabase
      .from('tokens')
      .insert([{
        user_id: user.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }]);

    if (tokenError) throw tokenError;

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
    // Cek token di Supabase
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('token', refreshToken);

    if (tokenError) throw tokenError;
    if (!tokenData || tokenData.length === 0) {
      return res.status(403).json({ error: "Invalid token" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid or expired token" });

      // Ambil user data dari Supabase
      const { data: currentUserArray, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id);

      if (userError) throw userError;
      if (!currentUserArray || currentUserArray.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const currentUser = currentUserArray[0];

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
    const { error: deleteError } = await supabase
      .from('tokens')
      .delete()
      .eq('token', refreshToken);

    if (deleteError) throw deleteError;
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
              properties: {
                refreshToken: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Access token baru diberikan" },
        403: { description: "Invalid or expired token" }
      }
    }
  },
  "/auth/logout": {
    post: {
      summary: "Logout user",
      tags: ["Authentication"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                refreshToken: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Logged out successfully" }
      }
    }
  }
};
