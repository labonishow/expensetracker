const express = require("express");

const router = express.Router();

const {
createExpense,
getExpenses,
deleteExpense
} = require("../controllers/expressController");

const {
getReport,
exportReport
} = require("../controllers/reportController");

const Middleware = require("../middleware/authMiddleware");

// Must come before "/:id" style routes so "report" isn't parsed as an id.
router.get("/report", Middleware.authMiddleware, getReport);

// No authMiddleware here - this is a plain browser navigation
// (window.location.href), so the token arrives as ?token=... instead of
// an Authorization header. exportReport verifies it itself.
router.get("/report/export", exportReport);



router.post("/", Middleware.authMiddleware, createExpense);


router.get("/", Middleware.authMiddleware, getExpenses);


router.delete("/:id", Middleware.authMiddleware, deleteExpense);

module.exports = router;