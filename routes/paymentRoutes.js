const express = require('express');
const router = express.Router();
const {
    getPaymentPage,
    processPayment,
    getPaymentStatus,
    getPremiumStatus
} = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', getPaymentPage);

// These need to know WHO is paying / checking status, so they require a
// logged-in user (same JWT-based middleware used by expense routes).
router.post('/pay', authMiddleware, processPayment);
router.get('/status/:orderId', authMiddleware, getPaymentStatus);
router.get('/premium-status', authMiddleware, getPremiumStatus);

module.exports = router;