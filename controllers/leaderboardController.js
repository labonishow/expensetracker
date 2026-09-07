const User = require("../models/User");

exports.showLeaderboard = async (req, res) => {
  try {

    const leaderboard = await User.findAll({
      attributes: [
        "id",
        "name",
        "totalExpense"
      ],

      order: [
        ["totalExpense", "DESC"]
      ],

      raw: true
    });

    console.log("Leaderboard:", leaderboard);

    return res.status(200).json({
      success: true,
      data: leaderboard
    });

  } catch (error) {

    console.error("Error fetching leaderboard:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
      error: error.message
    });
  }
};