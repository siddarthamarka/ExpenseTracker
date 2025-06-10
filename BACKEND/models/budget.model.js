const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BudgetSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "food",
        "transportation",
        "housing",
        "utilities",
        "entertainment",
        "healthcare",
        "education",
        "shopping",
        "travel",
        "other",
      ],
    
    },
    amount: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Composite index to ensure uniqueness of category per user
BudgetSchema.index({ category: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Budget", BudgetSchema);
