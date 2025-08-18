"use strict";
// Fonctions extraites du HTML pour l'interface utilisateur CargoTrack
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusColor = getStatusColor;
exports.getEtatLabel = getEtatLabel;
exports.setActiveMenu = setActiveMenu;
exports.showPublicPage = showPublicPage;
exports.showAdminDashboard = showAdminDashboard;
exports.toggleSidebar = toggleSidebar;
exports.logout = logout;
exports.showDashboard = showDashboard;
exports.showCargaisonsList = showCargaisonsList;
exports.loadCargaisons = loadCargaisons;
exports.displayCargaisonsTable = displayCargaisonsTable;
exports.showColisList = showColisList;
exports.showStats = showStats;
exports.searchColis = searchColis;
exports.showColisDetailFromSearch = showColisDetailFromSearch;
exports.showCreateCargaison = showCreateCargaison;
exports.showCreateColis = showCreateColis;
exports.editCargaison = editCargaison;
exports.editColis = editColis;
exports.deleteCargaison = deleteCargaison;
exports.deleteColis = deleteColis;
exports.doLogin = doLogin;
exports.initEventDelegation = initEventDelegation;
const API_BASE = 'http://localhost:3002';
let authToken = localStorage.getItem('adminToken');
let currentAdmin = null;
// === Fonctions utilitaires ===
function getStatusColor(status) {
    switch (status) {
        case 'Assigné':
        case 'En cours':
            return 'bg-blue-100 text-blue-600';
        case 'Livré':
        case 'Terminé':
            return 'bg-green-100 text-green-600';
        case 'En attente':
            return 'bg-yellow-100 text-yellow-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}
function getEtatLabel(etat) {
    const etats = {
        'en_attente': 'En attente',
        'en_cours': 'En cours',
        'livre': 'Livré',
        'annule': 'Annulé',
        'retarde': 'Retardé'
    };
    return etats[etat] || etat;
}
function setActiveMenu(menuId) {
    // Supprimer la classe active de tous les menus
    document.querySelectorAll('.sidebar-menu li a').forEach(menu => {
        menu.classList.remove('bg-blue-600');
        menu.classList.add('hover:bg-gray-700');
    });
    // Ajouter la classe active au menu sélectionné
    const activeMenu = document.querySelector(`[onclick*="${menuId}"]`);
    if (activeMenu) {
        activeMenu.classList.add('bg-blue-600');
        activeMenu.classList.remove('hover:bg-gray-700');
    }
}
// === Fonctions de navigation ===
function showPublicPage() {
    document.getElementById('public-page').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
}
function showAdminDashboard() {
    if (!authToken) {
        alert('Veuillez vous connecter en tant qu\'administrateur');
        return;
    }
    document.getElementById('public-page').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    showDashboard();
}
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('admin-content');
    if (sidebar && content) {
        sidebar.classList.toggle('hidden');
        content.classList.toggle('ml-64');
    }
}
function logout() {
    localStorage.removeItem('adminToken');
    authToken = null;
    currentAdmin = null;
    showPublicPage();
}
// === Fonctions de contenu admin ===
function showDashboard() {
    const contentDiv = document.getElementById('admin-content-area');
    if (!contentDiv)
        return;
    setActiveMenu('showDashboard');
    contentDiv.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Tableau de bord</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="text-2xl">📦</div>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">Total Cargaisons</p>
                            <p class="text-2xl font-semibold text-gray-900" id="total-cargaisons">0</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="text-2xl">📫</div>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">Total Colis</p>
                            <p class="text-2xl font-semibold text-gray-900" id="total-colis">0</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="text-2xl">🚚</div>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">En cours</p>
                            <p class="text-2xl font-semibold text-gray-900" id="en-cours">0</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="text-2xl">✅</div>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">Livrés</p>
                            <p class="text-2xl font-semibold text-gray-900" id="livres">0</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    loadDashboardStats();
}
function loadDashboardStats() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [cargaisonsResponse, colisResponse] = yield Promise.all([
                fetch(`${API_BASE}/cargaisons`),
                fetch(`${API_BASE}/colis`)
            ]);
            const cargaisons = yield cargaisonsResponse.json();
            const colis = yield colisResponse.json();
            document.getElementById('total-cargaisons').textContent = cargaisons.length.toString();
            document.getElementById('total-colis').textContent = colis.length.toString();
            const enCours = cargaisons.filter((c) => c.etat === 'en_cours').length;
            const livres = cargaisons.filter((c) => c.etat === 'livre').length;
            document.getElementById('en-cours').textContent = enCours.toString();
            document.getElementById('livres').textContent = livres.toString();
        }
        catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    });
}
function showCargaisonsList() {
    const contentDiv = document.getElementById('admin-content-area');
    if (!contentDiv)
        return;
    setActiveMenu('showCargaisonsList');
    contentDiv.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-800">Gestion des Cargaisons</h2>
                <button onclick="showCreateCargaison()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    ➕ Nouvelle Cargaison
                </button>
            </div>
            <div id="cargaisons-table-container" class="bg-white rounded-lg shadow overflow-hidden">
                <div class="p-4 text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-2 text-gray-600">Chargement des cargaisons...</p>
                </div>
            </div>
        </div>
    `;
    loadCargaisons();
}
function loadCargaisons() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_BASE}/cargaisons`);
            const cargaisons = yield response.json();
            displayCargaisonsTable(cargaisons);
        }
        catch (error) {
            console.error('Erreur lors du chargement des cargaisons:', error);
            const container = document.getElementById('cargaisons-table-container');
            if (container) {
                container.innerHTML = '<div class="p-4 text-center text-red-600">Erreur lors du chargement des cargaisons</div>';
            }
        }
    });
}
function displayCargaisonsTable(cargaisons) {
    const tableContainer = document.getElementById('cargaisons-table-container');
    if (!tableContainer)
        return;
    const tableHtml = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Départ → Arrivée</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Départ</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${cargaisons.map(cargaison => {
        var _a, _b;
        return `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${cargaison.numero}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cargaison.type}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${((_a = cargaison.lieuDepart) === null || _a === void 0 ? void 0 : _a.nom) || 'N/A'} → ${((_b = cargaison.lieuArrivee) === null || _b === void 0 ? void 0 : _b.nom) || 'N/A'}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(cargaison.dateDepart).toLocaleDateString()}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getEtatLabel(cargaison.etat))}">
                                    ${getEtatLabel(cargaison.etat)}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button onclick="showCargaisonDetail('${cargaison.numero}')" class="text-blue-600 hover:text-blue-900 mr-2">Détails</button>
                                <button onclick="editCargaison('${cargaison.numero}')" class="text-indigo-600 hover:text-indigo-900 mr-2">Modifier</button>
                                <button onclick="deleteCargaison('${cargaison.numero}')" class="text-red-600 hover:text-red-900">Supprimer</button>
                            </td>
                        </tr>
                    `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    tableContainer.innerHTML = tableHtml;
}
function showColisList() {
    const contentDiv = document.getElementById('admin-content-area');
    if (!contentDiv)
        return;
    setActiveMenu('showColisList');
    contentDiv.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-800">Gestion des Colis</h2>
                <button onclick="showCreateColis()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    ➕ Nouveau Colis
                </button>
            </div>
            <div id="colis-table-container" class="bg-white rounded-lg shadow overflow-hidden">
                <div class="p-4 text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-2 text-gray-600">Chargement des colis...</p>
                </div>
            </div>
        </div>
    `;
    loadColis();
}
function loadColis() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_BASE}/colis`);
            const colis = yield response.json();
            displayColisTable(colis);
        }
        catch (error) {
            console.error('Erreur lors du chargement des colis:', error);
            const container = document.getElementById('colis-table-container');
            if (container) {
                container.innerHTML = '<div class="p-4 text-center text-red-600">Erreur lors du chargement des colis</div>';
            }
        }
    });
}
function displayColisTable(colis) {
    const tableContainer = document.getElementById('colis-table-container');
    if (!tableContainer)
        return;
    const tableHtml = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libellé</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poids</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${colis.map(c => {
        var _a;
        return `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${c.code}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${c.libelle}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${((_a = c.client) === null || _a === void 0 ? void 0 : _a.nom) || 'N/A'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${c.poids} kg</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getEtatLabel(c.etat))}">
                                    ${getEtatLabel(c.etat)}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button onclick="showColisDetail('${c.code}')" class="text-blue-600 hover:text-blue-900 mr-2">Détails</button>
                                <button onclick="editColis('${c.code}')" class="text-indigo-600 hover:text-indigo-900 mr-2">Modifier</button>
                                <button onclick="deleteColis('${c.code}')" class="text-red-600 hover:text-red-900">Supprimer</button>
                            </td>
                        </tr>
                    `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    tableContainer.innerHTML = tableHtml;
}
function showStats() {
    showDashboard(); // Les stats sont intégrées dans le dashboard
}
// === Fonctions de recherche ===
function searchColis() {
    return __awaiter(this, void 0, void 0, function* () {
        const searchInput = document.getElementById('search-input');
        if (!searchInput)
            return;
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            alert('Veuillez entrer un code de colis');
            return;
        }
        try {
            const response = yield fetch(`${API_BASE}/colis?code=${searchTerm}`);
            const colis = yield response.json();
            if (colis.length === 0) {
                alert('Aucun colis trouvé avec ce code');
                return;
            }
            showColisDetailFromSearch(colis[0].code);
        }
        catch (error) {
            console.error('Erreur lors de la recherche:', error);
            alert('Erreur lors de la recherche');
        }
    });
}
function showColisDetailFromSearch(code) {
    // Cette fonction sera liée au système de modales existant
    if (window.showColisDetail) {
        window.showColisDetail(code);
    }
}
// === Fonctions CRUD ===
function showCreateCargaison() {
    if (window.showAddCargaisonForm) {
        window.showAddCargaisonForm();
    }
}
function showCreateColis() {
    if (window.showAddColisForm) {
        window.showAddColisForm();
    }
}
function editCargaison(numero) {
    // TODO: Implémenter l'édition de cargaison
    console.log('Edit cargaison:', numero);
    alert('Fonctionnalité en cours de développement');
}
function editColis(code) {
    // TODO: Implémenter l'édition de colis
    console.log('Edit colis:', code);
    alert('Fonctionnalité en cours de développement');
}
function deleteCargaison(numero) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette cargaison ?')) {
            return;
        }
        try {
            const response = yield fetch(`${API_BASE}/cargaisons/${numero}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.ok) {
                alert('Cargaison supprimée avec succès');
                loadCargaisons(); // Recharger la liste
            }
            else {
                alert('Erreur lors de la suppression');
            }
        }
        catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression');
        }
    });
}
function deleteColis(code) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce colis ?')) {
            return;
        }
        try {
            const response = yield fetch(`${API_BASE}/colis/${code}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.ok) {
                alert('Colis supprimé avec succès');
                loadColis(); // Recharger la liste
            }
            else {
                alert('Erreur lors de la suppression');
            }
        }
        catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression');
        }
    });
}
// === Fonction d'authentification ===
function doLogin() {
    return __awaiter(this, void 0, void 0, function* () {
        const usernameInput = document.getElementById('admin-username');
        const passwordInput = document.getElementById('admin-password');
        if (!usernameInput || !passwordInput)
            return;
        const username = usernameInput.value;
        const password = passwordInput.value;
        if (!username || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        try {
            const response = yield fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                const data = yield response.json();
                authToken = data.token;
                currentAdmin = data.admin;
                localStorage.setItem('adminToken', data.token);
                document.getElementById('adminModal').classList.add('hidden');
                showAdminDashboard();
            }
            else {
                alert('Identifiants incorrects');
            }
        }
        catch (error) {
            console.error('Erreur de connexion:', error);
            alert('Erreur de connexion');
        }
    });
}
// === Gestionnaire d'événements global ===
function initEventDelegation() {
    document.addEventListener('click', (event) => {
        const target = event.target;
        const action = target.getAttribute('data-action');
        if (!action)
            return;
        event.preventDefault();
        switch (action) {
            case 'open-admin-modal':
                document.getElementById('adminModal').classList.remove('hidden');
                break;
            case 'close-admin-modal':
                document.getElementById('adminModal').classList.add('hidden');
                break;
            case 'search-colis':
                searchColis();
                break;
            case 'show-dashboard':
                showDashboard();
                break;
            case 'show-cargaisons-list':
                showCargaisonsList();
                break;
            case 'show-colis-list':
                showColisList();
                break;
            case 'show-stats':
                showStats();
                break;
            case 'logout':
                logout();
                break;
            case 'toggle-sidebar':
                toggleSidebar();
                break;
            case 'show-public-page':
                showPublicPage();
                break;
            case 'do-login':
                doLogin();
                break;
            default:
                console.warn('Action non reconnue:', action);
        }
    });
    console.log('✅ Délégation d\'événements initialisée');
}
