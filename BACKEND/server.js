const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRouter = require("./routes/auth.route");
const expenseRouter = require("./routes/expense.route");
const budgetRouter = require("./routes/budget.route");
const app = express();

dotenv.config();

app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connected To MongoDB");
  })
  .catch((err) => {
    console.log("DB Disconnected");
  });

// Import auth middleware
const { authMiddleware } = require("./middleware/auth.middleware");

// Auth routes (no middleware needed)
app.use("/api/auth", authRouter);

// Protected routes (need authentication)
// app.use("/api/dashboard", authMiddleware, dashboardRouter);
app.use("/api/expense", authMiddleware, expenseRouter);
app.use("/api/budget", authMiddleware, budgetRouter);

const port = process.env.PORT || 11000;

app.listen(port, () => {
  console.log(`Server is Running on port ${port}`);
});
