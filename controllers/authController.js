const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

function publicUser(user) {
  return { _id: user._id, name: user.name, email: user.email, role: user.role };
}

function credentials(body) {
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') return null;
  const email = body.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (!body.password.length || Buffer.byteLength(body.password, 'utf8') > 72) return null;
  return { email, password: body.password };
}

exports.register = async (req, res) => {
  const data = credentials(req.body);
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!data || data.password.length < 6 || !name || name.length > 100) {
    return res.status(400).json({ message: 'Provide a name (1–100 characters), valid email, and password (at least 6 characters, at most 72 bytes)' });
  }
  if (req.body.role !== undefined && req.body.role !== 'user') {
    return res.status(400).json({ message: 'Public registration only permits the user role' });
  }
  const password = await bcrypt.hash(data.password, 12);
  try {
    const user = await User.create({ name, email: data.email, password, role: 'user' });
    res.status(201).json({ token: generateToken(user), user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email is already registered' });
    throw err;
  }
};

exports.login = async (req, res) => {
  const data = credentials(req.body);
  if (!data) return res.status(400).json({ message: 'Provide a valid email and password' });
  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user || !await bcrypt.compare(data.password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: generateToken(user), user: publicUser(user) });
};

exports.profile = (req, res) => res.json({ user: publicUser(req.user) });
