# API Documentation - Gestionnaire de Cargaisons

## Vue d'ensemble

Cette API permet de gérer un système de cargaisons avec les fonctionnalités suivantes :
- Création et gestion des cargaisons (maritime, aérienne, routière)
- Gestion des colis et clients
- Suivi en temps réel des colis
- Génération de reçus
- Archivage automatique

## Base URL

```
http://votre-domaine.com/api/
```

## Authentification

Actuellement, aucune authentification n'est requise pour les APIs de suivi public. 
Les APIs de gestion (création, modification) peuvent être protégées selon vos besoins.

## Endpoints

### 1. Cargaisons

#### POST /api/cargaisons
Créer une nouvelle cargaison avec un premier colis.

**Body:**
```json
{
  "type": "maritime|aerienne|routiere",
  "distance": 1200.5,
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
    "type": "alimentaire|chimique|fragile|incassable",
    "libelle": "Riz blanc",
    "poids": 50.0,
    "toxicite": null
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cargaison créée avec succès",
  "data": {
    "numero_cargaison": "CG20240806001",
    "code_colis": "CL20240806123456",
    "cargaison_id": 1
  }
}
```

#### GET /api/cargaisons
Rechercher des cargaisons avec filtres optionnels.

**Query Parameters:**
- `numero`: Numéro de cargaison (recherche partielle)
- `type`: maritime|aerienne|routiere
- `lieu_depart`: Ville de départ (recherche partielle)
- `lieu_arrivee`: Ville d'arrivée (recherche partielle)
- `date_depart`: Date de départ (YYYY-MM-DD)
- `date_arrivee`: Date d'arrivée (YYYY-MM-DD)
- `etat`: EN_ATTENTE|EN_COURS|ARRIVE|TERMINE
- `est_fermee`: true|false

**Example:**
```
GET /api/cargaisons?type=maritime&lieu_depart=Dakar
```

#### GET /api/cargaisons/{numero}
Obtenir les détails d'une cargaison spécifique.

#### PUT /api/cargaisons/{numero}/fermer
Fermer une cargaison (elle ne peut plus recevoir de nouveaux colis).

#### PUT /api/cargaisons/{numero}/rouvrir
Rouvrir une cargaison (seulement si elle est EN_ATTENTE).

#### PUT /api/cargaisons/{numero}/etat
Mettre à jour l'état d'avancement d'une cargaison.

**Body:**
```json
{
  "etat": "EN_COURS|ARRIVE|TERMINE"
}
```

### 2. Colis

#### POST /api/colis
Créer un nouveau colis et l'ajouter à une cargaison existante.

**Body:**
```json
{
  "cargaison_numero": "CG20240806001",
  "client": {
    "nom": "Sow",
    "prenom": "Fatou",
    "telephone": "+221771234568",
    "adresse": "Avenue Bourguiba, Dakar",
    "email": "fatou@email.com"
  },
  "produit": {
    "type": "fragile",
    "libelle": "Ordinateur portable",
    "poids": 2.5,
    "toxicite": null
  }
}
```

#### GET /api/colis/{code}
Obtenir les détails d'un colis par son code.

#### GET /api/colis
Rechercher des colis avec filtres.

**Query Parameters:**
- `code`: Code du colis (recherche partielle)
- `etat`: État du colis
- `client_telephone`: Téléphone du client
- `cargaison_numero`: Numéro de cargaison
- `type_produit`: Type de produit

#### PUT /api/colis/{code}/etat
Mettre à jour l'état d'un colis.

**Body:**
```json
{
  "etat": "EN_ATTENTE|EN_COURS|ARRIVE|RECUPERE|PERDU|ARCHIVE|ANNULE"
}
```

#### PUT /api/colis/{code}/recuperer
Marquer un colis comme récupéré.

#### PUT /api/colis/{code}/perdu
Marquer un colis comme perdu.

#### PUT /api/colis/{code}/archiver
Archiver un colis manuellement.

#### PUT /api/colis/{code}/annuler
Annuler un colis (seulement si en attente et cargaison ouverte).

#### GET /api/colis/{code}/recu
Générer un reçu pour un colis.

**Response:**
```json
{
  "success": true,
  "data": {
    "numero_recu": "RC20240806001",
    "date_emission": "06/08/2024 14:30",
    "colis": {
      "code": "CL20240806123456",
      "libelle": "Riz blanc",
      "type": "alimentaire",
      "poids": "50 kg",
      "prix": "25 000 FCFA"
    },
    "expediteur": {
      "nom_complet": "Diallo Amadou",
      "telephone": "+221771234567",
      "email": "amadou@email.com",
      "adresse": "Rue 10, Dakar"
    },
    "transport": {
      "numero_cargaison": "CG20240806001",
      "type": "Maritime",
      "depart": "Dakar",
      "arrivee": "Abidjan"
    },
    "instructions": [
      "Le destinataire recevra le code du colis par SMS/Email une fois la cargaison arrivée.",
      "Conservez ce reçu jusqu'à la livraison complète.",
      "Pour le suivi, visitez notre plateforme avec le code: CL20240806123456"
    ]
  }
}
```

