const { Schema, model, Types } = require('mongoose');

const loanSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    book: { type: Types.ObjectId, ref: 'Book', required: true, index: true },
    borrowedAt: { type: Date, default: Date.now },
    dueAt: { type: Date, required: true },
    returnedAt: { type: Date },
    fineXof: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

loanSchema.index({ user: 1, book: 1, returnedAt: 1 });

module.exports = model('Loan', loanSchema);


