const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

function publicUser(user) {
  return { _id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl };
}

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ name, email, password: hashed, role: 'user' });
    res.status(201).json({ token: generateToken(user), user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email is already registered' });
    throw err;
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: generateToken(user), user: publicUser(user) });
};

exports.profile = (req, res) => res.json({ user: publicUser(req.user) });
