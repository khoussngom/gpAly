# Configuration de la Base de Données
# Copiez ce fichier vers config_local.php et modifiez les valeurs selon votre environnement

<?php
// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'gestion_cargaison');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Configuration de l'application
define('API_VERSION', '1.0.0');
define('DEBUG_MODE', true);

// URLs et chemins
define('BASE_URL', 'http://localhost:8080');
define('API_BASE_URL', BASE_URL . '/api');

// Paramètres métier
define('PRIX_MINIMUM_COLIS', 10000); // FCFA
define('MAX_COLIS_PAR_CARGAISON', 10);
define('DELAI_ARCHIVAGE_JOURS', 30);

// Email/SMS (pour notifications futures)
define('SMTP_HOST', '');
define('SMTP_PORT', 587);
define('SMTP_USER', '');
define('SMTP_PASS', '');

define('SMS_API_KEY', '');
define('SMS_SENDER', 'CARGAISON');

?>
