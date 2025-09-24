"use client";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock, FaBook, FaArrowLeft, FaUserPlus } from 'react-icons/fa';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push("/catalogue");
    } catch (err) {
      toast.error(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
      <div className="w-full max-w-md mx-4 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <FaBook className="text-3xl text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
          <p className="mt-2 text-gray-600">
            Accédez à votre compte pour gérer vos emprunts
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 mt-8">
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
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
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
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div className="space-y-4">
          
          
          <div className="text-center">
            
            <a 
              href="/auth/register" 
              className="mt-4 inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
            >
              <FaUserPlus className="text-sm" />
              Créer un compte
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


