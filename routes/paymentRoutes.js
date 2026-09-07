const express = require('express');
const router = express.Router();
const { getPaymentPage, processPayment, getPaymentStatus } = require('../controllers/paymentController');

router.get('/', getPaymentPage);
router.post('/pay', processPayment);
router.get('/status/:orderId', getPaymentStatus);

module.exports = router;
