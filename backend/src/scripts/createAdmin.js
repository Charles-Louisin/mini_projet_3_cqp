require('dotenv').config();
const { connectToDatabase } = require('../config/db');
const User = require('../models/User');
const { hashPassword } = require('../utils/password');

(async () => {
  try {
    await connectToDatabase();
    const name = process.argv[2] || 'Admin';
    const email = process.argv[3] || 'admin@example.com';
    const password = process.argv[4] || 'admin123';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin déjà existant:', email);
      process.exit(0);
    }
    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role: 'admin' });
    console.log('Admin créé:', user.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();


