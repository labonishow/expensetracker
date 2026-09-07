const User = require("./User");
const Expense = require("./expenseModel");
const Payment = require("./paymentModel");


// User → Expense

User.hasMany(Expense, {
    foreignKey: "userId"
});

Expense.belongsTo(User, {
    foreignKey: "userId"
});


// User → Payment

User.hasMany(Payment, {
    foreignKey: "userId"
});

Payment.belongsTo(User, {
    foreignKey: "userId"
});


module.exports = {
    User,
    Expense,
    Payment
};