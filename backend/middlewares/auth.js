import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { getSecret } from '../utils/generateToken.js';

export const protect = async (req, res, next) => {
  const match = /^Bearer ([^\s]+)$/i.exec(req.get('Authorization') || '');
  if (!match) return res.status(401).json({ message: 'A Bearer token is required' });
  const secret = getSecret();
  let payload;
  try {
    payload = jwt.verify(match[1], secret, { algorithms: ['HS256'] });
    if (typeof payload.sub !== 'string' || !mongoose.isObjectIdOrHexString(payload.sub)) throw new Error('Invalid subject');
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ message: 'User no longer exists' });
  req.user = user;
  next();
};
