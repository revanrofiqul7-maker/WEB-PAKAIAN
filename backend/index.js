const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require('./src/routes/users');
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const categoryRoutes = require('./src/routes/categories');
const transactionRoutes = require('./src/routes/transactions');

// Gunakan routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/transactions', transactionRoutes);

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./src/swagger");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}/api-docs`);
});
