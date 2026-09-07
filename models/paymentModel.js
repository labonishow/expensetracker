
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define("Payment", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    paymentSessionId: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    orderAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    orderCurrency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "INR"
    },

    paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pending"
    }

});

module.exports = Payment;
