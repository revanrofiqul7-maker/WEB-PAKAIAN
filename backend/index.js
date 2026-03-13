const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const app = express();
// always use port 5000 so frontend can reach backend without extra setup
const PORT = 5000;

// ensure upload directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
// expose uploaded images under /uploads
app.use('/uploads', express.static(uploadDir));

// Import routes
const userRoutes = require('./src/routes/users');
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const categoryRoutes = require('./src/routes/categories');
const transactionRoutes = require('./src/routes/transactions');

// Gunakan routes dengan /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./src/swagger");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
});
