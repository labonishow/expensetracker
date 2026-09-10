const express = require("express");

const router = express.Router();

const {
  createExpense,
  getExpenses,
  deleteExpense,
} = require("../controllers/expressController");

const { getReport, exportReport } = require("../controllers/reportController");

const Middleware = require("../middleware/authMiddleware");

router.get("/report", Middleware.authMiddleware, getReport);

router.get("/report/export", exportReport);

router.post("/", Middleware.authMiddleware, createExpense);

router.get("/", Middleware.authMiddleware, getExpenses);

router.delete("/:id", Middleware.authMiddleware, deleteExpense);

module.exports = router;
