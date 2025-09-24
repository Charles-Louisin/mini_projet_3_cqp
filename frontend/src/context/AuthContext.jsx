"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = localStorage.getItem("jwt");
      if (t) setToken(t);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) { setUser(null); return; }
    (async () => {
      try {
        const data = await apiFetch("/api/auth/me", { token });
        setUser(data.user);
      } catch (e) {
        setUser(null);
      }
    })();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await apiFetch("/api/auth/login", { method: "POST", body: { email, password } });
    setToken(data.token);
    localStorage.setItem("jwt", data.token);
    setUser(data.user);
    toast.success("Connecté");
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await apiFetch("/api/auth/register", { method: "POST", body: { name, email, password } });
    setToken(data.token);
    localStorage.setItem("jwt", data.token);
    setUser(data.user);
    toast.success("Compte créé");
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("jwt");
    toast.success("Déconnecté");
  }, []);

  const value = useMemo(() => ({ token, user, loading, login, register, logout }), [token, user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


