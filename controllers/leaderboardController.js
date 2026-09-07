const { fn, col } = require('sequelize');
const Expense = require('../models/expenseModel');
const User = require('../models/User');

exports.showLeaderboard = async (req, res) => {
  try {
    const totals = await Expense.findAll({
      attributes: [
        'userId',
        [fn('SUM', col('amount')), 'totalExpense'],
        [fn('COUNT', col('id')), 'expenseCount'],
      ],
      group: ['userId'],
      order: [[fn('SUM', col('amount')), 'DESC']],
      raw: true,
    });

    if (totals.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    
    const userIds = totals.map((row) => row.userId);
    const users = await User.findAll({
      where: { id: userIds }, 
      attributes: ['id', 'name'],
      raw: true,
    });
    const nameById = new Map(users.map((u) => [u.id, u.name]));

    
    const formatted = totals.map((row) => ({
      userId: row.userId,
      name: nameById.get(row.userId) || 'Unknown user',
      totalExpense: parseFloat(row.totalExpense) || 0,
      expenseCount: parseInt(row.expenseCount, 10) || 0,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
    });
  }
};