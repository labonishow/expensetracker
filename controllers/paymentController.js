const path = require("path");

const Payment = require("../models/paymentModel");

const {
    createOrder,
    getPaymentStatus
} = require("../services/cashfreeService");


exports.getPaymentPage = (req, res) => {
    res.sendFile(
        path.join(__dirname, "../public/pages/payment/index.html")
    );
};


exports.processPayment = async (req, res) => {

    const orderId = "ORDER-" + Date.now();
    const orderAmount = 2000;
    const orderCurrency = "INR";
    const customerID = "1";
    const customerPhone = "9999999999";

    try {

        // Create order in Cashfree
        const paymentSessionId = await createOrder(
            orderId,
            orderAmount,
            orderCurrency,
            customerID,
            customerPhone
        );

        // Save payment details in database
        await Payment.create({
            orderId,
            paymentSessionId,
            orderAmount,
            orderCurrency,
            paymentStatus: "Pending"
        });

        res.json({
            paymentSessionId,
            orderId
        });

    } catch (error) {

        console.error(
            "Error processing payment:",
            error.message
        );

        res.status(500).json({
            error: error.message
        });
    }
};



exports.getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Get payment status from Cashfree
        const orderData = await getPaymentStatus(orderId);

        // Get calculated payment status
        const orderStatus = orderData.orderStatus;

        // Update payment status in database
        await Payment.update(
            {
                paymentStatus: orderStatus
            },
            {
                where: {
                    orderId: orderId
                }
            }
        );

        // Send response
        res.json({
            success: true,
            orderId: orderId,
            orderStatus: orderStatus,
            orderData: orderData.data
        });

    } catch (error) {
        console.error(
            "Error getting payment status:",
            error.message
        );

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

