const Expense = require("../models/expense.model");

// Get all expenses for a user with optional date range filtering
exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user.id };

    // Add date range filtering if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res
      .status(500)
      .json({ message: "Error fetching expenses", error: error.message });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    res
      .status(500)
      .json({ message: "Error fetching expense", error: error.message });
  }
};

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;

    const newExpense = new Expense({
      description,
      amount,
      category,
      date: date || new Date(),
      userId: req.user.id,
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error("Error creating expense:", error);
    res
      .status(500)
      .json({ message: "Error creating expense", error: error.message });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { description, amount, category, date },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res
      .status(500)
      .json({ message: "Error updating expense", error: error.message });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res
      .status(500)
      .json({ message: "Error deleting expense", error: error.message });
  }
};

// Get expense summary by category
exports.getExpenseSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { userId: req.user.id };

    // Add date range filtering if provided
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const summary = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          totalAmount: 1,
          count: 1,
          _id: 0,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error generating expense summary:", error);
    res.status(500).json({
      message: "Error generating expense summary",
      error: error.message,
    });
  }
};
