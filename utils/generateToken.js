const jwt = require('jsonwebtoken');

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith('replace-with-')) {
    throw new Error('Set JWT_SECRET to a random secret of at least 32 characters');
  }
  return secret;
}

function generateToken(user) {
  return jwt.sign({}, getSecret(), {
    subject: String(user._id), expiresIn: '1h', algorithm: 'HS256'
  });
}

module.exports = { generateToken, getSecret };
