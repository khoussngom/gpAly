#!/bin/bash

# Script d'installation pour l'API Gestionnaire de Cargaisons
# Usage: ./install.sh

echo "🚢 Installation de l'API Gestionnaire de Cargaisons"
echo "=================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Vérification des prérequis
echo "🔍 Vérification des prérequis..."

# Vérifier PHP
if ! command -v php &> /dev/null; then
    echo "❌ PHP n'est pas installé"
    echo "   Installez PHP 8.0 ou supérieur:"
    echo "   Ubuntu/Debian: sudo apt-get install php php-mysql php-json"
    echo "   CentOS/RHEL: sudo yum install php php-pdo php-mysql"
    exit 1
else
    PHP_VERSION=$(php -v | head -n1 | cut -d' ' -f2 | cut -d'.' -f1-2)
    echo "✅ PHP $PHP_VERSION détecté"
fi

# Vérifier MySQL/MariaDB (optionnel pour cette installation)
if command -v mysql &> /dev/null; then
    echo "✅ MySQL/MariaDB détecté"
elif command -v mariadb &> /dev/null; then
    echo "✅ MariaDB détecté"
else
    echo "⚠️  MySQL/MariaDB non détecté"
    echo "   L'API fonctionnera mais vous devrez configurer la base de données manuellement"
fi

echo ""

# Copier le fichier de configuration
echo "📝 Configuration..."

if [ ! -f "config_local.php" ]; then
    echo "Création du fichier de configuration local..."
    cp config_example.php config_local.php
    echo "✅ Fichier config_local.php créé"
    echo "   Modifiez-le selon votre environnement"
else
    echo "⚠️  config_local.php existe déjà"
fi

# Vérifier les permissions
echo ""
echo "🔧 Vérification des permissions..."

chmod +x start_server.sh
chmod +x test_api.sh
echo "✅ Scripts rendus exécutables"

# Instructions pour la base de données
echo ""
echo "🗄️  Configuration de la base de données"
echo "======================================="
echo ""
echo "1. Créez une base de données MySQL/MariaDB:"
echo "   mysql -u root -p"
echo "   CREATE DATABASE gestion_cargaison CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "   CREATE USER 'cargaison_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';"
echo "   GRANT ALL PRIVILEGES ON gestion_cargaison.* TO 'cargaison_user'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo "   exit"
echo ""
echo "2. Importez le schéma de base de données:"
echo "   mysql -u root -p gestion_cargaison < database.sql"
echo ""
echo "3. Modifiez le fichier config_local.php avec vos paramètres de connexion"
echo ""

# Instructions de démarrage
echo "🚀 Instructions de démarrage"
echo "============================="
echo ""
echo "1. Démarrez le serveur:"
echo "   ./start_server.sh [port]"
echo ""
echo "2. Testez l'API:"
echo "   ./test_api.sh http://localhost:8080/api"
echo ""
echo "3. Accédez aux interfaces:"
echo "   - API: http://localhost:8080/api/"
echo "   - Suivi: http://localhost:8080/suivi"
echo "   - Documentation: http://localhost:8080/api/README.md"
echo ""

# Vérification finale
echo "✅ Installation terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Configurez votre base de données"
echo "2. Modifiez config_local.php"
echo "3. Lancez ./start_server.sh"
echo "4. Testez avec ./test_api.sh"
echo ""
echo "📖 Consultez README.md pour la documentation complète"

# Offrir de démarrer automatiquement
echo ""
read -p "Voulez-vous démarrer le serveur maintenant? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Démarrage du serveur..."
    ./start_server.sh
fi
