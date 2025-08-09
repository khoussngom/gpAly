# Gestionnaire de Cargaison

Application web de gestion de cargaisons avec interface interactive et sélection de coordonnées géographiques.

## 🚀 Démarrage rapide

### Option 1: Script automatique
```bash
./start.sh
```

### Option 2: Démarrage manuel

1. **Installer les dépendances**
```bash
npm run install:all
```

2. **Démarrer les serveurs**
```bash
npm run start:all
```

### Option 3: Démarrage séparé

1. **Démarrer JSON Server API** (Terminal 1)
```bash
cd json-server
npm run dev
```

2. **Démarrer l'application web** (Terminal 2)
```bash
npm run dev
```

## 🌐 URLs d'accès

- **Application Web** : http://localhost:3003
- **API JSON Server** : http://localhost:3002
- **API PHP (routage)** : http://localhost/api (si serveur Apache/Nginx configuré)

## 📁 Structure du projet

```
projet1/
├── src/                    # Code source TypeScript
│   ├── models/            # Modèles de données
│   ├── ui/               # Composants d'interface
│   └── main.ts           # Point d'entrée
├── json-server/          # Serveur de données JSON
│   ├── db.json          # Base de données JSON
│   └── package.json     # Configuration JSON Server
├── api/                 # API PHP (routage uniquement)
├── public/             # Fichiers statiques
└── dist/              # Fichiers compilés
```

## 🗺️ Fonctionnalités

### ✅ Implémentées
- ✅ Gestion des cargaisons (Maritime, Aérienne, Routière)
- ✅ Gestion des produits (Alimentaire, Chimique, Fragile, Incassable)
- ✅ Interface utilisateur responsive avec Tailwind CSS
- ✅ Sélection interactive de coordonnées avec carte Leaflet
- ✅ Calcul automatique de distance entre deux points
- ✅ API REST avec JSON Server
- ✅ Routage PHP pour géocodage

### 🔄 En cours
- 🔄 Intégration complète avec l'API
- 🔄 Sauvegarde des données persistantes
- 🔄 Recherche et filtrage avancés

### 🚧 À venir
- 🚧 Authentification utilisateur
- 🚧 Rapports et statistiques
- 🚧 Notifications en temps réel
- 🚧 Export PDF des reçus

## 🛠️ Technologies utilisées

- **Frontend** : TypeScript, Webpack, Tailwind CSS
- **Cartes** : Leaflet.js, OpenStreetMap
- **API** : JSON Server, PHP (routage)
- **Géocodage** : Nominatim (OpenStreetMap)

## 📚 Commandes disponibles

```bash
npm run build        # Compiler TypeScript
npm run dev         # Serveur de développement
npm run build:prod  # Build de production
npm run json-server # Démarrer uniquement JSON Server
npm run start:all   # Démarrer tous les serveurs
npm run install:all # Installer toutes les dépendances
```

## 🔧 Configuration

### Ports utilisés
- **3002** : JSON Server API
- **3003** : Application web (webpack-dev-server)

### Modification des ports
Modifier dans `webpack.config.js` pour l'app web et `json-server/package.json` pour l'API.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence ISC.
