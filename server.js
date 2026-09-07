require("dotenv").config();


require("./models/associations");

const express = require("express");
const path = require("path");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expressRoutes")
const paymentRoutes = require("./routes/paymentRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes")

const app = express();


app.use(express.json());

app.use("/users", authRoutes);
app.use("/expense", expenseRoutes);
app.use("/payment", paymentRoutes);
app.use("/premium", leaderboardRoutes);


app.use(
  express.static(path.join(__dirname, "public", "pages", "expense"))
);

app.use(
  express.static(path.join(__dirname, "public", "pages", "signup"))
);

const PORT = 3000;
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await sequelize.sync();
    console.log("Database synchronized");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
};

startServer();