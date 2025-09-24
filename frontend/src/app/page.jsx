import { FaBook, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <section className="py-16 text-center fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Bibliothèque en ligne
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Découvrez un monde de connaissances à portée de main. Recherchez, réservez et empruntez vos livres préférés.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/catalogue" className="btn-primary inline-flex items-center gap-2 group">
            <FaBook className="group-hover:rotate-12 transition-transform"/>
            Voir le catalogue
          </a>
          <a href="/auth/register" className="btn-secondary inline-flex items-center gap-2">
            Créer un compte
          </a>
        </div>
      </section>

      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card group">
            <div className="flex items-center gap-3 text-primary mb-4">
              <FaBook className="text-2xl group-hover:scale-110 transition-transform"/>
              <div className="text-xl font-semibold">Catalogue interactif</div>
            </div>
            <p className="text-gray-600">
              Explorez notre vaste collection de livres avec notre interface intuitive. 
              Recherchez par titre, auteur ou genre en temps réel.
            </p>
          </div>

          <div className="card group">
            <div className="flex items-center gap-3 text-primary mb-4">
              <FaCalendarAlt className="text-2xl group-hover:scale-110 transition-transform"/>
              <div className="text-xl font-semibold">Emprunts simplifiés</div>
            </div>
            <p className="text-gray-600">
              Gérez vos emprunts et réservations en quelques clics. 
              Recevez des rappels pour les retours et prolongez vos emprunts facilement.
            </p>
          </div>

          <div className="card group">
            <div className="flex items-center gap-3 text-primary mb-4">
              <FaChartLine className="text-2xl group-hover:scale-110 transition-transform"/>
              <div className="text-xl font-semibold">Tableau de bord</div>
            </div>
            <p className="text-gray-600">
              Suivez votre activité, gérez vos amendes et restez informé 
              des dernières notifications en temps réel.
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6">
              <a href="/catalogue" className="nav-link">Catalogue</a>
              <a href="/notifications" className="nav-link">Notifications</a>
              <a href="/auth/login" className="nav-link">Connexion</a>
            </div>
            <div className="text-gray-500">© {new Date().getFullYear()} BiblioApp</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
