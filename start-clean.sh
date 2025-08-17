#!/bin/bash

echo "Arrêt des serveurs existants..."
pkill -f "python3 -m http.server"
pkill -f "php -S localhost"
sleep 2

echo "Démarrage propre de CargoTrack"
echo "=================================="

cd "$(dirname "$0")/public"

echo "Démarrage du serveur frontend sur http://localhost:8000"
echo "Répertoire: $(pwd)"
python3 -m http.server 8000 &
FRONTEND_PID=$!

cd "../api"

echo "Démarrage de l'API PHP sur http://localhost:8080"
echo "Répertoire: $(pwd)"
php -S localhost:8080 index.php &
API_PID=$!

echo ""
echo "Serveurs démarrés !"
echo "Frontend: http://localhost:8000"
echo "API: http://localhost:8080"
echo "Test: http://localhost:8000/hello.txt"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter"

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
