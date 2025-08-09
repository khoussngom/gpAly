#!/bin/bash

# Script de test pour l'API Gestionnaire de Cargaisons
# Usage: ./test_api.sh [base_url]

BASE_URL="${1:-http://localhost/api}"
echo "Testing API at: $BASE_URL"
echo "================================"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

print_test() {
    echo -e "\n${YELLOW}🧪 $1${NC}"
}

# Test 1: Créer une cargaison maritime
print_test "Création d'une cargaison maritime"
CARGAISON_RESPONSE=$(curl -s -X POST "$BASE_URL/cargaisons" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "maritime",
    "distance": 1200,
    "lieu_depart": "Dakar",
    "lieu_arrivee": "Abidjan",
    "client": {
      "nom": "Diallo",
      "prenom": "Amadou",
      "telephone": "+221771234567",
      "adresse": "Rue 10, Dakar",
      "email": "amadou@email.com"
    },
    "produit": {
      "type": "alimentaire",
      "libelle": "Riz blanc",
      "poids": 50,
      "toxicite": null
    }
  }' 2>/dev/null)

if echo "$CARGAISON_RESPONSE" | grep -q '"success":true'; then
    print_result 0 "Cargaison créée"
    NUMERO_CARGAISON=$(echo "$CARGAISON_RESPONSE" | grep -o '"numero_cargaison":"[^"]*"' | cut -d'"' -f4)
    CODE_COLIS=$(echo "$CARGAISON_RESPONSE" | grep -o '"code_colis":"[^"]*"' | cut -d'"' -f4)
    echo "   Numéro cargaison: $NUMERO_CARGAISON"
    echo "   Code colis: $CODE_COLIS"
else
    print_result 1 "Échec création cargaison"
    echo "   Response: $CARGAISON_RESPONSE"
fi

# Test 2: Ajouter un colis à la cargaison
if [ ! -z "$NUMERO_CARGAISON" ]; then
    print_test "Ajout d'un colis à la cargaison"
    COLIS_RESPONSE=$(curl -s -X POST "$BASE_URL/colis" \
      -H "Content-Type: application/json" \
      -d "{
        \"cargaison_numero\": \"$NUMERO_CARGAISON\",
        \"client\": {
          \"nom\": \"Sow\",
          \"prenom\": \"Fatou\",
          \"telephone\": \"+221771234568\",
          \"adresse\": \"Avenue Bourguiba, Dakar\"
        },
        \"produit\": {
          \"type\": \"fragile\",
          \"libelle\": \"Ordinateur portable\",
          \"poids\": 2.5
        }
      }" 2>/dev/null)
    
    if echo "$COLIS_RESPONSE" | grep -q '"success":true'; then
        print_result 0 "Colis ajouté"
        CODE_COLIS_2=$(echo "$COLIS_RESPONSE" | grep -o '"code_colis":"[^"]*"' | cut -d'"' -f4)
        echo "   Code colis 2: $CODE_COLIS_2"
    else
        print_result 1 "Échec ajout colis"
        echo "   Response: $COLIS_RESPONSE"
    fi
fi

