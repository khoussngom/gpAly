#!/bin/bash

echo "🚀 Démarrage de l'application CargoTrack"
echo "========================================"

# Sauvegarder le répertoire de départ
PROJECT_DIR=$(pwd)

# Démarrer le serveur HTTP pour le frontend
echo "📱 Démarrage du serveur frontend sur http://localhost:8000"
cd "$PROJECT_DIR/public" && python3 -m http.server 8000 &
FRONTEND_PID=$!

# Attendre un peu
sleep 2

# Démarrer le serveur PHP pour l'API
echo "🔧 Démarrage de l'API PHP sur http://localhost:8080"
cd "$PROJECT_DIR/api" && php -S localhost:8080 index.php &
API_PID=$!

echo ""
echo "✅ Application démarrée avec succès !"
echo "📱 Frontend : http://localhost:8000"
echo "🔧 API : http://localhost:8080"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les serveurs"

cleanup() {
    echo ""
    echo "Arrêt des serveurs..."
    kill $FRONTEND_PID 2>/dev/null
    kill $API_PID 2>/dev/null
    echo "Serveurs arrêtés"
    exit 0
}

trap cleanup SIGINT

wait
