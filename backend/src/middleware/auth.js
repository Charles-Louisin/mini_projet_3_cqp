const { verifyJwt } = require('../utils/jwt');
const User = require('../models/User');

async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = verifyJwt(token);
    const user = await User.findById(decoded.sub).lean();
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = { id: String(user._id), role: user.role, name: user.name, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = { authRequired, requireRole };


