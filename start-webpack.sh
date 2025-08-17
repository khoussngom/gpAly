#!/bin/bash

echo "🚀 Démarrage rapide du serveur de développement"
echo "=============================================="

# Se placer dans le répertoire du projet
cd "$(dirname "$0")"

# Tuer les processus webpack existants
echo "🧹 Nettoyage des processus webpack..."
pkill -f "webpack.*serve" 2>/dev/null || true
sleep 1

# Compilation
echo "🔨 Compilation..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur de compilation"
    exit 1
fi

echo "✅ Compilation réussie"

# Démarrage du serveur de développement
echo "🌐 Démarrage du serveur webpack (port 3004)..."
npm run dev

echo "🎉 Serveur accessible sur http://localhost:3004"
