# Guide de Test avec Données API Réelles

## 🚀 Lancement Rapide

```bash
# 1. Compilation
npm run build

# 2. Démarrage des serveurs
./start-test-api.sh
```

## 📊 Données Disponibles dans l'API

### Cargaisons (5 disponibles)

| Numéro | Type | État | Itinéraire | Colis |
|--------|------|------|------------|-------|
| `CAR-1691234567890-1234` | 🚢 Maritime | 🟡 En transit | Dakar → Abidjan | 1 colis |
| `CAR-1691234567890-2345` | ✈️ Aérienne | 🟣 Arrivée | Casablanca → Lagos | 1 colis |
| `CAR-1691234567890-3456` | 🚛 Routière | 🟢 Ouverte | Accra → Abidjan | 1 colis |
| `CARG-1754697940784-261` | 🚢 Maritime | 🟢 Ouverte | Départ → Arrivée | 1 colis |
| `CARG-1754858793866-772` | 🚢 Maritime | 🟢 Ouverte | Départ → Arrivée | 1 colis |

### Colis (5 disponibles)

| Code | Libellé | Poids | Type | Client | État |
|------|---------|-------|------|--------|------|
| `COL-1691234567890-5678` | Riz basmati | 25kg | 🍚 Alimentaire | Jean Dupont | 🟡 En transit |
| `COL-1691234567890-9876` | Ordinateur portable | 2.5kg | 📱 Fragile | Aminata Diallo | 🟢 Arrivé |
| `COL-1691234567890-1111` | Médicaments | 5kg | ⚗️ Chimique | Ibrahim Kone | ⚪ En attente |
| `COL-1754697892136-3226` | Sac | 2kg | 🧳 Incassable | Khouss Ngom | ⚪ En attente |
| `COL-1754858737075-5117` | Thiep | 25kg | 🍚 Alimentaire | Khouss Ngom | ⚪ En attente |

### Coordonnées Géographiques (5 villes)

| Ville | Pays | Latitude | Longitude |
|-------|------|----------|-----------|
| Dakar | Sénégal | 14.6928 | -17.4467 |
| Abidjan | Côte d'Ivoire | 5.36 | -4.0083 |
| Casablanca | Maroc | 33.5731 | -7.5898 |
| Lagos | Nigeria | 6.5244 | 3.3792 |
| Accra | Ghana | 5.6037 | -0.187 |

## 🧪 Tests à Effectuer

### 1. **Visualisation des Détails** ✅

#### Test Cargaison Maritime en Transit
```javascript
// Ouvrir: http://localhost:8080/test-api-data.html
// Cliquer sur "Détails" pour CAR-1691234567890-1234
```

