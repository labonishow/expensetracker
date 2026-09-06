const express = require("express");

const router = express.Router();

const {
createExpense,
getExpenses,
deleteExpense
} = require("../controllers/expressController");

const Middleware = require("../middleware/authMiddleware");





router.post("/", Middleware.authMiddleware, createExpense);


router.get("/", Middleware.authMiddleware, getExpenses);


router.delete("/:id", Middleware.authMiddleware, deleteExpense);

module.exports = router;
