const auth = require("./routes/auth");
const users = require("./routes/users");
const products = require("./routes/products");
const categories = require("./routes/categories");
const transactions = require("./routes/transactions");

module.exports = {
  openapi: "3.0.0",
  info: {
    title: "Toko Pakaian Online",
    version: "1.0.0",
    description:
      "Toko Pakaian Revan — mencakup autentikasi, user management, produk, kategori, dan transaksi."
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local Development Server"
    }
  ],
  paths: {
    ...auth.swaggerDocs,
    ...users.swaggerDocs,
    ...products.swaggerDocs,
    ...categories.swaggerDocs,
    ...transactions.swaggerDocs
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
};
