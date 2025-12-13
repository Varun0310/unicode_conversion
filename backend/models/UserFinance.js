const mongoose = require('mongoose');

const UserFinanceSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  incomes: [
    {
      source: String, // example: job, freelance
      amount: Number,
    },
  ],

  expenses: [
    {
      title: String, // example: food, travel
      amount: Number,
    },
  ],

  totalIncome: Number,
  totalExpense: Number,
  balance: Number, // remaining balance
});

module.exports = mongoose.model('UserFinance', UserFinanceSchema);
