import Transaction from '../models/Transaction.js';

function handleError(err, res) {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid transaction data' });
  }
  return res.status(500).json({ message: 'Server error' });
}

export const createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({ ...req.body, user: req.user._id });
    res.status(201).json(transaction);
  } catch (err) { handleError(err, res); }
};

export const listTransactions = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (typeof req.query.type === 'string') filter.type = req.query.type;
    if (typeof req.query.category === 'string') filter.category = req.query.category.trim();
    res.json(await Transaction.find(filter).sort({ date: -1 }));
  } catch (err) { handleError(err, res); }
};

export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) { handleError(err, res); }
};

export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) { handleError(err, res); }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.status(200).json({ message: 'Transaction deleted' });
  } catch (err) { handleError(err, res); }
};

export const monthlySummary = async (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month ?? now.getUTCMonth() + 1;
    const year = req.query.year ?? now.getUTCFullYear();
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const byCategory = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lt: end } } },
      { $group: { _id: { category: '$category', type: '$type' }, total: { $sum: { $abs: '$amount' } }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const totals = byCategory.reduce((acc, row) => {
      acc[row._id.type] = (acc[row._id.type] || 0) + row.total;
      return acc;
    }, { income: 0, expense: 0 });

    res.json({
      month, year,
      totalIncome: totals.income,
      totalExpense: totals.expense,
      net: totals.income - totals.expense,
      byCategory: byCategory.map(row => ({ category: row._id.category, type: row._id.type, total: row.total, count: row.count }))
    });
  } catch (err) { handleError(err, res); }
};
