const Category = require('../models/Category');

exports.listCategories = async (req, res) => {
  const categories = await Category.find({ $or: [{ owner: null }, { owner: req.user._id }] }).sort({ name: 1 });
  res.json(categories);
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create({ ...req.body, owner: req.user._id });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Category already exists' });
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Invalid category data' });
    res.status(500).json({ message: 'Server error' });
  }
};
