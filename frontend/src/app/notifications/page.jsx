"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import { FaBell, FaCheckCircle, FaExclamationCircle, FaClock, FaBook, FaUserClock } from 'react-icons/fa';

function calculateFineXof(dueAt, now = new Date()) {
  const lateMs = new Date(now).getTime() - new Date(dueAt).getTime();
  if (lateMs <= 0) return 0;
  const fullDays = Math.floor(lateMs / (24 * 60 * 60 * 1000));
  const daysWithPenalty = fullDays + 1; // pénalité dès l'échéance passée
  return daysWithPenalty * 1000;
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const [l, r] = await Promise.all([
        apiFetch('/api/loans/me', { token }),
        apiFetch('/api/reservations/me', { token }),
      ]);
      setLoans(l || []);
      setReservations(r || []);
    })();
  }, [token]);

  const availabilityNotifs = useMemo(() => {
    return (reservations || [])
      .filter(r => r.book && r.book.availableCopies > 0)
      .map(r => ({
        type: 'availability',
        bookTitle: r.book.title,
        message: `Le livre réservé "${r.book.title}" est maintenant disponible.`,
        when: new Date(),
        key: `avail-${r._id}`,
      }));
  }, [reservations]);

  const overdueNotifs = useMemo(() => {
    const now = new Date();
    return (loans || [])
      .filter(l => !l.returnedAt && new Date(l.dueAt) < now)
      .map(l => {
        const fine = calculateFineXof(l.dueAt, now);
        return {
          type: 'overdue',
          bookTitle: l.book?.title || 'Livre',
          message: `Échéance dépassée pour "${l.book?.title || 'Livre'}". Pénalité actuelle: ${fine} FCFA`,
          when: now,
          key: `overdue-${l._id}`,
        };
      });
  }, [loans]);

  const nextReturnNotifs = useMemo(() => {
    return (reservations || [])
      .filter(r => r.nextDueAt)
      .map(r => ({
        type: 'next-return',
        bookTitle: r.book?.title || 'Livre',
        message: `Prochain retour prévu pour "${r.book?.title || 'Livre'}" le ${new Date(r.nextDueAt).toLocaleString()}`,
        when: new Date(r.nextDueAt),
        key: `nextreturn-${r._id}-${new Date(r.nextDueAt).toISOString()}`,
      }));
  }, [reservations]);

  // Gestion du statut "lu" via localStorage
  const [readSet, setReadSet] = useState(new Set());
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('notifReadKeys') || '[]');
      setReadSet(new Set(saved));
    } catch {}
  }, []);

  const allNotifs = [...availabilityNotifs, ...overdueNotifs, ...nextReturnNotifs];

  // Marquer comme lu automatiquement quand la page est ouverte
  useEffect(() => {
    if (allNotifs.length === 0) return;
    const updated = new Set(readSet);
    allNotifs.forEach(n => { if (n.key) updated.add(n.key); });
    setReadSet(updated);
    try { localStorage.setItem('notifReadKeys', JSON.stringify(Array.from(updated))); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNotifs.length]);

  const isRead = (key) => readSet.has(key);
  const markRead = (key) => {
    const updated = new Set(readSet);
    updated.add(key);
    setReadSet(updated);
    try { localStorage.setItem('notifReadKeys', JSON.stringify(Array.from(updated))); } catch {}
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Accès non autorisé</h2>
          <p className="text-gray-600 mt-2">Veuillez vous connecter pour voir vos notifications</p>
          <a href="/auth/login" className="btn-primary inline-block mt-4 px-6 py-2 rounded-lg">Se connecter</a>
        </div>
      </div>
    );
  }

  const totalNotifs = availabilityNotifs.length + overdueNotifs.length + nextReturnNotifs.length;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-12">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 fade-in">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <FaBell className="text-xl text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centre de notifications</h1>
            <p className="text-gray-600">
              {totalNotifs} notification{totalNotifs > 1 ? 's' : ''} en attente
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FaBook className="text-lg text-primary" />
              <h2 className="text-xl font-semibold text-gray-900">Livres disponibles</h2>
            </div>
            {availabilityNotifs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                <FaCheckCircle className="text-3xl text-gray-400 mx-auto mb-2" />
                Aucune notification de disponibilité
              </div>
            ) : (
              <div className="space-y-3">
                {availabilityNotifs.map((n, idx) => (
                  <div 
                    key={`a-${idx}`} 
                    className="bg-green-50 rounded-lg p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FaCheckCircle className="text-green-500 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">{n.bookTitle}</h3>
                        <p className="text-sm text-gray-600">{n.message}</p>
                      </div>
                    </div>
                    {!isRead(n.key) && (
                      <button 
                        onClick={() => markRead(n.key)}
                        className="px-3 py-1 text-sm text-primary border border-primary/20 rounded-full hover:bg-primary hover:text-white transition-colors"
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationCircle className="text-lg text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">Retards</h2>
            </div>
            {overdueNotifs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                <FaCheckCircle className="text-3xl text-gray-400 mx-auto mb-2" />
                Aucun retard à signaler
              </div>
            ) : (
              <div className="space-y-3">
                {overdueNotifs.map((n, idx) => (
                  <div 
                    key={`o-${idx}`} 
                    className="bg-red-50 rounded-lg p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">{n.bookTitle}</h3>
                        <p className="text-sm text-red-600">{n.message}</p>
                      </div>
                    </div>
                    {!isRead(n.key) && (
                      <button 
                        onClick={() => markRead(n.key)}
                        className="px-3 py-1 text-sm text-primary border border-primary/20 rounded-full hover:bg-primary hover:text-white transition-colors"
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <FaUserClock className="text-lg text-primary" />
              <h2 className="text-xl font-semibold text-gray-900">Prochains retours</h2>
            </div>
            {nextReturnNotifs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                <FaClock className="text-3xl text-gray-400 mx-auto mb-2" />
                Aucun retour prévu
              </div>
            ) : (
              <div className="space-y-3">
                {nextReturnNotifs.map((n, idx) => (
                  <div 
                    key={`nr-${idx}`} 
                    className="bg-blue-50 rounded-lg p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FaClock className="text-blue-500 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">{n.bookTitle}</h3>
                        <p className="text-sm text-gray-600">{n.message}</p>
                      </div>
                    </div>
                    {!isRead(n.key) && (
                      <button 
                        onClick={() => markRead(n.key)}
                        className="px-3 py-1 text-sm text-primary border border-primary/20 rounded-full hover:bg-primary hover:text-white transition-colors"
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}


