echo "Démarrage du Gestionnaire de Cargaisons"
echo "=========================================="

if ! command -v php &> /dev/null; then
    echo "PHP n'est pas installé. Veuillez installer PHP pour continuer."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "Node.js n'est pas installé. Veuillez installer Node.js pour continuer."
    exit 1
fi

cd "$(dirname "$0")"

echo "Installation des dépendances..."

if ! command -v json-server &> /dev/null; then
    echo "Installation de json-server..."
    npm install -g json-server
fi

echo "🗄️ Démarrage du serveur JSON Server..."
cd json-server
json-server --watch db.json --port 3002 &
JSON_SERVER_PID=$!

echo "Démarrage du serveur PHP..."
cd ..
php -S localhost:8000 -t public &
PHP_SERVER_PID=$!

echo ""
echo "Serveurs démarrés avec succès !"
echo ""
echo "Accès à l'application :"
echo "   Interface publique: http://localhost:8000"
echo "   API JSON Server:    http://localhost:3002"
echo ""
echo "Comptes administrateur de test :"
echo "   • admin / admin123 (Super Admin)"
echo "   • manager / manager123 (Manager)"  
echo "   • operateur / operateur123 (Opérateur)"
echo ""
echo "Fonctionnalités disponibles :"
echo "   ✓ Recherche publique de colis"
echo "   ✓ Authentification administrateur avec rôles"
echo "   ✓ Gestion des cargaisons et colis"
echo "   ✓ Système de sessions sécurisé"
echo "   ✓ Interface d'administration complète"
echo ""
echo "Pour arrêter les serveurs, appuyez sur Ctrl+C"

cleanup() {
    echo ""
    echo "Arrêt des serveurs..."
    kill $JSON_SERVER_PID 2>/dev/null
    kill $PHP_SERVER_PID 2>/dev/null
    echo "Serveurs arrêtés. Au revoir !"
    exit 0
}

trap cleanup SIGINT

wait
