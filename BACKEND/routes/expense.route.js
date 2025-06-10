const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// Apply authentication middleware to all expense routes
// router.use(authenticateUser);

// Get all expenses with optional filtering
router.get("/", verifyToken, expenseController.getExpenses);

// Get a specific expense by ID
router.get("/:id", verifyToken, expenseController.getExpenseById);

// Create a new expense
router.post("/", verifyToken, expenseController.createExpense);

// Update an expense
router.put("/:id", verifyToken, expenseController.updateExpense);

// Delete an expense
router.delete("/:id", verifyToken, expenseController.deleteExpense);

// Get expense summary by category
router.get(
  "/summary/categories",
  verifyToken,
  expenseController.getExpenseSummary
);

module.exports = router;
