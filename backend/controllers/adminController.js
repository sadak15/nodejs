import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const overview = async (req, res) => {
  const [totalUsers, topCategories] = await Promise.all([
    User.countDocuments(),
    Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: { $abs: '$amount' } }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ])
  ]);
  res.json({
    totalUsers,
    topSpendingCategories: topCategories.map(row => ({ category: row._id, total: row.total, count: row.count }))
  });
};
