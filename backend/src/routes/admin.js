const { Router } = require('express');
const { requireRole, authRequired } = require('../middleware/auth');
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');

const router = Router();

router.get('/stats', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const [users, books, loans, activeLoans, overdueLoans] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Loan.countDocuments(),
      Loan.countDocuments({ returnedAt: null }),
      Loan.countDocuments({ returnedAt: null, dueAt: { $lt: new Date() } }),
    ]);
    res.json({ users, books, loans, activeLoans, overdueLoans });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

// Extra admin endpoints
router.get('/users', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('name email role createdAt').lean();
    res.json(users);
  } catch (e) { next(e); }
});

router.get('/users/:id/stats', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const [borrowed, reserved] = await Promise.all([
      Loan.countDocuments({ user: req.params.id, returnedAt: null }),
      require('../models/Reservation').countDocuments({ user: req.params.id }),
    ]);
    res.json({ borrowed, reserved });
  } catch (e) { next(e); }
});

router.get('/users/:id/history', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const [loans, reservations] = await Promise.all([
      Loan.find({ user: req.params.id }).populate('book').sort({ createdAt: -1 }).lean(),
      require('../models/Reservation').find({ user: req.params.id }).populate('book').sort({ createdAt: -1 }).lean(),
    ]);
    res.json({ loans, reservations });
  } catch (e) { next(e); }
});

router.put('/loans/:id', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Emprunt introuvable' });
    const allowed = ['dueAt', 'returnedAt'];
    for (const k of allowed) if (req.body[k] !== undefined) loan[k] = req.body[k];
    await loan.save();
    res.json(loan);
  } catch (e) { next(e); }
});


