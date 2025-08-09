#!/bin/bash

# Script de démarrage pour le serveur API
# Usage: ./start_server.sh [port]

PORT="${1:-8080}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Démarrage du serveur API Gestionnaire de Cargaisons"
echo "📂 Répertoire: $SCRIPT_DIR"
echo "🌐 Port: $PORT"
echo "📋 URL de base: http://localhost:$PORT/api/"
echo "🔍 Page de suivi: http://localhost:$PORT/suivi"
echo ""
echo "📖 Documentation disponible à: http://localhost:$PORT/api/README.md"
echo ""
echo "⚡ Pour tester l'API, utilisez: ./test_api.sh http://localhost:$PORT/api"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo "=================================================="

# Vérifier si PHP est installé
if ! command -v php &> /dev/null; then
    echo "❌ PHP n'est pas installé ou pas dans le PATH"
    exit 1
fi

# Vérifier les extensions PHP requises
echo "🔍 Vérification des extensions PHP..."

check_extension() {
    if php -m | grep -q "$1"; then
        echo "✅ $1"
    else
        echo "❌ $1 (manquante)"
        return 1
    fi
}

MISSING_EXTENSIONS=0

check_extension "pdo" || MISSING_EXTENSIONS=1
check_extension "pdo_mysql" || MISSING_EXTENSIONS=1
check_extension "json" || MISSING_EXTENSIONS=1

if [ $MISSING_EXTENSIONS -eq 1 ]; then
    echo ""
    echo "⚠️  Certaines extensions PHP sont manquantes."
    echo "   Installez-les avec:"
    echo "   sudo apt-get install php-mysql php-json  # Ubuntu/Debian"
    echo "   ou"
    echo "   sudo yum install php-pdo php-mysql      # CentOS/RHEL"
    echo ""
fi

echo ""
echo "🏃 Démarrage du serveur PHP intégré..."

# Démarrer le serveur PHP avec routage personnalisé
cd "$SCRIPT_DIR"
php -S "localhost:$PORT" -t . <<'EOF'
<?php
// Routeur simple pour le serveur PHP intégré

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = urldecode($uri);

// Servir les fichiers statiques
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Route API
if (strpos($uri, '/api/') === 0) {
    // Retirer le préfixe /api/ de l'URI
    $_SERVER['REQUEST_URI'] = substr($_SERVER['REQUEST_URI'], 4);
    require_once 'index.php';
    return true;
}

// Route de suivi
if ($uri === '/suivi' || strpos($uri, '/suivi?') === 0) {
    require_once 'suivi.php';
    return true;
}

// Page d'accueil simple
if ($uri === '/') {
    ?>
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Gestionnaire de Cargaisons</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 min-h-screen flex items-center justify-center">
        <div class="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md">
            <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">
                🚢 API Gestionnaire de Cargaisons
            </h1>
            
            <div class="space-y-4">
                <div class="text-center">
                    <p class="text-gray-600 mb-4">
                        Système de gestion de cargaisons maritimes, aériennes et routières
                    </p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="/api/README.md" class="block p-4 border rounded-lg hover:bg-gray-50">
                        <h3 class="font-semibold text-blue-600">📖 Documentation API</h3>
                        <p class="text-sm text-gray-600">Guide complet des endpoints</p>
                    </a>
                    
                    <a href="/suivi" class="block p-4 border rounded-lg hover:bg-gray-50">
                        <h3 class="font-semibold text-green-600">🔍 Suivi de Colis</h3>
                        <p class="text-sm text-gray-600">Interface publique de suivi</p>
                    </a>
                </div>
                
                <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 class="font-semibold text-blue-800 mb-2">🚀 Endpoints principaux</h3>
                    <ul class="text-sm text-blue-700 space-y-1">
                        <li><code>POST /api/cargaisons</code> - Créer une cargaison</li>
                        <li><code>GET /api/cargaisons</code> - Rechercher des cargaisons</li>
                        <li><code>POST /api/colis</code> - Ajouter un colis</li>
                        <li><code>GET /api/suivi/{code}</code> - Suivre un colis</li>
                    </ul>
                </div>
                
                <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <h3 class="font-semibold text-yellow-800 mb-2">🧪 Test de l'API</h3>
                    <p class="text-sm text-yellow-700">
                        Utilisez le script: <code>./test_api.sh http://localhost:<?= $_SERVER['SERVER_PORT'] ?>/api</code>
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    <?php
    return true;
}

// 404 pour les autres routes
http_response_code(404);
echo json_encode(['error' => 'Route non trouvée', 'uri' => $uri]);
return true;
?>
EOF
