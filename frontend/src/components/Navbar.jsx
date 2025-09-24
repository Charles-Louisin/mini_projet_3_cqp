"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const { token, user, logout } = useAuth();
  const [hasNotif, setHasNotif] = useState(false);

  useEffect(() => {
    let timer;
    const load = async () => {
      try {
        if (!token) { setHasNotif(false); return; }
        const [loans, reservations] = await Promise.all([
          apiFetch('/api/loans/me', { token }),
          apiFetch('/api/reservations/me', { token }),
        ]);
        const now = new Date();
        const overdue = (loans || []).some(l => !l.returnedAt && new Date(l.dueAt) < now);
        const availableReserved = (reservations || []).some(r => r.book && r.book.availableCopies > 0);
        // Lire l'état "lu"
        let readKeys = [];
        try { readKeys = JSON.parse(localStorage.getItem('notifReadKeys') || '[]'); } catch {}
        const readSet = new Set(readKeys);
        // Clés de notifs non lues
        const keys = [];
        (loans || []).forEach(l => { if (!l.returnedAt && new Date(l.dueAt) < now) keys.push(`overdue-${l._id}`); });
        (reservations || []).forEach(r => { if (r.book && r.book.availableCopies > 0) keys.push(`avail-${r._id}`); });
        const hasUnread = keys.some(k => !readSet.has(k));
        setHasNotif(hasUnread || overdue || availableReserved);
      } catch {
        setHasNotif(false);
      }
    };
    load();
    timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [token]);
  if (pathname?.startsWith("/auth/")) return null;
  return (
    <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed top-0 z-50">
      <nav className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
          BiblioApp
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/catalogue" className="nav-link hover:text-primary transition-colors">
            Catalogue
          </Link>
          {token && (
            <Link href="/dashboard" className="nav-link hover:text-primary transition-colors">
              Mon espace
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" className="nav-link hover:text-primary transition-colors">
              Admin
            </Link>
          )}
          {token && (
            <Link href="/notifications" className="nav-link hover:text-primary transition-colors relative">
              Notifications
              {hasNotif && (
                <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </Link>
          )}
          {!token ? (
            <Link 
              href="/auth/login" 
              className="btn-primary inline-flex items-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              Se connecter
            </Link>
          ) : (
            <button 
              onClick={logout} 
              className="btn-secondary hover:bg-gray-50 transition-colors"
            >
              Se déconnecter
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}


