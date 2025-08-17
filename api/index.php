<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


$jsonDbPath = '../json-server/db.json';
$jsonServerUrl = 'http://localhost:3002';


class Router {
    private $routes = [];
    private $jsonDbPath;
    private $jsonServerUrl;
    
    public function __construct($jsonDbPath, $jsonServerUrl) {
        $this->jsonDbPath = $jsonDbPath;
        $this->jsonServerUrl = $jsonServerUrl;
    }
    
    public function addRoute($method, $pattern, $callback) {
        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'callback' => $callback
        ];
    }
    
    public function dispatch() {
        $requestUri = $_SERVER['REQUEST_URI'];
        $requestMethod = $_SERVER['REQUEST_METHOD'];
        

        $path = parse_url($requestUri, PHP_URL_PATH);
        $path = str_replace('/api', '', $path);
        
        foreach ($this->routes as $route) {
            if ($route['method'] === $requestMethod && preg_match($route['pattern'], $path, $matches)) {

                array_shift($matches);
                return call_user_func_array($route['callback'], $matches);
            }
        }
        

        http_response_code(404);
        echo json_encode(['error' => 'Route non trouvée']);
    }
    
    public function readJsonDb() {
        if (!file_exists($this->jsonDbPath)) {
            return null;
        }
        
        $content = file_get_contents($this->jsonDbPath);
        return json_decode($content, true);
    }
    
    public function writeJsonDb($data) {
        return file_put_contents($this->jsonDbPath, json_encode($data, JSON_PRETTY_PRINT));
    }
    
    public function proxyToJsonServer($endpoint, $method = 'GET', $data = null) {
        $url = $this->jsonServerUrl . $endpoint;
        
        $options = [
            'http' => [
                'method' => $method,
                'header' => 'Content-Type: application/json',
                'content' => $data ? json_encode($data) : null
            ]
        ];
        
        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        
        return $result ? json_decode($result, true) : null;
    }
}


$router = new Router($jsonDbPath, $jsonServerUrl);



$router->addRoute('POST', '/^\/auth\/login$/', function() use ($router) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['login']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Login et mot de passe requis']);
        return;
    }
    
    $db = $router->readJsonDb();
    if (!$db) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur de base de données']);
        return;
    }
    

    $admin = null;
    foreach ($db['admins'] as $a) {
        if ($a['login'] === $input['login'] && $a['password'] === $input['password'] && $a['actif']) {
            $admin = $a;
            break;
        }
    }
    
    if (!$admin) {
        http_response_code(401);
        echo json_encode(['error' => 'Identifiants invalides']);
        return;
    }
    

    $sessionId = uniqid('sess_', true);
    $session = [
        'id' => $sessionId,
        'admin_id' => $admin['id'],
        'login' => $admin['login'],
        'role' => $admin['role'],
        'dateConnexion' => date('c'),
        'lastActivity' => date('c'),
        'expires' => date('c', strtotime('+24 hours'))
    ];
    

    $db['sessions'][] = $session;
    

    foreach ($db['admins'] as &$a) {
        if ($a['id'] === $admin['id']) {
            $a['dernierConnexion'] = date('c');
            break;
        }
    }
    
    $router->writeJsonDb($db);
    

    unset($admin['password']);
    echo json_encode([
        'success' => true,
        'sessionId' => $sessionId,
        'admin' => $admin,
        'expires' => $session['expires']
    ]);
});


$router->addRoute('POST', '/^\/auth\/logout$/', function() use ($router) {
    $headers = getallheaders();
    $sessionId = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
    
    if (!$sessionId) {
        http_response_code(400);
        echo json_encode(['error' => 'Session ID requis']);
        return;
    }
    
    $db = $router->readJsonDb();
    if (!$db) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur de base de données']);
        return;
    }
    

    $db['sessions'] = array_filter($db['sessions'], function($s) use ($sessionId) {
        return $s['id'] !== $sessionId;
    });
    
    $router->writeJsonDb($db);
    
    echo json_encode(['success' => true, 'message' => 'Déconnexion réussie']);
});


