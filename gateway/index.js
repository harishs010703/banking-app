// /gateway/index.js

require("dotenv").config();

const express = require("express");
const app = express();

const { sequelize } = require("../shared/config/db");

// -------------------------------
// 🔹 Import ALL models (IMPORTANT)
// -------------------------------
require("../services/user-service/models/user.model");
require("../services/account-service/models/account.model");
require("../services/auth-service/models/session.model");
require("../services/audit-service/models/auditLog.model");
<<<<<<< HEAD
const {
  authenticateToken,
} = require("../shared/middlewares/authMiddleware");

// Routes
const authRoutes = require("./Routes/auth.routes");
const userRoutes = require("./Routes/user.routes");
const accountRoutes = require(
  "../services/account-service/routes/account.routes"
);
const cookieParser = require("cookie-parser");
// Middleware
=======
require("../services/transaction-service/models/transaction.model"); 

// -------------------------------
// Import Routes
// -------------------------------
const authRoutes = require("./routes/auth.routes"); 
const transactionRoutes = require("../services/transaction-service/routes/transaction.routes"); 
// -------------------------------
// Global Middleware
// -------------------------------
>>>>>>> 118bfad (Added new feature / changes)
app.use(express.json());
app.use(cookieParser());


// -------------------------------
// API Gateway Routes
// -------------------------------
app.use("/auth", authRoutes);
<<<<<<< HEAD
app.use("/user", authenticateToken , userRoutes);
app.use(
  "/accounts",
  authenticateToken,
  accountRoutes
);
=======
app.use("/transactions", transactionRoutes); 
>>>>>>> 118bfad (Added new feature / changes)

// -------------------------------
// Health Check Route
// -------------------------------
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Banking API Gateway running ",
  });
});

// -------------------------------
// Database Sync (DEV ONLY)
// -------------------------------
sequelize
  .sync({ alter: true }) //  use migrations in production
  .then(() => {
    console.log("Database tables synced successfully.");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Gateway running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database sync failed:", error);
  });