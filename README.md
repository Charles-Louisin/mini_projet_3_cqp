# Bibliothèque en Ligne

Une application web de gestion de bibliothèque permettant aux utilisateurs de consulter, emprunter et réserver des livres. L'application est construite avec Next.js pour le frontend et Node.js/Express pour le backend.

## 🚀 Fonctionnalités

- **Authentification** : Inscription et connexion des utilisateurs
- **Catalogue** : Consultation des livres disponibles
- **Emprunts** : Gestion des emprunts de livres
- **Réservations** : Système de réservation pour les livres indisponibles
- **Administration** : Interface admin pour gérer les livres et les utilisateurs
- **Notifications** : Suivi des emprunts et réservations

## 🛠️ Technologies Utilisées

### Frontend
- Next.js 13+ (App Router)
- React 18
- TailwindCSS
- Context API pour la gestion d'état

### Backend
- Node.js
- Express
- MongoDB
- JWT pour l'authentification

## 📦 Structure du Projet

```
mini-projet-3/
├── frontend/               # Application Next.js
│   ├── src/
│   │   ├── app/           # Pages de l'application
│   │   ├── components/    # Composants réutilisables
│   │   ├── context/      # Contextes React
│   │   └── lib/          # Utilitaires et configuration
│   └── public/           # Assets statiques
│
└── backend/               # Serveur Express
    ├── src/
    │   ├── config/       # Configuration
    │   ├── models/       # Modèles MongoDB
    │   ├── routes/       # Routes API
    │   ├── middleware/   # Middleware Express
    │   └── utils/        # Fonctions utilitaires
    └── scripts/          # Scripts utilitaires
```

## 🚀 Installation

### Prérequis
- Node.js 16+ installé
- MongoDB installé et en cours d'exécution
- Git

### Étapes d'installation

1. Cloner le repository :
```bash
git clone https://github.com/Charles-Louisin/mini_projet_3_cqp.git
cd mini_projet_3_cqp
```

2. Installer les dépendances du backend :
```bash
cd backend
npm install
```

3. Configurer les variables d'environnement du backend :
   - Copier `.env.example` vers `.env`
   - Remplir les variables nécessaires (MongoDB URI, JWT Secret, etc.)

4. Installer les dépendances du frontend :
```bash
cd ../frontend
npm install
```

5. Configurer les variables d'environnement du frontend :
   - Copier `.env.example` vers `.env.local`
   - Remplir les variables nécessaires (URL API, etc.)

## 🎯 Lancement

### Démarrer le Backend

```bash
cd backend
npm run dev     # Pour le développement
# ou
npm start       # Pour la production
```
Le serveur démarrera sur http://localhost:3000

### Démarrer le Frontend

```bash
cd frontend
npm run dev     # Pour le développement
# ou
npm start       # Pour la production
```
L'application sera accessible sur http://localhost:3001

## 👥 Rôles Utilisateurs

### Utilisateur Standard
- Consultation du catalogue
- Emprunts de livres
- Réservations
- Gestion de son profil

### Administrateur
- Gestion des livres (CRUD)
- Gestion des utilisateurs
- Validation des emprunts
- Suivi des retours

## 🔒 API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Livres
- GET /api/books
- GET /api/books/:id
- POST /api/books (Admin)
- PUT /api/books/:id (Admin)
- DELETE /api/books/:id (Admin)

### Emprunts
- GET /api/loans
- POST /api/loans
- PUT /api/loans/:id
- DELETE /api/loans/:id

### Réservations
- GET /api/reservations
- POST /api/reservations
- DELETE /api/reservations/:id

## 📚 Base de données

L'application utilise MongoDB avec les collections suivantes :
- users
- books
- loans
- reservations

## 🛡️ Sécurité

- JWT pour l'authentification
- Hachage des mots de passe avec bcrypt
- Validation des données avec Joi
- Protection CSRF
- Rate limiting

## 🐛 Débogage

Pour voir les logs détaillés :
```bash
# Backend
npm run dev

# Frontend
npm run dev
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request