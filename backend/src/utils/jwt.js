const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev_secret_change_me';
}

function signJwt(payload, options = {}) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d', ...options });
}

function verifyJwt(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = { signJwt, verifyJwt };


