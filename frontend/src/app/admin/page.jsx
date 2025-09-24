"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import toast from "react-hot-toast";
import { 
  FaBook, FaUser, FaCalendarAlt, FaChartBar, FaPlus, 
  FaTrash, FaEdit, FaCheckCircle, FaTimes, FaUpload,
  FaUserClock, FaExclamationCircle, FaBookmark, FaClock
} from 'react-icons/fa';

export default function AdminPage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', genre: '', summary: '', totalCopies: 1, cover: null });
  const [coverPreview, setCoverPreview] = useState(null);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState(null);

  const isAdmin = user?.role === 'admin';

  const load = async () => {
    try {
      const [s, list, us] = await Promise.all([
        apiFetch('/api/admin/stats', { token }),
        apiFetch('/api/books'),
        apiFetch('/api/admin/users', { token }),
      ]);
      setStats(s);
      setBooks(list.items || []);
      setUsers((us || []).filter(u => u.role === 'user'));
    } catch (e) {}
  };

  useEffect(() => { if (token) load(); }, [token]);

  const createBook = async () => {
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => { if (k !== 'cover') fd.append(k, v); });
      if (form.cover) fd.append('cover', form.cover);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/books`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Erreur création');
      toast.success('Livre créé');
      setForm({ title: '', author: '', isbn: '', genre: '', summary: '', totalCopies: 1, cover: null });
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const removeBook = async (id) => {
    try { await apiFetch(`/api/books/${id}`, { method: 'DELETE', token }); toast.success('Supprimé'); load(); } catch (e) { toast.error(e.message); }
  };

  const updateBook = async (b) => {
    try { await apiFetch(`/api/books/${b._id}`, { method: 'PUT', body: b, token }); toast.success('Modifié'); load(); } catch (e) { toast.error(e.message); }
  };

  const openUserHistory = async (u) => {
    setSelectedUser(u);
    setUserHistory(null);
    try {
      const h = await apiFetch(`/api/admin/users/${u._id}/history`, { token });
      setUserHistory(h);
    } catch (e) { toast.error(e.message); }
  };

  const adminReturnLoan = async (loanId) => {
    try {
      await apiFetch(`/api/loans/${loanId}/return`, { method: 'POST', token });
      toast.success('Retour enregistré');
      if (selectedUser) {
        const h = await apiFetch(`/api/admin/users/${selectedUser._id}/history`, { token });
        setUserHistory(h);
      }
      load();
    } catch (e) { toast.error(e.message); }
  };

  const adminCancelReservation = async (reservationId) => {
    try {
      await apiFetch(`/api/reservations/${reservationId}`, { method: 'DELETE', token });
      toast.success('Réservation annulée');
      if (selectedUser) {
        const h = await apiFetch(`/api/admin/users/${selectedUser._id}/history`, { token });
        setUserHistory(h);
      }
      load();
    } catch (e) { toast.error(e.message); }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Accès non autorisé</h2>
          <p className="text-gray-600 mt-2">Veuillez vous connecter pour accéder à cette page</p>
          <a href="/auth/login" className="btn-primary inline-block mt-4 px-6 py-2 rounded-lg">Se connecter</a>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Accès refusé</h2>
          <p className="text-gray-600 mt-2">Vous n'avez pas les droits nécessaires pour accéder à cette page</p>
          <a href="/" className="btn-primary inline-block mt-4 px-6 py-2 rounded-lg">Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-12">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 fade-in">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <FaChartBar className="text-xl text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interface d'administration</h1>
            <p className="text-gray-600">Gérez les livres, les utilisateurs et suivez les statistiques</p>
          </div>
        </div>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <FaUser className="text-3xl text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.users}</div>
            <div className="text-sm text-gray-600">Utilisateurs</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <FaBook className="text-3xl text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.books}</div>
            <div className="text-sm text-gray-600">Livres</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <FaCalendarAlt className="text-3xl text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.loans}</div>
            <div className="text-sm text-gray-600">Emprunts</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <FaUserClock className="text-3xl text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.activeLoans}</div>
            <div className="text-sm text-gray-600">En cours</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <FaExclamationCircle className="text-3xl text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.overdueLoans}</div>
            <div className="text-sm text-gray-600">En retard</div>
          </div>
        </div>
      )}

      <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <FaPlus className="text-xl text-primary" />
          <h2 className="text-xl font-bold text-gray-900">Ajouter un nouveau livre</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input 
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Titre du livre"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
              <input 
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Nom de l'auteur"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="ISBN"
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Genre"
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Résumé</label>
              <textarea 
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Résumé du livre"
                rows={4}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'exemplaires</label>
              <input 
                type="number"
                min="1"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={form.totalCopies}
                onChange={(e) => setForm({ ...form, totalCopies: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary/50 transition-colors">
                <div className="space-y-1 text-center">
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="cover-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                      <span>Télécharger un fichier</span>
                      <input
                        id="cover-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setForm({ ...form, cover: file });
                          try {
                            if (coverPreview) URL.revokeObjectURL(coverPreview);
                            setCoverPreview(file ? URL.createObjectURL(file) : null);
                          } catch {}
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
                </div>
              </div>
            </div>

            {coverPreview && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Aperçu</label>
                <div className="relative h-72 w-full max-w-sm mx-auto overflow-hidden rounded-lg shadow-sm flex items-center justify-center bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="aperçu"
                    src={coverPreview}
                    className="h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={createBook}
            className="btn-primary px-6 py-2 rounded-lg inline-flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <FaPlus className="text-sm" />
            Créer le livre
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaBook className="text-xl text-primary" />
            <h2 className="text-xl font-bold text-gray-900">Gestion des livres</h2>
          </div>
          <div className="text-sm text-gray-500">{books.length} livres au total</div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(b => (
            <BookCard
              key={b._id}
              book={b}
              token={token}
              onUpdated={load}
              onRemove={removeBook}
            />
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaUser className="text-xl text-primary" />
            <h2 className="text-xl font-bold text-gray-900">Gestion des utilisateurs</h2>
          </div>
          <div className="text-sm text-gray-500">{users.length} utilisateurs inscrits</div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(u => (
            <button
              key={u._id}
              onClick={() => openUserHistory(u)}
              className="bg-white rounded-lg p-4 text-left hover:shadow-md transition-all border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FaUser className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{u.name}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                  {u.role}
                </span>
                <span className="text-primary hover:text-primary-hover">Voir l'historique →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <FaUser className="text-xl text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Historique de {selectedUser.name}</h3>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedUser(null); setUserHistory(null); }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!userHistory ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-600 mt-4">Chargement de l'historique...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FaBook className="text-primary" />
                      <h4 className="text-lg font-semibold">Emprunts</h4>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-auto pr-4">
                      {userHistory.loans.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                          <FaBook className="text-4xl text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">Aucun emprunt</p>
                        </div>
                      ) : (
                        userHistory.loans.map(l => (
                          <div key={l._id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
                            <div className="flex gap-4">
                              {l.book?._id && (
                                <div className="w-16 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    alt="cover"
                                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/books/${l.book._id}/cover`}
                                    className="h-full object-contain"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 mb-1">{l.book?.title}</h5>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <FaCalendarAlt className="text-xs" />
                                  <span>Échéance: {new Date(l.dueAt).toLocaleDateString()}</span>
                                </div>
                                {l.returnedAt ? (
                                  <div className="mt-2 flex items-center gap-2 text-sm">
                                    <FaCheckCircle className="text-green-500" />
                                    <span>Retourné le {new Date(l.returnedAt).toLocaleDateString()}</span>
                                    {l.fineXof > 0 && (
                                      <span className="text-red-500 ml-2">
                                        Amende: {l.fineXof} FCFA
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => adminReturnLoan(l._id)}
                                    className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm bg-primary text-white hover:bg-primary-hover transition-colors"
                                  >
                                    <FaCheckCircle className="text-xs" />
                                    Forcer le retour
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FaBookmark className="text-primary" />
                      <h4 className="text-lg font-semibold">Réservations</h4>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-auto pr-4">
                      {userHistory.reservations.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                          <FaBookmark className="text-4xl text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">Aucune réservation</p>
                        </div>
                      ) : (
                        userHistory.reservations.map(r => (
                          <div key={r._id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
                            <div className="flex gap-4">
                              {r.book?._id && (
                                <div className="w-16 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    alt="cover"
                                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/books/${r.book._id}/cover`}
                                    className="h-full object-contain"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 mb-1">{r.book?.title}</h5>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <FaClock className="text-xs" />
                                  <span>Expire le {new Date(r.expiresAt).toLocaleDateString()}</span>
                                </div>
                                <button
                                  onClick={() => adminCancelReservation(r._id)}
                                  className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                                >
                                  <FaTimes className="text-xs" />
                                  Annuler la réservation
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}


function BookCard({ book, token, onUpdated, onRemove }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...book });
  const [editCover, setEditCover] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState(null);

  const handleUpdate = async () => {
    try {
      if (editCover) {
        const fd = new FormData();
        Object.entries(editForm).forEach(([k, v]) => {
          if (k !== 'cover' && k !== '_id' && k !== 'coverImage') fd.append(k, v);
        });
        fd.append('cover', editCover);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/books/${book._id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) throw new Error('Erreur modification');
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/books/${book._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(editForm),
        });
      }
      toast.success('Livre mis à jour');
      setIsEditing(false);
      if (editCoverPreview) URL.revokeObjectURL(editCoverPreview);
      setEditCover(null);
      setEditCoverPreview(null);
      onUpdated();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100">
      {isEditing ? (
        <div className="p-4 space-y-4">
          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
            {editCoverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={editCoverPreview} alt="Aperçu" className="h-full w-full object-contain" />
            ) : book.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/books/${book._id}/cover`} alt={book.title} className="h-full w-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaBook className="text-4xl text-gray-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity hover:opacity-100 opacity-0">
              <label className="cursor-pointer p-4 rounded-full hover:bg-white/20 transition-colors">
                <FaUpload className="text-2xl text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditCover(file);
                    try {
                      if (editCoverPreview) URL.revokeObjectURL(editCoverPreview);
                      setEditCoverPreview(file ? URL.createObjectURL(file) : null);
                    } catch {}
                  }}
                />
              </label>
            </div>
          </div>

          <input className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Titre" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          <input className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Auteur" value={editForm.author} onChange={(e) => setEditForm({ ...editForm, author: e.target.value })} />

          <div className="grid grid-cols-2 gap-4">
            <input className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="ISBN" value={editForm.isbn} onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })} />
            <input className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Genre" value={editForm.genre || ''} onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })} />
          </div>

          <textarea className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Résumé" rows={3} value={editForm.summary || ''} onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })} />

          <input type="number" min="1" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={editForm.totalCopies} onChange={(e) => setEditForm({ ...editForm, totalCopies: Number(e.target.value) })} />

          <div className="flex justify-end gap-2">
            <button onClick={() => { setIsEditing(false); setEditForm({ ...book }); if (editCoverPreview) URL.revokeObjectURL(editCoverPreview); setEditCover(null); setEditCoverPreview(null); }} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">Annuler</button>
            <button onClick={handleUpdate} className="btn-primary px-4 py-2 rounded-lg inline-flex items-center gap-2"><FaCheckCircle className="text-sm" />Enregistrer</button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center">
            {book.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/books/${book._id}/cover`} alt={book.title} className="h-full object-contain" />
            ) : (
              <FaBook className="text-4xl text-gray-300" />
            )}
          </div>

          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">ISBN: {book.isbn}</span>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">Genre: {book.genre || '—'}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{book.availableCopies}/{book.totalCopies} disponible{book.totalCopies > 1 ? 's' : ''}</span>
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(true)} className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Modifier"><FaEdit /></button>
                <button onClick={() => onRemove(book._id)} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Supprimer"><FaTrash /></button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

