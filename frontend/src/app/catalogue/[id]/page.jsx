"use client";
import { use, useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { FaBook, FaCalendarAlt, FaBookmark, FaClock } from 'react-icons/fa';

export default function BookDetail({ params }) {
  const { token } = useAuth();
  const routeParams = use(params);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dueAt, setDueAt] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/books/${routeParams.id}`);
      setBook(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [routeParams.id]);

  const borrow = async () => {
    try {
      await apiFetch(`/api/loans`, { method: "POST", body: { bookId: routeParams.id, dueAt }, token });
      toast.success("Emprunté");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const reserve = async () => {
    try {
      await apiFetch(`/api/reservations`, { method: "POST", body: { bookId: routeParams.id }, token });
      toast.success("Réservé");
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading || !book) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-600 mt-4">Chargement des détails...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="mb-6">
        <a href="/catalogue" className="inline-flex items-center gap-2 text-primary hover:text-primary-hover">
          {/* simple chevron */}
          <span className="inline-block rotate-180">➜</span>
          Retour au catalogue
        </a>
      </div>
      <div className="grid md:grid-cols-2 gap-12 fade-in">
        {/* Colonne de gauche - Image */}
        <div className="space-y-6">
          <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg flex justify-center" style={{ height: '500px' }}>
            {book.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                alt={book.title} 
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/books/${book._id}/cover`} 
                className="h-full object-contain transform hover:scale-105 transition-transform duration-300" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaBook className="text-6xl text-gray-300" />
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="text-lg font-semibold flex items-center gap-2">
              <FaBook className="text-primary" />
              État du livre
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Disponibilité</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {book.availableCopies} / {book.totalCopies} exemplaire{book.totalCopies > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Colonne de droite - Informations */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
            <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <FaBook className="text-primary" />
                <span>{book.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaBookmark className="text-primary" />
                <span>{book.genre || 'Genre non spécifié'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-primary" />
                <span>ISBN: {book.isbn}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">À propos du livre</h2>
            <p className="text-gray-600 leading-relaxed">{book.summary || 'Aucun résumé disponible.'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-semibold">Emprunter ou réserver</h2>
            <p className="text-gray-600">Sélectionnez une date de retour prévue et choisissez votre action.</p>
            
            <div className="space-y-4">
              <div className="relative w-full">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  type="datetime-local" 
                  value={dueAt} 
                  onChange={(e)=>setDueAt(e.target.value)} 
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={borrow} className="btn-primary px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                  <FaBook className="text-sm" /> Emprunter
                </button>
                <button onClick={reserve} className="btn-secondary px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                  <FaBookmark className="text-sm" /> Réserver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