### 3. Suivi Public

#### GET /api/suivi/{code}
Obtenir les informations de suivi d'un colis (accessible sans authentification).

**Response:**
```json
{
  "success": true,
  "data": {
    "code_colis": "CL20240806123456",
    "libelle": "Riz blanc",
    "etat_actuel": "EN_COURS",
    "statut_detaille": "En cours - Arrive dans 5 jour(s)",
    "progression": 60,
    "timeline": [
      {
        "etape": "Colis enregistré",
        "statut": "complete",
        "date": "06/08/2024 14:30",
        "description": "Votre colis a été enregistré et ajouté à la cargaison"
      },
      {
        "etape": "Départ effectué",
        "statut": "complete", 
        "date": "07/08/2024 08:00",
        "description": "La cargaison a quitté le point de départ"
      },
      {
        "etape": "En transit",
        "statut": "current",
        "date": null,
        "description": "Votre colis est en cours d'acheminement"
      }
    ],
    "cargaison": {
      "numero": "CG20240806001",
      "type": "Maritime",
      "depart": "Dakar",
      "arrivee": "Abidjan",
      "etat": "EN_COURS"
    },
    "estimation": {
      "type": "on_time",
      "message": "Arrive dans 5 jour(s)",
      "date_estimee": "12/08/2024"
    },
    "alert": []
  }
}
```

### 4. Clients

#### POST /api/clients
Créer un nouveau client.

#### GET /api/clients
Obtenir la liste des clients avec filtres optionnels.

#### GET /api/clients/{id}
Obtenir les détails d'un client avec son historique de colis.

## Codes d'erreur

- `200`: Succès
- `201`: Créé avec succès
- `400`: Erreur de validation des données
- `404`: Ressource non trouvée
- `405`: Méthode non autorisée
- `500`: Erreur serveur

## Exemples d'utilisation

### 1. Créer une cargaison maritime avec un colis

```bash
curl -X POST http://localhost/api/cargaisons \
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
  }'
```

### 2. Ajouter un colis à une cargaison existante

```bash
curl -X POST http://localhost/api/colis \
  -H "Content-Type: application/json" \
  -d '{
    "cargaison_numero": "CG20240806001",
    "client": {
      "nom": "Sow",
      "prenom": "Fatou",
      "telephone": "+221771234568", 
      "adresse": "Avenue Bourguiba, Dakar"
    },
    "produit": {
      "type": "fragile",
      "libelle": "Ordinateur portable",
      "poids": 2.5
    }
  }'
```

### 3. Suivre un colis

```bash
curl http://localhost/api/suivi/CL20240806123456
```

### 4. Marquer un colis comme récupéré

```bash
curl -X PUT http://localhost/api/colis/CL20240806123456/recuperer
```

### 5. Rechercher des cargaisons

```bash
curl "http://localhost/api/cargaisons?type=maritime&lieu_depart=Dakar"
```

### 6. Fermer une cargaison

```bash
curl -X PUT http://localhost/api/cargaisons/CG20240806001/fermer
```

## Interface de suivi public

Une interface web est disponible à l'adresse `/suivi` pour permettre aux clients de suivre leurs colis sans authentification.

## Règles métier importantes

1. **Prix minimum**: Chaque colis a un prix minimum de 10 000 FCFA
2. **Compatibilité produits/transport**:
   - Maritime: tous types de produits (y compris chimiques)
   - Aérienne: alimentaire, fragile, incassable (pas de chimique)
   - Routière: alimentaire, fragile, incassable (pas de chimique)
3. **Limite colis**: Maximum 10 colis par cargaison
4. **États des colis**: EN_ATTENTE → EN_COURS → ARRIVE → RECUPERE/ARCHIVE
5. **Annulation**: Possible uniquement pour les colis EN_ATTENTE dans une cargaison ouverte
6. **Réouverture**: Une cargaison fermée ne peut être rouverte que si elle est EN_ATTENTE
7. **Archivage automatique**: Les colis arrivés sont archivés après 30 jours (configurable)

## Configuration

Les paramètres système sont stockés dans la table `parametres`:
- `delai_archivage_jours`: Délai avant archivage automatique (défaut: 30 jours)
- `prix_minimum`: Prix minimum par colis (défaut: 10000 FCFA)
- `max_colis_par_cargaison`: Maximum de colis par cargaison (défaut: 10)
