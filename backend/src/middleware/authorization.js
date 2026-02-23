const jwt = require("jsonwebtoken");
require("dotenv").config();

// ====== Verifikasi Token ======
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user; // simpan info user di request
    next();
  });
}

// ====== Verifikasi Admin ======
function verifyAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admin only" });
  }
  next();
}

module.exports = { verifyToken, verifyAdmin };
