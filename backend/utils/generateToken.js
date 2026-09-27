import jwt from 'jsonwebtoken';

export function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith('replace-with-')) {
    throw new Error('Set JWT_SECRET to a random secret of at least 32 characters');
  }
  return secret;
}

export function generateToken(user) {
  return jwt.sign({}, getSecret(), {
    subject: String(user._id), expiresIn: '1h', algorithm: 'HS256'
  });
}
