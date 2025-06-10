const Budget = require("../models/budget.model");
const Expense = require("../models/expense.model");

// Get all budgets for a user
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.status(200).json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res
      .status(500)
      .json({ message: "Error fetching budgets", error: error.message });
  }
};

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    console.log("budget");
    console.log(req.body);
    
    
    const { category, amount } = req.body;
console.log("test1");
    // Check if budget for this category already exists
    const existingBudget = await Budget.findOne({
      category,
      userId: req.user.id,
    });
console.log("test1");
    if (existingBudget) {
      return res.status(400).json({
        message: "Budget for this category already exists. Use update instead.",
      });
    }
console.log("test1");
    const newBudget = new Budget({
      category,
      amount,
      userId: req.user.id,
    });
console.log("test1");
    const savedBudget = await newBudget.save();
    res.status(201).json(savedBudget);
    console.log("test1");
  } catch (error) {
    console.error("Error creating budget:", error);
    res
      .status(500)
      .json({ message: "Error creating budget", error: error.message });
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  try {
    const { amount } = req.body;

    const updatedBudget = await Budget.findOneAndUpdate(
      { category: req.params.category, userId: req.user.id },
      { amount },
      { new: true, runValidators: true }
    );

    if (!updatedBudget) {
      return res
        .status(404)
        .json({ message: "Budget not found for this category" });
    }

    res.status(200).json(updatedBudget);
  } catch (error) {
    console.error("Error updating budget:", error);
    res
      .status(500)
      .json({ message: "Error updating budget", error: error.message });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const deletedBudget = await Budget.findOneAndDelete({
      category: req.params.category,
      userId: req.user.id,
    });

    if (!deletedBudget) {
      return res
        .status(404)
        .json({ message: "Budget not found for this category" });
    }

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res
      .status(500)
      .json({ message: "Error deleting budget", error: error.message });
  }
};

// Get budget summary with current spending
exports.getBudgetSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { userId: req.user.id };

    // Add date range filtering if provided
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    // Get current spending by category
    const expenseSummary = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
        },
      },
    ]);

    // Convert to a map for easy lookup
    const spendingByCategory = {};
    expenseSummary.forEach((item) => {
      spendingByCategory[item._id] = item.spent;
    });

    // Get all budgets
    const budgets = await Budget.find({ userId: req.user.id });

    // Combine budget with spending data
    const budgetSummary = budgets.map((budget) => {
      const spent = spendingByCategory[budget.category] || 0;
      const remaining = budget.amount - spent;
      const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        category: budget.category,
        budgeted: budget.amount,
        spent,
        remaining,
        percentUsed: Math.min(percentUsed, 100).toFixed(2),
      };
    });

    res.status(200).json(budgetSummary);
  } catch (error) {
    console.error("Error generating budget summary:", error);
    res.status(500).json({
      message: "Error generating budget summary",
      error: error.message,
    });
  }
};