# Test 3: Rechercher des cargaisons
print_test "Recherche de cargaisons"
SEARCH_RESPONSE=$(curl -s "$BASE_URL/cargaisons?type=maritime" 2>/dev/null)
if echo "$SEARCH_RESPONSE" | grep -q '"success":true'; then
    print_result 0 "Recherche de cargaisons"
    NB_CARGAISONS=$(echo "$SEARCH_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "   Nombre trouvé: $NB_CARGAISONS"
else
    print_result 1 "Échec recherche cargaisons"
fi

# Test 4: Obtenir une cargaison spécifique
if [ ! -z "$NUMERO_CARGAISON" ]; then
    print_test "Obtention des détails d'une cargaison"
    DETAIL_RESPONSE=$(curl -s "$BASE_URL/cargaisons/$NUMERO_CARGAISON" 2>/dev/null)
    if echo "$DETAIL_RESPONSE" | grep -q '"success":true'; then
        print_result 0 "Détails de la cargaison"
    else
        print_result 1 "Échec obtention détails cargaison"
    fi
fi

# Test 5: Suivi d'un colis
if [ ! -z "$CODE_COLIS" ]; then
    print_test "Suivi d'un colis"
    SUIVI_RESPONSE=$(curl -s "$BASE_URL/suivi/$CODE_COLIS" 2>/dev/null)
    if echo "$SUIVI_RESPONSE" | grep -q '"success":true'; then
        print_result 0 "Suivi du colis"
        ETAT=$(echo "$SUIVI_RESPONSE" | grep -o '"etat_actuel":"[^"]*"' | cut -d'"' -f4)
        echo "   État actuel: $ETAT"
    else
        print_result 1 "Échec suivi colis"
    fi
fi

# Test 6: Générer un reçu
if [ ! -z "$CODE_COLIS" ]; then
    print_test "Génération d'un reçu"
    RECU_RESPONSE=$(curl -s "$BASE_URL/colis/$CODE_COLIS/recu" 2>/dev/null)
    if echo "$RECU_RESPONSE" | grep -q '"success":true'; then
        print_result 0 "Reçu généré"
        NUMERO_RECU=$(echo "$RECU_RESPONSE" | grep -o '"numero_recu":"[^"]*"' | cut -d'"' -f4)
        echo "   Numéro reçu: $NUMERO_RECU"
    else
        print_result 1 "Échec génération reçu"
    fi
fi

# Test 7: Mettre à jour l'état d'un colis
if [ ! -z "$CODE_COLIS" ]; then
    print_test "Mise à jour de l'état d'un colis (EN_COURS)"
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/colis/$CODE_COLIS/etat" \
      -H "Content-Type: application/json" \
      -d '{"etat": "EN_COURS"}' 2>/dev/null)
    
    if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
        print_result 0 "État mis à jour"
    else
        print_result 1 "Échec mise à jour état"
    fi
fi

# Test 8: Fermer la cargaison
if [ ! -z "$NUMERO_CARGAISON" ]; then
    print_test "Fermeture de la cargaison"
    FERMER_RESPONSE=$(curl -s -X PUT "$BASE_URL/cargaisons/$NUMERO_CARGAISON/fermer" 2>/dev/null)
    if echo "$FERMER_RESPONSE" | grep -q '"success":true'; then
        print_result 0 "Cargaison fermée"
    else
        print_result 1 "Échec fermeture cargaison"
    fi
fi

# Test 9: Tenter d'ajouter un colis à une cargaison fermée (doit échouer)
if [ ! -z "$NUMERO_CARGAISON" ]; then
    print_test "Test d'ajout à une cargaison fermée (doit échouer)"
    FAIL_RESPONSE=$(curl -s -X POST "$BASE_URL/colis" \
      -H "Content-Type: application/json" \
      -d "{
        \"cargaison_numero\": \"$NUMERO_CARGAISON\",
        \"client\": {
          \"nom\": \"Test\",
          \"prenom\": \"Fail\",
          \"telephone\": \"+221771234569\",
          \"adresse\": \"Test\"
        },
        \"produit\": {
          \"type\": \"alimentaire\",
          \"libelle\": \"Test\",
          \"poids\": 1
        }
      }" 2>/dev/null)
    
    if echo "$FAIL_RESPONSE" | grep -q '"success":false'; then
        print_result 0 "Échec attendu - cargaison fermée"
    else
        print_result 1 "Test échoué - devrait échouer"
    fi
fi

# Test 10: Test de compatibilité produit/transport (produit chimique en aérien - doit échouer)
print_test "Test de compatibilité produit/transport (chimique en aérien - doit échouer)"
COMPAT_RESPONSE=$(curl -s -X POST "$BASE_URL/cargaisons" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "aerienne",
    "distance": 500,
    "lieu_depart": "Dakar",
    "lieu_arrivee": "Casablanca",
    "client": {
      "nom": "Test",
      "prenom": "Compat",
      "telephone": "+221771234570",
      "adresse": "Test"
    },
    "produit": {
      "type": "chimique",
      "libelle": "Produit chimique",
      "poids": 10,
      "toxicite": 5
    }
  }' 2>/dev/null)

if echo "$COMPAT_RESPONSE" | grep -q '"success":false'; then
    print_result 0 "Échec attendu - incompatibilité produit/transport"
else
    print_result 1 "Test échoué - devrait échouer pour incompatibilité"
fi

echo -e "\n${YELLOW}================================${NC}"
echo -e "${YELLOW}Tests terminés${NC}"

# Affichage des données pour les tests manuels
if [ ! -z "$NUMERO_CARGAISON" ] && [ ! -z "$CODE_COLIS" ]; then
    echo -e "\n${YELLOW}Données créées pour tests manuels:${NC}"
    echo "Numéro cargaison: $NUMERO_CARGAISON"
    echo "Code colis: $CODE_COLIS"
    if [ ! -z "$CODE_COLIS_2" ]; then
        echo "Code colis 2: $CODE_COLIS_2"
    fi
    echo ""
    echo "Vous pouvez tester le suivi web à: http://localhost/suivi"
    echo "Et utiliser le code colis: $CODE_COLIS"
fi
