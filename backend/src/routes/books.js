const { Router } = require('express');
const Book = require('../models/Book');
const Loan = require('../models/Loan');
const multer = require('multer');
const upload = multer();
const { authRequired, requireRole } = require('../middleware/auth');

const router = Router();

// Public: list with search and pagination
router.get('/', async (req, res, next) => {
  try {
    const { query, author, genre, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const filter = {};
    if (author) filter.author = new RegExp(author, 'i');
    if (genre) filter.genre = new RegExp(genre, 'i');
    if (query) {
      // Prefer $text when index exists; fallback to OR conditions
      filter.$or = [
        { title: new RegExp(query, 'i') },
        { author: new RegExp(query, 'i') },
        { genre: new RegExp(query, 'i') },
        { isbn: new RegExp(query, 'i') },
      ];
    }

    const [items, total] = await Promise.all([
      Book.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Book.countDocuments(filter),
    ]);

    res.json({
      items,
      page: pageNum,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

// Public: detail by id
router.get('/:id', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.json(book);
  } catch (err) {
    next(err);
  }
});

// Admin: create
router.post('/', authRequired, requireRole('admin'), upload.single('cover'), async (req, res, next) => {
  try {
    const { title, author, isbn, genre, summary, coverUrl, totalCopies } = req.body || {};
    if (!title || !author || !isbn || totalCopies == null) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }
    const exists = await Book.findOne({ isbn });
    if (exists) return res.status(409).json({ message: 'ISBN déjà existant' });
    const availableCopies = Math.max(Number(totalCopies) || 0, 0);
    const bookData = {
      title,
      author,
      isbn,
      genre: genre || '',
      summary: summary || '',
      coverUrl: coverUrl || '',
      totalCopies: availableCopies,
      availableCopies,
      createdBy: req.user.id,
    };
    if (req.file) {
      bookData.coverImage = { data: req.file.buffer, contentType: req.file.mimetype };
    }
    const book = await Book.create(bookData);
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
});

// Admin: update
router.put('/:id', authRequired, requireRole('admin'), upload.single('cover'), async (req, res, next) => {
  try {
    const updates = {};
    const allowed = ['title', 'author', 'isbn', 'genre', 'summary', 'coverUrl', 'totalCopies'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (req.file) {
      updates.coverImage = { data: req.file.buffer, contentType: req.file.mimetype };
    }

    if (updates.totalCopies != null) {
      updates.totalCopies = Math.max(Number(updates.totalCopies) || 0, 0);
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });

    // Adjust availableCopies if totalCopies decreased below current available
    if (updates.totalCopies != null) {
      const activeLoans = await Loan.countDocuments({ book: book._id, returnedAt: null });
      const newTotal = updates.totalCopies;
      const newAvailable = Math.max(newTotal - activeLoans, 0);
      book.availableCopies = newAvailable;
    }

    Object.assign(book, updates);
    await book.save();
    res.json(book);
  } catch (err) {
    next(err);
  }
});

// Serve book cover
router.get('/:id/cover', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book || !book.coverImage || !book.coverImage.data) return res.status(404).end();
    res.setHeader('Content-Type', book.coverImage.contentType || 'application/octet-stream');
    return res.send(Buffer.from(book.coverImage.data.buffer));
  } catch (e) { next(e); }
});

// Admin: delete
router.delete('/:id', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Livre introuvable' });
    res.json({ message: 'Livre supprimé' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


