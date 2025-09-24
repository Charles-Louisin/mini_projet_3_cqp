"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import toast from "react-hot-toast";
import { FaBook, FaCalendarAlt, FaBookmark, FaClock, FaUser, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const notifiedRef = useRef({});

  const load = async () => {
    try {
      const [l, r] = await Promise.all([
        apiFetch('/api/loans/me', { token }),
        apiFetch('/api/reservations/me', { token }),
      ]);
      setLoans(l);
      setReservations(r);
    } catch (e) {}
  };

  useEffect(() => { if (token) load(); }, [token]);

  // Notifications: alerter 5 min avant échéance/expiration
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const fiveMin = 5 * 60 * 1000;
      loans.filter(l => !l.returnedAt).forEach(l => {
        const due = new Date(l.dueAt).getTime();
        if (due - now <= fiveMin && due - now > 0 && !notifiedRef.current[`loan-${l._id}`]) {
          notifiedRef.current[`loan-${l._id}`] = true;
          toast("Échéance proche pour: " + (l.book?.title || "Livre"));
        }
      });
      reservations.forEach(r => {
        const exp = new Date(r.expiresAt).getTime();
        if (exp - now <= fiveMin && exp - now > 0 && !notifiedRef.current[`res-${r._id}`]) {
          notifiedRef.current[`res-${r._id}`] = true;
          toast("Votre réservation expire bientôt: " + (r.book?.title || "Livre"));
        }
      });
    }, 30000);
    return () => clearInterval(id);
  }, [loans, reservations]);

  const returnLoan = async (id) => {
    try {
      await apiFetch(`/api/loans/${id}/return`, { method: 'POST', token });
      toast.success('Retour enregistré');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const cancelReservation = async (id) => {
    try {
      await apiFetch(`/api/reservations/${id}`, { method: 'DELETE', token });
      toast.success('Réservation annulée');
      load();
    } catch (e) { toast.error(e.message); }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Accès non autorisé</h2>
          <p className="text-gray-600 mt-2">Veuillez vous connecter pour accéder à votre espace</p>
          <a href="/auth/login" className="btn-primary inline-block mt-4 px-6 py-2 rounded-lg">Se connecter</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-12">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 fade-in">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <FaUser className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mon espace personnel</h1>
              <p className="text-gray-600">{user?.name}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <a href="/catalogue" className="btn-secondary inline-flex items-center gap-2">
              <FaBook className="text-sm" />
              Parcourir le catalogue
            </a>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <FaBook className="text-xl text-primary" />
            <h2 className="text-xl font-bold text-gray-900">Mes emprunts</h2>
          </div>
          
          <div className="space-y-4">
            {loans.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                <FaBook className="text-4xl text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Vous n'avez aucun emprunt en cours</p>
              </div>
            ) : (
              loans.map(l => (
                <div key={l._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                      {l.book?._id ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={l.book.title}
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/books/${l.book._id}/cover`}
                          className="h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaBook className="text-3xl text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{l.book?.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <FaCalendarAlt className="text-primary" />
                        <span>Échéance: {new Date(l.dueAt).toLocaleDateString()}</span>
                      </div>
                      {l.returnedAt ? (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1 text-green-600">
                            <FaCheckCircle />
                            <span>Retourné le {new Date(l.returnedAt).toLocaleDateString()}</span>
                          </div>
                          {l.fineXof > 0 && (
                            <span className="text-red-500 ml-2">
                              Amende: {l.fineXof} FCFA
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => returnLoan(l._id)}
                          className="btn-primary mt-3 px-4 py-2 rounded-lg inline-flex items-center gap-2"
                        >
                          <FaCheckCircle className="text-sm" />
                          Retourner
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <FaBookmark className="text-xl text-primary" />
            <h2 className="text-xl font-bold text-gray-900">Mes réservations</h2>
          </div>
          
          <div className="space-y-4">
            {reservations.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                <FaBookmark className="text-4xl text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Vous n'avez aucune réservation en cours</p>
              </div>
            ) : (
              <>
                {reservations.map(r => (
                  <div key={r._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{r.book?.title}</h3>
                        <div className="text-sm">
                          Expire: {new Date(r.expiresAt).toLocaleString()}
                        </div>
                      </div>
                      {r.nextDueAt && (
                        <div className="text-xs text-gray-600 mt-1">
                          Prochain retour prévu: {new Date(r.nextDueAt).toLocaleString()}
                        </div>
                      )}
                      <button onClick={() => cancelReservation(r._id)} className="border px-3 py-1.5 rounded mt-2">Annuler</button>
                    </div>
                  </div>
                ))}
              </>
            )}
        </div>
      </section>
      </div>
    </div>
  );
}


