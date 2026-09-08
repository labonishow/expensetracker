require("dotenv").config();

const SibApiV3Sdk = require("sib-api-v3-sdk");

// Brevo client setup
const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.MAIL_SERVICE_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sender = {
    email: "labonishowkrishnapur@gmail.com"
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const receivers = [
            {
                email: email
            }
        ];

        await tranEmailApi.sendTransacEmail({
            sender: sender,
            to: receivers,
            subject: "Password Reset Request - Expense Tracker",
            textContent:
                "Hi,\n\n" +
                "We received a request to reset your password for your Expense Tracker account.\n\n" +
                "This is a demo email confirming that your request was received.\n\n" +
                "If you did not request this, you can safely ignore this email."
        });
console.log(
    "Brevo API key loaded:",
    !!process.env.MAIL_SERVICE_API_KEY
);
        return res.status(200).json({
            success: true,
            message: "Password reset email sent. Please check your inbox."
        });

    } catch (err) {
    console.log("Forgot password error:");
    console.log("Message:", err.message);
    console.log("Response:", err.response?.body);
    console.log("Status:", err.response?.statusCode);
    console.log("Full error:", err);

    res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: err.message,
        brevoError: err.response?.body || null
    });
}
};

module.exports = {
    forgotPassword
};