const { Router } = require('express');
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const Reservation = require('../models/Reservation');
const { authRequired, requireRole } = require('../middleware/auth');
const { getLoanDurationDays, addDays, calculateFineXof } = require('../utils/fines');

const router = Router();

// Create a new loan (borrow a book)
router.post('/', authRequired, async (req, res, next) => {
  try {
    const { bookId, dueAt } = req.body || {};
    if (!bookId) return res.status(400).json({ message: 'bookId requis' });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });

    if (book.availableCopies <= 0) {
      return res.status(409).json({ message: 'Livre indisponible' });
    }

    const parsedDue = dueAt ? new Date(dueAt) : addDays(new Date(), getLoanDurationDays());
    if (Number.isNaN(parsedDue.getTime()) || parsedDue <= new Date()) {
      return res.status(400).json({ message: "Date d'échéance invalide" });
    }
    const loan = await Loan.create({ user: req.user.id, book: book._id, dueAt: parsedDue });
    book.availableCopies -= 1;
    await book.save();
    res.status(201).json(loan);
  } catch (err) {
    next(err);
  }
});

// Return a loan (and compute fine)
router.post('/:id/return', authRequired, async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('book');
    if (!loan) return res.status(404).json({ message: 'Emprunt introuvable' });
    if (String(loan.user) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (loan.returnedAt) return res.status(409).json({ message: 'Déjà retourné' });

    const now = new Date();
    const fineXof = calculateFineXof(loan.dueAt, now);
    loan.returnedAt = now;
    loan.fineXof = fineXof;
    await loan.save();

    // increment availability
    const book = await Book.findById(loan.book._id);
    book.availableCopies += 1;
    await book.save();

    res.json(loan);
  } catch (err) {
    next(err);
  }
});

// My loans
router.get('/me', authRequired, async (req, res, next) => {
  try {
    const loans = await Loan.find({ user: req.user.id }).populate('book').sort({ createdAt: -1 }).lean();
    res.json(loans);
  } catch (err) {
    next(err);
  }
});

// Admin: all loans, filter by overdue
router.get('/', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const { overdue } = req.query;
    const filter = {};
    if (overdue === 'true') {
      filter.returnedAt = null;
      filter.dueAt = { $lt: new Date() };
    }
    const loans = await Loan.find(filter).populate('book user').sort({ createdAt: -1 }).lean();
    res.json(loans);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


