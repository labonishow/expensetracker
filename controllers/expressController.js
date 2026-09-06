const Expense = require("../models/expenseModel");



const createExpense = async (req, res) => {
    try {
        const { amount, description, category } = req.body;

        const expense = await Expense.create({
            amount,
            description,
            category,
            userId: req.user.id
        });

        res.status(201).json({
            success: true,
            message: "Expense added successfully",
            expense
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to add expense",
            error: error.message
        });
    }
};



const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: {
                userId: req.user.id
            }
        });

        res.status(200).json({
            success: true,
            expenses
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch expenses",
            error: error.message
        });
    }
};



const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findOne({
            where: {
                id: id,
                userId: req.user.id
            }
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        await expense.destroy();

        res.status(200).json({
            success: true,
            message: "Expense deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete expense",
            error: error.message
        });
    }
};


module.exports = {
    createExpense,
    getExpenses,
    deleteExpense
};