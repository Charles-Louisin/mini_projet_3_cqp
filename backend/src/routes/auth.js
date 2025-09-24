const { Router } = require('express');
const User = require('../models/User');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signJwt } = require('../utils/jwt');
const { authRequired } = require('../middleware/auth');

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email déjà utilisé' });

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash });
    const token = signJwt({ sub: String(user._id), role: user.role });
    return res.status(201).json({
      token,
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Identifiants invalides' });
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Identifiants invalides' });
    const token = signJwt({ sub: String(user._id), role: user.role });
    return res.json({
      token,
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authRequired, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;