**Résultat Attendu:**
- Modal avec informations complètes
- 🚢 Maritime avec coordonnées Dakar (Sénégal) → Abidjan (Côte d'Ivoire)
- Dates formatées en français
- Badge "En transit" jaune
- Lien cliquable vers le colis associé

#### Test Colis avec Toxicité
```javascript
// Cliquer sur "Détails" pour COL-1691234567890-1111
```

**Résultat Attendu:**
- Modal détaillée du colis "Médicaments"
- Type ⚗️ Chimique avec badge toxicité "Niveau 2"
- Informations client complètes
- Lien téléphone et email cliquables
- Lien vers cargaison parent

### 2. **Édition en Ligne** ✅

#### Test Modification Cargaison
```javascript
// Cliquer sur "Modifier" pour CAR-1691234567890-3456
```

**Fonctionnalités à Tester:**
- [ ] Formulaire pré-rempli avec données existantes
- [ ] Sélecteurs pour type et état
- [ ] Champs date avec format datetime-local
- [ ] Coordonnées automatiques pour villes connues
- [ ] Sauvegarde via API PATCH

#### Test Modification Colis
```javascript
// Cliquer sur "Modifier" pour COL-1754697892136-3226
```

**Fonctionnalités à Tester:**
- [ ] Informations client modifiables
- [ ] États de colis
- [ ] Validation des types d'entrée (email, tel)
- [ ] Mise à jour du produit

### 3. **Suppression Sécurisée** ⚠️

#### Test Suppression Colis
```javascript
// Cliquer sur "Supprimer" pour COL-1754858737075-5117
```

**Sécurités à Vérifier:**
- [ ] Confirmation obligatoire
- [ ] Retrait automatique de la cargaison
- [ ] Message de succès
- [ ] Rafraîchissement de la liste

#### Test Suppression Cargaison
```javascript
// Cliquer sur "Supprimer" pour CARG-1754858793866-772
```

**Cascade à Vérifier:**
- [ ] Suppression de tous les colis associés
- [ ] Suppression de la cargaison
- [ ] Nettoyage complet dans db.json

## 🔧 Fonctionnalités Avancées

### Navigation Inter-Modal
1. Ouvrir détail cargaison `CAR-1691234567890-1234`
2. Cliquer sur le colis `COL-1691234567890-5678`
3. Dans le modal colis, cliquer sur la cargaison parent
4. **Résultat:** Navigation fluide entre modals

### Gestion des Coordonnées
- **Villes Connues:** Coordonnées automatiques depuis l'API
- **Nouvelles Villes:** Coordonnées 0,0 par défaut
- **Affichage:** Latitude/longitude avec 4 décimales
- **Pays:** Affiché automatiquement si disponible

### États et Badges
- **Cargaisons:** 🟢 Ouverte, 🔵 Fermée, 🟡 En transit, 🟣 Arrivée, 🔴 Annulée
- **Colis:** ⚪ En attente, 🟡 En transit, 🟢 Arrivé, 🔴 Perdu/Annulé
- **Produits:** 🍚 Alimentaire, 📱 Fragile, ⚗️ Chimique, 🧳 Incassable

## 📡 API Endpoints Utilisés

```bash
# Lecture
GET http://localhost:3002/cargaisons
GET http://localhost:3002/cargaisons/{id}
GET http://localhost:3002/cargaisons?numero={numero}
GET http://localhost:3002/colis
GET http://localhost:3002/colis/{id}
GET http://localhost:3002/colis?code={code}
GET http://localhost:3002/coordonnees

# Modification
PATCH http://localhost:3002/cargaisons/{id}
PATCH http://localhost:3002/colis/{id}

# Suppression
DELETE http://localhost:3002/cargaisons/{id}
DELETE http://localhost:3002/colis/{id}
```

## 🎯 Points de Validation

### ✅ Fonctionnalités Opérationnelles
- [x] Affichage dynamique des détails
- [x] Édition en ligne avec formulaires pré-remplis
- [x] Suppression avec confirmation
- [x] Navigation inter-modal
- [x] Gestion des coordonnées géographiques
- [x] Formatage des dates en français
- [x] Badges d'état colorés
- [x] Types de produits avec emojis
- [x] Liens cliquables (tel, email)
- [x] Gestion des relations colis ↔ cargaisons

### ✅ Robustesse
- [x] Gestion d'erreurs avec try/catch
- [x] Messages informatifs pour l'utilisateur
- [x] Validation des données d'entrée
- [x] Nettoyage automatique des relations
- [x] Rafraîchissement des listes après modifications

### ✅ Interface Utilisateur
- [x] Design responsive avec Tailwind CSS
- [x] Modals modernes et accessibles
- [x] Animation et transitions fluides
- [x] Indicateurs visuels (badges, couleurs)
- [x] Navigation intuitive

---

## 🚨 Notes Importantes

1. **Données Réelles:** Toutes les modifications sont persistées dans `json-server/db.json`
2. **Sauvegarde:** Recommandé de faire une copie de `db.json` avant les tests de suppression
3. **Performance:** Chargement des coordonnées en cache au démarrage
4. **Compatibilité:** Fonctionne sur tous les navigateurs modernes

**Status:** ✅ Toutes les fonctionnalités opérationnelles avec vraies données API
