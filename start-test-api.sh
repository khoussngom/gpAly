#!/bin/bash

echo "🚀 Démarrage du test avec données API réelles"
echo "=============================================="

# Vérification de Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Vérification de json-server
if ! command -v json-server &> /dev/null; then
    echo "📦 Installation de json-server..."
    npm install -g json-server
fi

# Compilation TypeScript
echo "🔨 Compilation TypeScript..."
cd "$(dirname "$0")"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur de compilation"
    exit 1
fi

echo "✅ Compilation réussie"

# Démarrage du serveur JSON en arrière-plan
echo "🗄️ Démarrage du serveur JSON (port 3002)..."
cd json-server
json-server --watch db.json --port 3002 &
JSON_PID=$!
cd ..

# Attendre que le serveur se lance
sleep 2

# Démarrage du serveur web pour les fichiers statiques
echo "🌐 Démarrage du serveur web (port 8080)..."
python3 -m http.server 8080 --directory public &
WEB_PID=$!

echo ""
echo "🎉 Serveurs démarrés avec succès!"
echo ""
echo "📋 Accès aux tests:"
echo "   • Page de test API:     http://localhost:8080/test-api-data.html"
echo "   • Application complète: http://localhost:8080/index.html"
echo "   • API JSON:             http://localhost:3002"
echo ""
echo "📦 Données disponibles:"
echo "   • 5 cargaisons (Maritime, Aérienne, Routière)"
echo "   • 5 colis avec différents états"
echo "   • Coordonnées géographiques"
echo ""
echo "🧪 Tests à effectuer:"
echo "   ✓ Affichage des détails (modals dynamiques)"
echo "   ✓ Édition en ligne (formulaires pré-remplis)"
echo "   ✓ Suppression sécurisée (avec confirmation)"
echo "   ✓ Gestion des relations (colis ↔ cargaisons)"
echo ""
echo "⚠️  ATTENTION: Les suppressions sont réelles dans db.json"
echo ""
echo "🛑 Pour arrêter: Ctrl+C"

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt des serveurs..."
    kill $JSON_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    echo "✅ Serveurs arrêtés"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Attendre indéfiniment
wait
