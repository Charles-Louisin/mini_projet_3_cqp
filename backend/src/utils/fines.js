function getLoanDurationDays() {
  const fromEnv = Number(process.env.LOAN_DAYS || 14);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? Math.floor(fromEnv) : 14;
}

function getFinePerDayXof() {
  const fromEnv = Number(process.env.FINE_PER_DAY_XOF || 1000);
  return Number.isFinite(fromEnv) && fromEnv >= 0 ? Math.floor(fromEnv) : 1000;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Penalité déclenchée dès la date d'échéance passée (jour 1 immédiatement)
function calculateFineXof(dueAt, returnedAt = new Date()) {
  const lateMs = new Date(returnedAt).getTime() - new Date(dueAt).getTime();
  if (lateMs <= 0) return 0;
  const fullDays = Math.floor(lateMs / (24 * 60 * 60 * 1000));
  const daysWithPenalty = fullDays + 1; // inclusif dès le passage
  return daysWithPenalty * getFinePerDayXof();
}

module.exports = { getLoanDurationDays, getFinePerDayXof, addDays, calculateFineXof };


