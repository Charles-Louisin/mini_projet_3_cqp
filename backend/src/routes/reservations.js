const { Router } = require('express');
const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const Loan = require('../models/Loan');
const { authRequired, requireRole } = require('../middleware/auth');

const router = Router();

// Create reservation for an unavailable book
router.post('/', authRequired, async (req, res, next) => {
  try {
    const { bookId, days = 3 } = req.body || {};
    if (!bookId) return res.status(400).json({ message: 'bookId requis' });
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    if (book.availableCopies > 0) return res.status(409).json({ message: 'Livre disponible, inutile de réserver' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Math.max(parseInt(days, 10) || 3, 1));

    const reservation = await Reservation.create({ user: req.user.id, book: book._id, expiresAt });
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
});

// Cancel reservation
router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Réservation introuvable' });
    if (String(reservation.user) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await reservation.deleteOne();
    res.json({ message: 'Réservation annulée' });
  } catch (err) {
    next(err);
  }
});

// My reservations
router.get('/me', authRequired, async (req, res, next) => {
  try {
    const items = await Reservation.find({ user: req.user.id }).populate('book').sort({ createdAt: -1 }).lean();
    // Calculer prochaine date de retour approchante pour chaque livre réservé
    const bookIds = [...new Set(items.map(i => String(i.book?._id)).filter(Boolean))];
    const loans = await Loan.aggregate([
      { $match: { book: { $in: bookIds.map(id => new (require('mongoose').Types.ObjectId)(id)) }, returnedAt: null } },
      { $group: { _id: '$book', nextDue: { $min: '$dueAt' } } },
    ]);
    const bookIdToNextDue = new Map(loans.map(l => [String(l._id), l.nextDue]));
    const withNextDue = items.map(i => ({ ...i, nextDueAt: bookIdToNextDue.get(String(i.book?._id)) || null }));
    res.json(withNextDue);
  } catch (err) {
    next(err);
  }
});

// Admin: list all reservations
router.get('/', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const items = await Reservation.find().populate('book user').sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


