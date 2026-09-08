const express = require("express");
const router = express.Router();

const { getCategorySuggestion } = require("../controllers/aiController");
const Middleware = require("../middleware/authMiddleware");

router.post("/suggest-category", Middleware.authMiddleware, getCategorySuggestion);

module.exports = router;