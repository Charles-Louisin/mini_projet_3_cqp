"use client";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import Link from "next/link";
import { FaSearch, FaBook, FaUserEdit, FaTags } from 'react-icons/fa';

export default function CataloguePage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/books?query=${encodeURIComponent(q)}`);
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Recherche live avec debounce
  const debouncedQ = useMemo(() => q, [q]);
  useEffect(() => {
    const id = setTimeout(() => {
      if (debouncedQ !== undefined) load();
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-12">
      <div className="text-center mb-12 fade-in">
        <h1 className="text-3xl font-bold mb-4">Catalogue de la bibliothèque</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explorez notre collection complète de livres. Utilisez la barre de recherche pour trouver rapidement ce que vous cherchez.
        </p>
      </div>

      <div className="mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <input 
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              placeholder="Recherchez par titre, auteur, genre ou ISBN..." 
              value={q} 
              onChange={(e)=>setQ(e.target.value)} 
            />
            <FaSearch className="absolute left-4 text-gray-400" />
            <button 
              onClick={load} 
              className="btn-primary ml-4 px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
            >
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement du catalogue...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 slide-in">
          {items.map(b => (
            <Link 
              key={b._id} 
              href={`/catalogue/${b._id}`} 
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-72 bg-gray-100">
                {b.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    alt={b.title} 
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/books/${b._id}/cover`} 
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaBook className="text-4xl text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{b.title}</h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FaUserEdit className="text-sm" />
                  <span className="text-sm">{b.author}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FaTags className="text-sm" />
                  <span className="text-sm">{b.genre || '—'}</span>
                </div>
                <div className="mt-auto pt-4 border-t flex justify-between items-center text-sm text-gray-500">
                  <span>ISBN: {b.isbn}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    b.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {b.availableCopies} / {b.totalCopies} disponible{b.totalCopies > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