$router->addRoute('GET', '/^\/auth\/verify$/', function() use ($router) {
    $headers = getallheaders();
    $sessionId = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
    
    if (!$sessionId) {
        http_response_code(401);
        echo json_encode(['error' => 'Non authentifié']);
        return;
    }
    
    $db = $router->readJsonDb();
    if (!$db) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur de base de données']);
        return;
    }
    

    $session = null;
    foreach ($db['sessions'] as &$s) {
        if ($s['id'] === $sessionId) {

            if (strtotime($s['expires']) > time()) {
                $session = $s;

                $s['lastActivity'] = date('c');
                break;
            }
        }
    }
    
    if (!$session) {
        http_response_code(401);
        echo json_encode(['error' => 'Session expirée']);
        return;
    }
    

    $admin = null;
    foreach ($db['admins'] as $a) {
        if ($a['id'] === $session['admin_id']) {
            $admin = $a;
            break;
        }
    }
    
    if (!$admin || !$admin['actif']) {
        http_response_code(401);
        echo json_encode(['error' => 'Admin non trouvé ou inactif']);
        return;
    }
    
    $router->writeJsonDb($db);
    
    unset($admin['password']);
    echo json_encode([
        'success' => true,
        'admin' => $admin,
        'session' => $session
    ]);
});




$router->addRoute('GET', '/^\/colis\/search\/(.+)$/', function($code) use ($router) {
    $colis = $router->proxyToJsonServer('/colis?code=' . urlencode($code));
    
    if ($colis && count($colis) > 0) {
        echo json_encode([
            'success' => true,
            'colis' => $colis[0]
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Colis non trouvé'
        ]);
    }
});

function requireAuth($router) {
    $headers = getallheaders();
    $sessionId = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
    
    if (!$sessionId) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentification requise']);
        exit;
    }
    
    $db = $router->readJsonDb();
    if (!$db) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur de base de données']);
        exit;
    }
    
    $session = null;
    foreach ($db['sessions'] as $s) {
        if ($s['id'] === $sessionId && strtotime($s['expires']) > time()) {
            $session = $s;
            break;
        }
    }
    
    if (!$session) {
        http_response_code(401);
        echo json_encode(['error' => 'Session expirée']);
        exit;
    }
    
    return $session;
}


$router->addRoute('GET', '/^\/cargaisons$/', function() use ($router) {
    requireAuth($router);
    $cargaisons = $router->proxyToJsonServer('/cargaisons');
    echo json_encode($cargaisons ?: []);
});

$router->addRoute('GET', '/^\/colis$/', function() use ($router) {
    requireAuth($router);
    $colis = $router->proxyToJsonServer('/colis');
    echo json_encode($colis ?: []);
});

$router->addRoute('POST', '/^\/cargaisons$/', function() use ($router) {
    requireAuth($router);
    $input = json_decode(file_get_contents('php://input'), true);
    $result = $router->proxyToJsonServer('/cargaisons', 'POST', $input);
    echo json_encode($result);
});

$router->addRoute('POST', '/^\/colis$/', function() use ($router) {
    requireAuth($router);
    $input = json_decode(file_get_contents('php://input'), true);
    $result = $router->proxyToJsonServer('/colis', 'POST', $input);
    echo json_encode($result);
});

$router->addRoute('GET', '/^\/$/', function() {
    echo json_encode([
        'name' => 'API Gestionnaire de Cargaisons',
        'version' => '2.0',
        'description' => 'API avec système d\'authentification pour la gestion des cargaisons',
        'endpoints' => [
            'public' => [
                'GET /colis/search/{code}' => 'Rechercher un colis par code'
            ],
            'auth' => [
                'POST /auth/login' => 'Connexion admin',
                'POST /auth/logout' => 'Déconnexion',
                'GET /auth/verify' => 'Vérifier la session'
            ],
            'protected' => [
                'GET /cargaisons' => 'Lister les cargaisons',
                'POST /cargaisons' => 'Créer une cargaison',
                'GET /colis' => 'Lister les colis',
                'POST /colis' => 'Créer un colis'
            ]
        ]
    ]);
});

$router->dispatch();
?>
