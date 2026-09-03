require("dotenv").config();

const express = require("express");
const path = require("path");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");

const app = express();


app.use(express.json());

app.use("/users", authRoutes);

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