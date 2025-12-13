const express = require("express");
const router = express.Router();
const UserFinance = require("../models/UserFinance");
const User = require("../models/User");

// CREATE or UPDATE finance
router.post("/", async (req, res) => {
  try {
    const { userId, incomes, expenses } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const totalIncome = incomes.reduce((s, i) => s + Number(i.amount || 0), 0);
    const totalExpense = expenses.reduce(
      (s, i) => s + Number(i.amount || 0),
      0
    );
    const balance = totalIncome - totalExpense;

    let financeData = await UserFinance.findOne({ userId });

    if (financeData) {
      financeData.incomes = incomes;
      financeData.expenses = expenses;
      financeData.totalIncome = totalIncome;
      financeData.totalExpense = totalExpense;
      financeData.balance = balance;

      await financeData.save();

      await User.findByIdAndUpdate(userId, {
        onboardingStep: "aadhaar",
      });

      return res.json({
        message: "Finance updated successfully",
      });
    }

    await UserFinance.create({
      userId,
      incomes,
      expenses,
      totalIncome,
      totalExpense,
      balance,
    });

    res.json({
      message: "Finance data saved successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET finance by userId
router.get("/:userId", async (req, res) => {
  try {
    const data = await UserFinance.findOne({ userId: req.params.userId });
    if (!data) return res.json(null);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
