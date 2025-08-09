#!/bin/bash

echo "🚀 Démarrage de l'application Gestionnaire de Cargaison"
echo "======================================================="

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances principales..."
    npm install
fi

if [ ! -d "json-server/node_modules" ]; then
    echo "📦 Installation des dépendances JSON Server..."
    cd json-server && npm install && cd ..
fi

echo ""
echo "🌐 Démarrage des serveurs..."
echo "- JSON Server API : http://localhost:3002"
echo "- Application Web : http://localhost:3003"
echo ""
echo "🔧 Pour arrêter les serveurs, utilisez Ctrl+C"
echo ""

# Démarrer les deux serveurs
npm run start:all
