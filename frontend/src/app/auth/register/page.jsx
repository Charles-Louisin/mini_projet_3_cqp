"use client";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (password !== confirm) { throw new Error("Les mots de passe ne correspondent pas"); }
      await register(name, email, password);
      router.push("/catalogue");
    } catch (err) {
      toast.error(err.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
      <div className="w-full max-w-md mx-4 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <FaUserPlus className="text-2xl text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="mt-1 text-sm text-gray-600">
            Rejoignez notre bibliothèque en ligne
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Votre nom"
                value={name}
                onChange={(e)=>setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="password"
                type={show ? "text" : "password"}
                required
                className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {show ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="confirm"
                type={show ? "text" : "password"}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Confirmez votre mot de passe"
                value={confirm}
                onChange={(e)=>setConfirm(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 rounded-lg flex items-center justify-center gap-2 text-base font-medium hover:shadow-lg transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                Création en cours...
              </>
            ) : (
              <>
                <FaUserPlus className="text-base" />
                Créer mon compte
              </>
            )}
          </button>
        </form>

        <div className="space-y-4">
          
          
          <div className="text-center">
            
            <a 
              href="/auth/login" 
              className="mt-4 inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
            >
              <FaSignInAlt className="text-sm" />
              J'ai déjà un compte
            </a>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <a 
              href="/" 
              className="text-gray-500 hover:text-primary flex items-center gap-2 transition-colors"
            >
              <FaArrowLeft className="text-xs" />
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


