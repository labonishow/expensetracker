const jwt = require("jsonwebtoken");

const sequelize = require("../config/database");
const Expense = require("../models/expenseModel");
const User = require("../models/User");

const VIEWS = ["daily", "weekly", "monthly"];

// Groups expenses by day / week / month and totals them.
// No income concept in this schema, so income always stays 0.
function buildReport(expenses, view) {
    const groups = {};

    for (const exp of expenses) {
        const created = new Date(exp.createdAt);
        let key;

        if (view === "daily") {
            key = created.toISOString().slice(0, 10); // YYYY-MM-DD
        } else if (view === "weekly") {
            const start = new Date(created);
            const dayOfWeek = start.getDay() || 7; // Sun -> 7, so Monday starts the week
            start.setDate(start.getDate() - dayOfWeek + 1);
            key = "Week of " + start.toISOString().slice(0, 10);
        } else {
            key = created.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        }

        if (!groups[key]) {
            groups[key] = { label: key, income: 0, expense: 0 };
        }

        groups[key].expense += Number(exp.amount);
    }

    const groupList = Object.values(groups).sort((a, b) => (a.label < b.label ? 1 : -1));

    const totals = { income: 0, expense: 0 };
    groupList.forEach((g) => (totals.expense += g.expense));
    totals.savings = totals.income - totals.expense;

    return { groups: groupList, totals };
}

function toCsv(groups, totals) {
    const rows = [["Period", "Income", "Expense", "Savings"].join(",")];

    groups.forEach((g) => {
        rows.push([g.label, g.income.toFixed(2), g.expense.toFixed(2), (g.income - g.expense).toFixed(2)].join(","));
    });

    rows.push(["Total", totals.income.toFixed(2), totals.expense.toFixed(2), totals.savings.toFixed(2)].join(","));
    return rows.join("\n");
}

// Reads the user's expenses as one consistent snapshot.
async function fetchUserExpenses(userId) {
    return sequelize.transaction(async (t) => {
        return Expense.findAll({
            where: { userId },
            order: [["createdAt", "ASC"]],
            transaction: t
        });
    });
}


// GET /expense/report?view=daily|weekly|monthly (premium only)
const getReport = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: ["isPremium"] });

        if (!user?.isPremium) {
            return res.status(403).json({ success: false, message: "Reports are a premium feature" });
        }

        const view = VIEWS.includes(req.query.view) ? req.query.view : "daily";
        const expenses = await fetchUserExpenses(req.user.id);

        res.status(200).json(buildReport(expenses, view));

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to build report" });
    }
};


// GET /expense/report/export?view=...&token=... (premium only)
// Triggered by a plain browser navigation, so the token arrives as a
// query param instead of an Authorization header - verified here directly.
const exportReport = async (req, res) => {
    try {
        const { token, view: rawView } = req.query;

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.userId, { attributes: ["isPremium"] });

        if (!user?.isPremium) {
            return res.status(403).json({ success: false, message: "Reports are a premium feature" });
        }

        const view = VIEWS.includes(rawView) ? rawView : "daily";
        const expenses = await fetchUserExpenses(decoded.userId);
        const { groups, totals } = buildReport(expenses, view);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="expense-report-${view}.csv"`);
        res.status(200).send(toCsv(groups, totals));

    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};


module.exports = { getReport, exportReport };