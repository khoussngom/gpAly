<?php
require_once 'config.php';

// Gestionnaire de routes principal
class Router {
    private $routes = [];

    public function addRoute($method, $pattern, $handler) {
        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'handler' => $handler
        ];
    }

    public function dispatch() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $path = trim($path, '/');

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;

            $pattern = str_replace('/', '\/', $route['pattern']);
            $pattern = preg_replace('/\{([^}]+)\}/', '([^\/]+)', $pattern);
            $pattern = '/^' . $pattern . '$/';

            if (preg_match($pattern, $path, $matches)) {
                array_shift($matches); // Retirer le match complet
                call_user_func_array($route['handler'], $matches);
                return;
            }
        }

        sendError('Route non trouvée', 404);
    }
}

// Initialisation du routeur
$router = new Router();

// ==================== ROUTES CARGAISONS ====================
// Créer une nouvelle cargaison
$router->addRoute('POST', 'api/cargaisons', 'createCargaison');
// Obtenir toutes les cargaisons avec filtres optionnels
$router->addRoute('GET', 'api/cargaisons', 'getCargaisons');
// Obtenir une cargaison par numéro
$router->addRoute('GET', 'api/cargaisons/{numero}', 'getCargaisonByNumero');
// Fermer une cargaison
$router->addRoute('PUT', 'api/cargaisons/{numero}/fermer', 'fermerCargaison');
// Rouvrir une cargaison
$router->addRoute('PUT', 'api/cargaisons/{numero}/rouvrir', 'rouvrirCargaison');
// Mettre à jour l'état d'avancement d'une cargaison
$router->addRoute('PUT', 'api/cargaisons/{numero}/etat', 'updateEtatCargaison');

// ==================== ROUTES COLIS ====================
// Créer un nouveau colis
$router->addRoute('POST', 'api/colis', 'createColis');
// Rechercher un colis par code
$router->addRoute('GET', 'api/colis/{code}', 'getColisByCode');
// Rechercher des colis avec filtres
$router->addRoute('GET', 'api/colis', 'getColis');
// Mettre à jour l'état d'un colis
$router->addRoute('PUT', 'api/colis/{code}/etat', 'updateEtatColis');
// Marquer un colis comme récupéré
$router->addRoute('PUT', 'api/colis/{code}/recuperer', 'recupererColis');
// Marquer un colis comme perdu
$router->addRoute('PUT', 'api/colis/{code}/perdu', 'marquerPerdu');
// Archiver un colis manuellement
$router->addRoute('PUT', 'api/colis/{code}/archiver', 'archiverColis');
// Annuler un colis
$router->addRoute('PUT', 'api/colis/{code}/annuler', 'annulerColis');
// Générer un reçu pour un colis
$router->addRoute('GET', 'api/colis/{code}/recu', 'genererRecu');

// ==================== ROUTES SUIVI ====================
// Suivi d'un colis (accessible sans authentification)
$router->addRoute('GET', 'api/suivi/{code}', 'suivreColis');

// ==================== ROUTES CLIENTS ====================
// Créer un nouveau client
$router->addRoute('POST', 'api/clients', 'createClient');
// Obtenir tous les clients
$router->addRoute('GET', 'api/clients', 'getClients');
// ==================== FONCTIONS POUR LES ROUTES ====================

// Inclure les fichiers de traitement
require_once 'cargaisons.php';
require_once 'colis.php';
require_once 'suivi.php';

// Fonctions pour les cargaisons
function createCargaison() {
    $input = json_decode(file_get_contents('php://input'), true);
    return creerCargaison($input);
}

function getCargaisons() {
    return rechercherCargaisons($_GET);
}

function getCargaisonByNumero($numero) {
    return obtenirCargaison($numero);
}

function fermerCargaison($numero) {
    return fermerCargaisonParNumero($numero);
}

function rouvrirCargaison($numero) {
    return rouvrirCargaisonParNumero($numero);
}

function updateEtatCargaison($numero) {
    $input = json_decode(file_get_contents('php://input'), true);
    return mettreAJourEtatCargaison($numero, $input);
}

// Fonctions pour les colis
function createColis() {
    $input = json_decode(file_get_contents('php://input'), true);
    return creerColis($input);
}

function getColisByCode($code) {
    return obtenirColisByCode($code);
}

function getColis() {
    return rechercherColis($_GET);
}

function updateEtatColis($code) {
    $input = json_decode(file_get_contents('php://input'), true);
    return mettreAJourEtatColis($code, $input);
}

function recupererColis($code) {
    return marquerColisRecupere($code);
}

function marquerPerdu($code) {
    return marquerColisPerdu($code);
}

function archiverColis($code) {
    return archiverColisManuel($code);
}

function annulerColis($code) {
    return annulerColisParCode($code);
}

function genererRecu($code) {
    return genererRecuColis($code);
}

// Fonctions pour le suivi
function suivreColis($code) {
    return obtenirSuiviColis($code);
}

// Fonctions pour les clients
function createClient() {
    $input = json_decode(file_get_contents('php://input'), true);
    return creerClient($input);
}

function getClients() {
    return obtenirClients($_GET);
}

function getClientById($id) {
    return obtenirClientParId($id);
}

// Dispatch des routes
$router->dispatch();
?>
                'body' => [
                    'type' => 'maritime',
                    'distance' => 1000,
                    'lieu_depart' => [
                        'ville' => 'Dakar',
                        'latitude' => 14.6928,
                        'longitude' => -17.4467
                    ],
                    'lieu_arrivee' => [
                        'ville' => 'Abidjan',
                        'latitude' => 5.3600,
                        'longitude' => -4.0083
                    ],
                    'client' => [
                        'nom' => 'Diallo',
                        'prenom' => 'Amadou',
                        'telephone' => '+221771234567',
                        'adresse' => 'Rue 123, Dakar',
                        'email' => 'amadou@email.com'
                    ],
                    'produit' => [
                        'type' => 'alimentaire',
                        'libelle' => 'Riz parfumé',
                        'poids' => 50
                    ]
                ]
            ]
        ]
    ];
    
    sendResponse($docs);
});

// Lancement du routeur
$router->dispatch();
?>
