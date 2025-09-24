const { Schema, model, Types } = require('mongoose');

const bookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    genre: { type: String, index: true, trim: true },
    summary: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    coverImage: {
      data: Buffer,
      contentType: String,
    },
    totalCopies: { type: Number, required: true, min: 0 },
    availableCopies: { type: Number, required: true, min: 0 },
    createdBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', genre: 'text', isbn: 'text' });

module.exports = model('Book', bookSchema);


