<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration de l'API JSON Server
$JSON_SERVER_URL = 'http://localhost:3002';

// Router simple
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

// Routes
switch ($uri[2] ?? '') {
    case 'cargaisons':
        proxyToJsonServer('/cargaisons');
        break;
    
    case 'colis':
        proxyToJsonServer('/colis');
        break;
    
    case 'coordonnees':
        proxyToJsonServer('/coordonnees');
        break;
    
    case 'geocoding':
        handleGeocoding();
        break;
    
    case 'reverse-geocoding':
        handleReverseGeocoding();
        break;
    
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Route non trouvée']);
        break;
}

function proxyToJsonServer($endpoint) {
    global $JSON_SERVER_URL;
    
    $method = $_SERVER['REQUEST_METHOD'];
    $url = $JSON_SERVER_URL . $endpoint;
    
    // Ajouter les paramètres de requête pour GET
    if ($method === 'GET' && !empty($_GET)) {
        $url .= '?' . http_build_query($_GET);
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    // Pour POST/PUT/PATCH, ajouter les données
    if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
        $input = file_get_contents('php://input');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($input)
        ]);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    http_response_code($httpCode);
    echo $response;
}

function handleGeocoding() {
    $query = $_GET['q'] ?? '';
    
    if (empty($query)) {
        http_response_code(400);
        echo json_encode(['error' => 'Paramètre q requis']);
        return;
    }
    
    // Utiliser une API de géocodage (exemple avec Nominatim - OpenStreetMap)
    $url = "https://nominatim.openstreetmap.org/search?format=json&q=" . urlencode($query) . "&limit=5";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'CargaisonApp/1.0');
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        $results = [];
        
        foreach ($data as $item) {
            $results[] = [
                'display_name' => $item['display_name'],
                'latitude' => floatval($item['lat']),
                'longitude' => floatval($item['lon'])
            ];
        }
        
        echo json_encode($results);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors du géocodage']);
    }
}

function handleReverseGeocoding() {
    $lat = $_GET['lat'] ?? '';
    $lng = $_GET['lng'] ?? '';
    
    if (empty($lat) || empty($lng)) {
        http_response_code(400);
        echo json_encode(['error' => 'Paramètres lat et lng requis']);
        return;
    }
    
    // Utiliser l'API de géocodage inverse (Nominatim)
    $url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" . urlencode($lat) . "&lon=" . urlencode($lng);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'CargaisonApp/1.0');
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data && isset($data['display_name'])) {
            echo json_encode([
                'display_name' => $data['display_name'],
                'latitude' => floatval($lat),
                'longitude' => floatval($lng)
            ]);
        } else {
            echo json_encode([
                'display_name' => "Lieu inconnu ($lat, $lng)",
                'latitude' => floatval($lat),
                'longitude' => floatval($lng)
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors du géocodage inverse']);
    }
}
?>
