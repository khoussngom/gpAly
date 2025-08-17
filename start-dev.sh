#!/bin/bash

echo "🚀 Démarrage de l'environnement de développement"
echo "================================================"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de nettoyage
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt des serveurs...${NC}"
    if [ ! -z "$JSON_PID" ]; then
        kill $JSON_PID 2>/dev/null
        echo -e "${GREEN}✅ Serveur JSON arrêté${NC}"
    fi
    if [ ! -z "$WEBPACK_PID" ]; then
        kill $WEBPACK_PID 2>/dev/null
        echo -e "${GREEN}✅ Serveur Webpack arrêté${NC}"
    fi
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Vérification des dépendances
echo -e "${BLUE}🔍 Vérification des dépendances...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js et npm disponibles${NC}"

# Se placer dans le répertoire du projet
cd "$(dirname "$0")"

# Vérification que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json non trouvé. Êtes-vous dans le bon répertoire ?${NC}"
    exit 1
fi

# Compilation TypeScript
echo -e "\n${BLUE}🔨 Compilation TypeScript...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur de compilation${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Compilation réussie${NC}"

# Vérification du répertoire json-server
if [ ! -d "json-server" ]; then
    echo -e "${RED}❌ Répertoire json-server non trouvé${NC}"
    exit 1
fi

if [ ! -f "json-server/db.json" ]; then
    echo -e "${RED}❌ Fichier db.json non trouvé${NC}"
    exit 1
fi

# Tuer les processus existants sur les ports
echo -e "\n${BLUE}🧹 Nettoyage des ports...${NC}"

# Port 3002 (JSON Server)
JSON_EXISTING=$(lsof -ti:3002)
if [ ! -z "$JSON_EXISTING" ]; then
    echo -e "${YELLOW}⚠️ Port 3002 occupé, arrêt du processus...${NC}"
    kill $JSON_EXISTING 2>/dev/null
    sleep 1
fi

# Port 3003 (Webpack)
WEBPACK_EXISTING=$(lsof -ti:3003)
if [ ! -z "$WEBPACK_EXISTING" ]; then
    echo -e "${YELLOW}⚠️ Port 3003 occupé, arrêt du processus...${NC}"
    kill $WEBPACK_EXISTING 2>/dev/null
    sleep 1
fi

echo -e "${GREEN}✅ Ports nettoyés${NC}"

# Démarrage du serveur JSON
echo -e "\n${BLUE}🗄️ Démarrage du serveur JSON (port 3002)...${NC}"
cd json-server

# Vérifier si json-server est installé globalement ou localement
if command -v json-server &> /dev/null; then
    json-server --watch db.json --port 3002 --host 0.0.0.0 &
    JSON_PID=$!
elif [ -f "../node_modules/.bin/json-server" ]; then
    ../node_modules/.bin/json-server --watch db.json --port 3002 --host 0.0.0.0 &
    JSON_PID=$!
else
    echo -e "${RED}❌ json-server non trouvé. Installation...${NC}"
    npm install -g json-server
    json-server --watch db.json --port 3002 --host 0.0.0.0 &
    JSON_PID=$!
fi

# Attendre que le serveur JSON démarre
sleep 3

# Vérifier que le serveur JSON fonctionne
if kill -0 $JSON_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Serveur JSON démarré (PID: $JSON_PID)${NC}"
else
    echo -e "${RED}❌ Échec du démarrage du serveur JSON${NC}"
    exit 1
fi

# Retourner au répertoire principal
cd ..

# Démarrage du serveur Webpack
echo -e "\n${BLUE}🌐 Démarrage du serveur Webpack (port 3003)...${NC}"
npm run dev &
WEBPACK_PID=$!

# Attendre que le serveur Webpack démarre
sleep 5

# Vérifier que le serveur Webpack fonctionne
if kill -0 $WEBPACK_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Serveur Webpack démarré (PID: $WEBPACK_PID)${NC}"
else
    echo -e "${RED}❌ Échec du démarrage du serveur Webpack${NC}"
    cleanup
    exit 1
fi

# Test de connectivité
echo -e "\n${BLUE}🔗 Test de connectivité...${NC}"

# Test API
sleep 2
if curl -s http://localhost:3002/cargaisons > /dev/null; then
    echo -e "${GREEN}✅ API JSON Server accessible${NC}"
else
    echo -e "${YELLOW}⚠️ API JSON Server non accessible (normal si démarrage en cours)${NC}"
fi

# Affichage des informations finales
echo -e "\n${GREEN}🎉 Environnement de développement démarré avec succès !${NC}"
echo -e "\n${BLUE}📋 Informations d'accès :${NC}"
echo -e "   🌐 Application web:        ${GREEN}http://localhost:3003${NC}"
echo -e "   🧪 Page de test API:       ${GREEN}http://localhost:3003/test-api-data.html${NC}"
echo -e "   📊 API JSON Server:        ${GREEN}http://localhost:3002${NC}"
echo -e "   📄 Interface API:          ${GREEN}http://localhost:3002/cargaisons${NC}"
echo -e "\n${BLUE}📦 Données disponibles :${NC}"
echo -e "   • 5 cargaisons (Maritime, Aérienne, Routière)"
echo -e "   • 5 colis avec différents états"
echo -e "   • 5 villes avec coordonnées géographiques"
echo -e "\n${BLUE}🧪 Fonctionnalités à tester :${NC}"
echo -e "   ✓ Affichage dynamique des détails"
echo -e "   ✓ Édition en ligne avec formulaires"
echo -e "   ✓ Suppression sécurisée avec confirmation"
echo -e "   ✓ Navigation inter-modal"
echo -e "   ✓ Gestion des coordonnées géographiques"
echo -e "\n${YELLOW}⚠️ ATTENTION :${NC}"
echo -e "   Les modifications sont sauvegardées dans db.json"
echo -e "   Faites une copie de sauvegarde si nécessaire"
echo -e "\n${BLUE}🛑 Pour arrêter : Ctrl+C${NC}"

# Attendre indéfiniment
wait
