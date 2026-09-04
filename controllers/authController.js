const User = require("../models/User");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }
    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(403).json({
        message: "User already exists",
      });
    }
    const salt = 10;

    bcrypt.hash(password, salt, async (err, hash) => {
      await User.create({
        name,
        email,
        password: hash,
      });

      return res.status(201).json({
        message: "User registered successfully",
      });
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findAll({
      where: {
        email: email,
      },
    });
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    bcrypt.compare(password, user[0].password, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Password comparison failed",
        });
      }

      if (!result) {
        return res.status(401).json({
          success: false,
          message: "User not authorized",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User login successful",
      });
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = {
  signup,
  login,
};
