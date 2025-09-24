const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = 10;

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

module.exports = { hashPassword, verifyPassword };


