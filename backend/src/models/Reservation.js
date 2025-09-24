const { Schema, model, Types } = require('mongoose');

const reservationSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    book: { type: Types.ObjectId, ref: 'Book', required: true, index: true },
    reservedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    notified: { type: Boolean, default: false },
    fulfilledByLoan: { type: Types.ObjectId, ref: 'Loan' },
  },
  { timestamps: true }
);

reservationSchema.index({ user: 1, book: 1, expiresAt: 1 });

module.exports = model('Reservation', reservationSchema);


