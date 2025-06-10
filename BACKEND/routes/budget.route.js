const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budget.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// Apply authentication middleware to all budget routes
// router.use(authenticateUser);

// Get all budgets
router.get("/", verifyToken, budgetController.getBudgets);

// Create a new budget
router.post("/", verifyToken, budgetController.createBudget);

// Update a budget
router.put("/:category", verifyToken, budgetController.updateBudget);

// Delete a budget
router.delete("/:category", verifyToken, budgetController.deleteBudget);

// Get budget summary with current spending
router.get("/summary", verifyToken, budgetController.getBudgetSummary);

module.exports = router;
