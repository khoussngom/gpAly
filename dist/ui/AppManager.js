"use strict";
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
exports.AppManager = void 0;
const Maritime_1 = require("../models/Maritime");
const Aerienne_1 = require("../models/Aerienne");
const Routiere_1 = require("../models/Routiere");
const CargaisonManager_1 = require("./CargaisonManager");
const Alimentaire_1 = require("../models/Alimentaire");
const Chimique_1 = require("../models/Chimique");
const Fragile_1 = require("../models/Fragile");
const Incassable_1 = require("../models/Incassable");
const Client_1 = require("../models/Client");
const Colis_1 = require("../models/Colis");
class AppManager {
    constructor() {
        this.cargaisons = [];
        this.currentTab = 'create';
        this.selectedCargaisonType = null;
        this.map = null;
        this.coordinatesDepart = null;
        this.coordinatesArrivee = null;
        this.selectingFor = null;
        this.produitsEnAttente = [];
        this.clientsEnregistres = [];
        this.distanceLine = null;
        this.cargaisonManager = null;
    }
    init() {
        this.render();
        this.attachEventListeners();
        const manageContainer = document.getElementById('manage-view');
        if (manageContainer) {
            this.cargaisonManager = new CargaisonManager_1.CargaisonManager(manageContainer);
            this.cargaisonManager.init();
        }
    }
    render() {
        const appContainer = document.getElementById('app');
        if (!appContainer)
            return;
        const headerHTML = `
            <div class="min-h-screen bg-gray-50">
                <header class="bg-blue-600 text-white shadow-lg">
                    <div class="container mx-auto px-4 py-6">
                        <h1 class="text-3xl font-bold">Gestion des Cargaisons</h1>
                        <p class="text-blue-100 mt-2">Système de suivi des transports</p>
                    </div>
                </header>`;
        const tabsHTML = `
                <nav class="bg-white shadow-sm border-b">
                    <div class="container mx-auto px-4">
                        <div class="flex space-x-8">
                            <button id="tab-create" class="tab-button py-4 px-6 border-b-2 font-medium text-sm ${this.currentTab === 'create' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}">
                                Créer une Cargaison
                            </button>
                            <button id="tab-manage" class="tab-button py-4 px-6 border-b-2 font-medium text-sm ${this.currentTab === 'manage' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}">
                                Gérer les Cargaisons
                            </button>
                        </div>
                    </div>
                </nav>`;
        const contentHTML = `
                <main class="container mx-auto px-4 py-8">
                    <div id="tab-content">
                        ${this.currentTab === 'create' ? this.renderCreateView() : '<div id="manage-view"></div>'}
                    </div>
                </main>
            </div>`;
        appContainer.innerHTML = headerHTML + tabsHTML + contentHTML;
    }
    renderCreateView() {
        const typeSelectionHTML = `
            <div id="create-view" class="max-w-4xl mx-auto">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Créer une nouvelle cargaison</h2>
                    
                    <div class="mb-8">
                        <label class="block text-sm font-medium text-gray-700 mb-4">Type de transport</label>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button id="btn-maritime" class="cargo-type-btn p-6 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${this.selectedCargaisonType === 'maritime' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}">
                                <div class="text-center">
                                    <div class="text-4xl mb-2">Maritime</div>
                                    <div class="font-semibold text-gray-800">Maritime</div>
                                    <div class="text-sm text-gray-600">Transport par mer</div>
                                </div>
                            </button>
                            <button id="btn-aerienne" class="cargo-type-btn p-6 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${this.selectedCargaisonType === 'aerienne' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}">
                                <div class="text-center">
                                    <div class="text-4xl mb-2">Aerienne</div>
                                    <div class="font-semibold text-gray-800">Aérienne</div>
                                    <div class="text-sm text-gray-600">Transport aérien</div>
                                </div>
                            </button>
                            <button id="btn-routiere" class="cargo-type-btn p-6 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${this.selectedCargaisonType === 'routiere' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}">
                                <div class="text-center">
                                    <div class="text-4xl mb-2">Routiére</div>
                                    <div class="font-semibold text-gray-800">Routière</div>
                                    <div class="text-sm text-gray-600">Transport terrestre</div>
                                </div>
                            </button>
                        </div>
                    </div>`;
        const formHTML = `
                    <div id="form-container" class="${!this.selectedCargaisonType ? 'hidden' : ''}">
                        <!-- Informations de base de la cargaison -->
                        <div class="bg-gray-50 p-6 rounded-lg mb-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Informations de base</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="numero" class="block text-sm font-medium text-gray-700 mb-2">Numéro de cargaison</label>
                                    <input type="text" id="numero" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="CARGO-2024-001">
                                </div>
                                <div>
                                    <label for="poids-max" class="block text-sm font-medium text-gray-700 mb-2">Poids maximum (kg)</label>
                                    <input type="number" id="poids-max" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="1000">
                                </div>
                            </div>
                        </div>

                        <!-- Section Client -->
                        <div class="bg-blue-50 p-6 rounded-lg mb-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4"> Informations du client</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="client-prenom" class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                                    <input type="text" id="client-prenom" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Jean" required>
                                </div>
                                <div>
                                    <label for="client-nom" class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                                    <input type="text" id="client-nom" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Dupont" required>
                                </div>
                                <div>
                                    <label for="client-telephone" class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                                    <input type="tel" id="client-telephone" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="+221 77 123 45 67" required>
                                </div>
                                <div>
                                    <label for="client-email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input type="email" id="client-email" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="jean.dupont@email.com">
                                </div>
                                <div class="md:col-span-2">
                                    <label for="client-adresse" class="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                                    <textarea id="client-adresse" class="w-full px-3 py-2 border border-gray-300 rounded-md" rows="2" placeholder="Rue, Ville, Région" required></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Section Produit -->
                        <div class="bg-green-50 p-6 rounded-lg mb-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4"> Produit initial (obligatoire)</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label for="produit-libelle" class="block text-sm font-medium text-gray-700 mb-2">Libellé du produit *</label>
                                    <input type="text" id="produit-libelle" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ordinateur portable" required>
                                </div>
                                <div>
                                    <label for="produit-poids" class="block text-sm font-medium text-gray-700 mb-2">Poids (kg) *</label>
                                    <input type="number" id="produit-poids" step="0.1" min="0.1" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="2.5" required>
                                </div>
                                <div>
                                    <label for="produit-type" class="block text-sm font-medium text-gray-700 mb-2">Type de produit *</label>
                                    <select id="produit-type" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                                        <option value="">Sélectionner un type</option>
                                        <option value="alimentaire"> Alimentaire</option>
                                        <option value="chimique"> Chimique</option>
                                        <option value="materiel-fragile"> Matériel fragile</option>
                                        <option value="materiel-incassable"> Matériel incassable</option>
                                    </select>
                                </div>
                                <div id="toxicite-container" class="hidden">
                                    <label for="produit-toxicite" class="block text-sm font-medium text-gray-700 mb-2">Niveau de toxicité *</label>
                                    <select id="produit-toxicite" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                        <option value="">Sélectionner</option>
                                        <option value="1">Niveau 1 - Faible</option>
                                        <option value="2">Niveau 2 - Modéré</option>
                                        <option value="3">Niveau 3 - Élevé</option>
                                        <option value="4">Niveau 4 - Très élevé</option>
                                        <option value="5">Niveau 5 - Extrême</option>
                                    </select>
                                </div>
                            </div>
                            <div class="flex justify-between items-center">
                                <div class="flex gap-2">
                                    <button id="btn-add-produit" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                        Ajouter ce produit
                                    </button>
                                    <button id="btn-add-another-produit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hidden">
                                        Ajouter un autre produit
                                    </button>
                                </div>
                                <div class="text-sm text-gray-600">
                                    Produits ajoutés: <span id="produits-count">0</span>
                                </div>
                            </div>
                        </div>

                        <!-- Liste des produits ajoutés -->
                        <div id="produits-list" class="bg-white border border-gray-200 rounded-lg mb-6 hidden">
                            <div class="p-4 border-b border-gray-200">
                                <h4 class="font-semibold text-gray-800">Produits dans cette cargaison</h4>
                            </div>
                            <div id="produits-container" class="p-4 space-y-2">
                                <!-- Les produits seront ajoutés ici dynamiquement -->
                            </div>
                        </div>

                        ${this.renderCoordinatesSection()}
                        ${this.renderMapSection()}
                        <div id="specific-fields" class="mb-6">
                            ${this.renderSpecificFields()}
                        </div>
                        <div class="flex justify-end">
                            <button id="btn-create-cargaison" class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled>
                                Créer la cargaison
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        return typeSelectionHTML + formHTML;
    }
    renderCoordinatesSection() {
        return `
            <div class="mb-6">
                <h3 class="text-lg font-medium text-gray-800 mb-4">Coordonnées</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h4 class="font-medium text-gray-700">Point de départ</h4>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="lat-depart" class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                <input type="number" id="lat-depart" step="any" class="w-full px-3 py-2 border border-gray-300 rounded-md" readonly>
                            </div>
                            <div>
                                <label for="lng-depart" class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                <input type="number" id="lng-depart" step="any" class="w-full px-3 py-2 border border-gray-300 rounded-md" readonly>
                            </div>
                        </div>
                        <button id="btn-select-depart" class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            Sélectionner sur la carte
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <h4 class="font-medium text-gray-700">Point d'arrivée</h4>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="lat-arrivee" class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                <input type="number" id="lat-arrivee" step="any" class="w-full px-3 py-2 border border-gray-300 rounded-md" readonly>
                            </div>
                            <div>
                                <label for="lng-arrivee" class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                <input type="number" id="lng-arrivee" step="any" class="w-full px-3 py-2 border border-gray-300 rounded-md" readonly>
                            </div>
                        </div>
                        <button id="btn-select-arrivee" class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            Sélectionner sur la carte
                        </button>
                    </div>
                </div>
                
                <!-- Affichage de la distance -->
                <div id="distance-display" class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg hidden">
                    <div class="flex items-center justify-center">
                        <div class="text-center">
                            <h4 class="text-lg font-semibold text-blue-800 mb-2">Distance calculée</h4>
                            <div class="text-3xl font-bold text-blue-600" id="distance-value">--</div>
                            <div class="text-sm text-blue-700">kilomètres</div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    renderMapSection() {
        return `
            <div id="map-container" class="hidden mb-6">
                <div class="bg-gray-100 p-4 rounded-lg">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-medium text-gray-700">Sélection des coordonnées</h4>
                        <button id="btn-close-map" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            Fermer la carte
                        </button>
                    </div>
                    <div id="map" class="h-96 rounded-lg"></div>
                    <p class="text-sm text-gray-600 mt-2">Cliquez sur la carte pour sélectionner</p>
                </div>
            </div>`;
    }
    renderSpecificFields() {
        if (!this.selectedCargaisonType)
            return '';
        switch (this.selectedCargaisonType) {
            case 'maritime':
                return `
                    <h3 class="text-lg font-medium text-gray-800 mb-4">Transport Maritime</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="nom-navire" class="block text-sm font-medium text-gray-700 mb-2">Nom du navire</label>
                            <input type="text" id="nom-navire" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ocean Explorer">
                        </div>
                        <div>
                            <label for="port-depart" class="block text-sm font-medium text-gray-700 mb-2">Port de départ</label>
                            <input type="text" id="port-depart" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Port de Marseille">
                        </div>
                        <div>
                            <label for="port-arrivee" class="block text-sm font-medium text-gray-700 mb-2">Port d'arrivée</label>
                            <input type="text" id="port-arrivee" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Port de Tunis">
                        </div>
                    </div>`;
            case 'aerienne':
                return `
                    <h3 class="text-lg font-medium text-gray-800 mb-4">Transport Aérien</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="numero-vol" class="block text-sm font-medium text-gray-700 mb-2">Numéro de vol</label>
                            <input type="text" id="numero-vol" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="AF1234">
                        </div>
                        <div>
                            <label for="aeroport-depart" class="block text-sm font-medium text-gray-700 mb-2">Aéroport de départ</label>
                            <input type="text" id="aeroport-depart" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="CDG Paris">
                        </div>
                        <div>
                            <label for="aeroport-arrivee" class="block text-sm font-medium text-gray-700 mb-2">Aéroport d'arrivée</label>
                            <input type="text" id="aeroport-arrivee" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="TUN Tunis">
                        </div>
                    </div>`;
            case 'routiere':
                return `
                    <h3 class="text-lg font-medium text-gray-800 mb-4">Transport Routier</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="immatriculation" class="block text-sm font-medium text-gray-700 mb-2">Immatriculation</label>
                            <input type="text" id="immatriculation" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="123 TUN 456">
                        </div>
                        <div>
                            <label for="nom-chauffeur" class="block text-sm font-medium text-gray-700 mb-2">Nom du chauffeur</label>
                            <input type="text" id="nom-chauffeur" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Ahmed Ben Ali">
                        </div>
                    </div>`;
            default:
                return '';
        }
    }
    attachEventListeners() {
        const tabCreate = document.getElementById('tab-create');
        const tabManage = document.getElementById('tab-manage');
        if (tabCreate) {
            tabCreate.addEventListener('click', () => this.switchTab('create'));
        }
        if (tabManage) {
            tabManage.addEventListener('click', () => this.switchTab('manage'));
        }
        const btnMaritime = document.getElementById('btn-maritime');
        const btnAerienne = document.getElementById('btn-aerienne');
        const btnRoutiere = document.getElementById('btn-routiere');
        if (btnMaritime) {
            btnMaritime.addEventListener('click', () => this.selectCargaisonType('maritime'));
        }
        if (btnAerienne) {
            btnAerienne.addEventListener('click', () => this.selectCargaisonType('aerienne'));
        }
        if (btnRoutiere) {
            btnRoutiere.addEventListener('click', () => this.selectCargaisonType('routiere'));
        }
        const btnSelectDepart = document.getElementById('btn-select-depart');
        const btnSelectArrivee = document.getElementById('btn-select-arrivee');
        const btnCloseMap = document.getElementById('btn-close-map');
        if (btnSelectDepart) {
            btnSelectDepart.addEventListener('click', () => this.openMapForSelection('depart'));
        }
        if (btnSelectArrivee) {
            btnSelectArrivee.addEventListener('click', () => this.openMapForSelection('arrivee'));
        }
        if (btnCloseMap) {
            btnCloseMap.addEventListener('click', () => this.closeMap());
        }
        const btnCreateCargaison = document.getElementById('btn-create-cargaison');
        if (btnCreateCargaison) {
            btnCreateCargaison.addEventListener('click', () => this.createCargaison());
        }
        const produitTypeSelect = document.getElementById('produit-type');
        if (produitTypeSelect) {
            produitTypeSelect.addEventListener('change', () => this.handleProduitTypeChange());
        }
        const btnAddProduit = document.getElementById('btn-add-produit');
        if (btnAddProduit) {
            btnAddProduit.addEventListener('click', () => this.addProduit());
        }
        const btnAddAnotherProduit = document.getElementById('btn-add-another-produit');
        if (btnAddAnotherProduit) {
            btnAddAnotherProduit.addEventListener('click', () => this.addProduit());
        }
    }
    switchTab(tab) {
        this.currentTab = tab;
        if (tab === 'manage') {
            const tabContent = document.getElementById('tab-content');
            if (tabContent) {
                tabContent.innerHTML = '<div id="manage-view"></div>';
                const manageContainer = document.getElementById('manage-view');
                if (manageContainer && !this.cargaisonManager) {
                    this.cargaisonManager = new CargaisonManager_1.CargaisonManager(manageContainer);
                    this.cargaisonManager.init();
                }
                else if (manageContainer && this.cargaisonManager) {
                    this.cargaisonManager = new CargaisonManager_1.CargaisonManager(manageContainer);
                    this.cargaisonManager.init();
                }
            }
        }
        else {
            this.render();
            this.attachEventListeners();
        }
    }
    selectCargaisonType(type) {
        this.selectedCargaisonType = type;
        const formContainer = document.getElementById('form-container');
        const specificFields = document.getElementById('specific-fields');
        if (formContainer) {
            formContainer.classList.remove('hidden');
        }
        if (specificFields) {
            specificFields.innerHTML = this.renderSpecificFields();
        }
        document.querySelectorAll('.cargo-type-btn').forEach(btn => {
            btn.classList.remove('border-blue-500', 'bg-blue-50');
            btn.classList.add('border-gray-200');
        });
        const selectedBtn = document.getElementById(`btn-${type}`);
        if (selectedBtn) {
            selectedBtn.classList.remove('border-gray-200');
            selectedBtn.classList.add('border-blue-500', 'bg-blue-50');
        }
        this.attachEventListeners();
    }
    openMapForSelection(type) {
        this.selectingFor = type;
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.classList.remove('hidden');
            if (!this.map) {
                this.initializeMap();
            }
        }
    }
    closeMap() {
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.classList.add('hidden');
        }
        this.selectingFor = null;
    }
    initializeMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement)
            return;
        this.map = L.map('map').setView([36.8065, 10.1815], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        this.map.on('click', (e) => {
            if (this.selectingFor) {
                const { lat, lng } = e.latlng;
                this.setCoordinates(this.selectingFor, lat, lng);
            }
        });
    }
    setCoordinates(type, lat, lng) {
        if (type === 'depart') {
            this.coordinatesDepart = { lat, lng };
            const latInput = document.getElementById('lat-depart');
            const lngInput = document.getElementById('lng-depart');
            if (latInput)
                latInput.value = lat.toFixed(6);
            if (lngInput)
                lngInput.value = lng.toFixed(6);
        }
        else {
            this.coordinatesArrivee = { lat, lng };
            const latInput = document.getElementById('lat-arrivee');
            const lngInput = document.getElementById('lng-arrivee');
            if (latInput)
                latInput.value = lat.toFixed(6);
            if (lngInput)
                lngInput.value = lng.toFixed(6);
        }
        if (this.map) {
            L.marker([lat, lng]).addTo(this.map)
                .bindPopup(`${type === 'depart' ? 'Départ' : 'Arrivée'}: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
                .openPopup();
        }
        this.updateDistanceDisplay();
        this.closeMap();
    }
    calculateHaversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    updateDistanceDisplay() {
        const distanceDisplay = document.getElementById('distance-display');
        const distanceValue = document.getElementById('distance-value');
        if (!distanceDisplay || !distanceValue)
            return;
        if (this.coordinatesDepart && this.coordinatesArrivee) {
            const distance = this.calculateHaversineDistance(this.coordinatesDepart.lat, this.coordinatesDepart.lng, this.coordinatesArrivee.lat, this.coordinatesArrivee.lng);
            distanceValue.textContent = distance.toFixed(2);
            distanceDisplay.classList.remove('hidden');
            this.drawDistanceLine();
        }
        else {
            distanceDisplay.classList.add('hidden');
            this.removeDistanceLine();
        }
    }
    drawDistanceLine() {
        if (!this.map || !this.coordinatesDepart || !this.coordinatesArrivee)
            return;
        this.removeDistanceLine();
        this.distanceLine = L.polyline([
            [this.coordinatesDepart.lat, this.coordinatesDepart.lng],
            [this.coordinatesArrivee.lat, this.coordinatesArrivee.lng]
        ], {
            color: '#3B82F6',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(this.map);
        const group = new L.featureGroup([
            L.marker([this.coordinatesDepart.lat, this.coordinatesDepart.lng]),
            L.marker([this.coordinatesArrivee.lat, this.coordinatesArrivee.lng])
        ]);
        this.map.fitBounds(group.getBounds().pad(0.1));
    }
    removeDistanceLine() {
        if (this.distanceLine && this.map) {
            this.map.removeLayer(this.distanceLine);
            this.distanceLine = null;
        }
    }
    createCargaison() {
        if (!this.selectedCargaisonType) {
            alert('Veuillez sélectionner un type de transport');
            return;
        }
        if (this.produitsEnAttente.length === 0) {
            alert('Veuillez ajouter au moins un produit à la cargaison');
            return;
        }
        const numeroInput = document.getElementById('numero');
        const poidsMaxInput = document.getElementById('poids-max');
        if (!numeroInput || !poidsMaxInput) {
            alert('Erreur dans le formulaire');
            return;
        }
        const numero = numeroInput.value.trim();
        const poidsMax = parseFloat(poidsMaxInput.value);
        if (!numero || isNaN(poidsMax) || poidsMax <= 0) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        if (!this.coordinatesDepart || !this.coordinatesArrivee) {
            alert('Veuillez sélectionner les coordonnées de départ et d\'arrivée');
            return;
        }
        try {
            const colisInitial = this.produitsEnAttente[0];
            const distance = this.calculateHaversineDistance(this.coordinatesDepart.lat, this.coordinatesDepart.lng, this.coordinatesArrivee.lat, this.coordinatesArrivee.lng);
            const lieuDepart = {
                ville: "Départ",
                latitude: this.coordinatesDepart.lat,
                longitude: this.coordinatesDepart.lng
            };
            const lieuArrivee = {
                ville: "Arrivée",
                latitude: this.coordinatesArrivee.lat,
                longitude: this.coordinatesArrivee.lng
            };
            let cargaison;
            switch (this.selectedCargaisonType) {
                case 'maritime':
                    cargaison = new Maritime_1.Maritime(colisInitial, distance, lieuDepart, lieuArrivee);
                    break;
                case 'aerienne':
                    cargaison = new Aerienne_1.Aerienne(colisInitial, distance, lieuDepart, lieuArrivee);
                    break;
                case 'routiere':
                    cargaison = new Routiere_1.Routiere(colisInitial, distance, lieuDepart, lieuArrivee);
                    break;
                default:
                    throw new Error('Type de cargaison non supporté');
            }
            this.cargaisons.push(cargaison);
            for (let i = 1; i < this.produitsEnAttente.length; i++) {
                try {
                    cargaison.ajouterColis(this.produitsEnAttente[i]);
                }
                catch (error) {
                    console.warn(`Impossible d'ajouter le produit ${i + 1}:`, error);
                }
            }
            this.saveCargaisonToServer(cargaison);
            alert(`Cargaison créée avec succès avec ${this.produitsEnAttente.length} produit(s) !`);
            this.resetForm();
        }
        catch (error) {
            console.error('Erreur lors de la création de la cargaison:', error);
            alert('Erreur lors de la création de la cargaison: ' + error.message);
        }
    }
    saveCargaisonToServer(cargaison) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const colisData = this.produitsEnAttente.map(colis => {
                    var _a, _b;
                    return ({
                        id: colis.getCode(),
                        code: colis.getCode(),
                        libelle: colis.getLibelle(),
                        poids: colis.getPoids(),
                        produit: Object.assign({ type: colis.getProduit().constructor.name.toLowerCase(), libelle: colis.getProduit().getLibelle(), poids: colis.getProduit().getPoids() }, (colis.getProduit().constructor.name === 'Chimique' && {
                            toxicite: ((_b = (_a = colis.getProduit()).getNiveauToxicite) === null || _b === void 0 ? void 0 : _b.call(_a)) || 1
                        })),
                        client: {
                            nom: colis.getClient().getNom(),
                            prenom: colis.getClient().getPrenom(),
                            telephone: colis.getClient().getTelephone(),
                            adresse: colis.getClient().getAdresse(),
                            email: colis.getClient().getEmail()
                        },
                        etat: 'en_attente',
                        dateCreation: new Date().toISOString(),
                        dateExpedition: null,
                        dateArrivee: null,
                        cargaisonId: cargaison.getNumero()
                    });
                });
                const cargaisonResponse = yield fetch('http://localhost:3002/cargaisons', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: cargaison.getNumero(),
                        type: this.selectedCargaisonType,
                        numero: cargaison.getNumero(),
                        distance: cargaison.getDistance(),
                        lieuDepart: {
                            ville: cargaison.getLieuDepart().ville,
                            latitude: cargaison.getLieuDepart().latitude,
                            longitude: cargaison.getLieuDepart().longitude
                        },
                        lieuArrivee: {
                            ville: cargaison.getLieuArrivee().ville,
                            latitude: cargaison.getLieuArrivee().latitude,
                            longitude: cargaison.getLieuArrivee().longitude
                        },
                        dateCreation: new Date().toISOString(),
                        dateDepart: null,
                        dateArrivee: null,
                        dateArriveeEstimee: null,
                        etat: 'ouverte',
                        colis: colisData.map(c => c.id),
                        specificData: this.getSpecificData(cargaison)
                    })
                });
                if (!cargaisonResponse.ok) {
                    throw new Error('Erreur lors de la sauvegarde de la cargaison');
                }
                for (const colisInfo of colisData) {
                    const colisResponse = yield fetch('http://localhost:3002/colis', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(colisInfo)
                    });
                    if (!colisResponse.ok) {
                        console.warn(`Erreur lors de la sauvegarde du colis ${colisInfo.id}`);
                    }
                }
            }
            catch (error) {
                console.error('Erreur lors de la sauvegarde:', error);
            }
        });
    }
    getSpecificData(cargaison) {
        if (cargaison instanceof Maritime_1.Maritime) {
            return {
                nomNavire: cargaison.nomNavire,
                portDepart: cargaison.portDepart,
                portArrivee: cargaison.portArrivee
            };
        }
        else if (cargaison instanceof Aerienne_1.Aerienne) {
            return {
                numeroVol: cargaison.numeroVol,
                aeroportDepart: cargaison.aeroportDepart,
                aeroportArrivee: cargaison.aeroportArrivee
            };
        }
        else if (cargaison instanceof Routiere_1.Routiere) {
            return {
                immatriculation: cargaison.immatriculation,
                nomChauffeur: cargaison.nomChauffeur
            };
        }
        return {};
    }
    resetForm() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input instanceof HTMLInputElement && input.type !== 'button') {
                input.value = '';
            }
            else if (input instanceof HTMLSelectElement) {
                input.value = '';
            }
            else if (input instanceof HTMLTextAreaElement) {
                input.value = '';
            }
        });
        this.produitsEnAttente = [];
        this.clientsEnregistres = [];
        this.updateProduitsDisplay();
        this.updateCreateButton();
        this.coordinatesDepart = null;
        this.coordinatesArrivee = null;
        this.selectingFor = null;
        this.selectedCargaisonType = null;
        this.removeDistanceLine();
        document.querySelectorAll('.cargo-type-btn').forEach(btn => {
            btn.classList.remove('border-blue-500', 'bg-blue-50');
            btn.classList.add('border-gray-200');
        });
        const formContainer = document.getElementById('form-container');
        if (formContainer) {
            formContainer.classList.add('hidden');
        }
        const toxiciteContainer = document.getElementById('toxicite-container');
        if (toxiciteContainer) {
            toxiciteContainer.classList.add('hidden');
        }
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.classList.add('hidden');
        }
        if (this.map) {
            this.map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    this.map.removeLayer(layer);
                }
            });
        }
    }
    handleProduitTypeChange() {
        const produitTypeSelect = document.getElementById('produit-type');
        const toxiciteContainer = document.getElementById('toxicite-container');
        if (produitTypeSelect && toxiciteContainer) {
            if (produitTypeSelect.value === 'chimique') {
                toxiciteContainer.classList.remove('hidden');
                const toxiciteSelect = document.getElementById('produit-toxicite');
                if (toxiciteSelect) {
                    toxiciteSelect.setAttribute('required', 'required');
                }
            }
            else {
                toxiciteContainer.classList.add('hidden');
                const toxiciteSelect = document.getElementById('produit-toxicite');
                if (toxiciteSelect) {
                    toxiciteSelect.removeAttribute('required');
                    toxiciteSelect.value = '';
                }
            }
        }
    }
    addProduit() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        try {
            const clientPrenom = (_a = document.getElementById('client-prenom')) === null || _a === void 0 ? void 0 : _a.value.trim();
            const clientNom = (_b = document.getElementById('client-nom')) === null || _b === void 0 ? void 0 : _b.value.trim();
            const clientTelephone = (_c = document.getElementById('client-telephone')) === null || _c === void 0 ? void 0 : _c.value.trim();
            const clientEmail = (_d = document.getElementById('client-email')) === null || _d === void 0 ? void 0 : _d.value.trim();
            const clientAdresse = (_e = document.getElementById('client-adresse')) === null || _e === void 0 ? void 0 : _e.value.trim();
            const produitLibelle = (_f = document.getElementById('produit-libelle')) === null || _f === void 0 ? void 0 : _f.value.trim();
            const produitPoids = parseFloat(((_g = document.getElementById('produit-poids')) === null || _g === void 0 ? void 0 : _g.value) || '0');
            const produitType = (_h = document.getElementById('produit-type')) === null || _h === void 0 ? void 0 : _h.value;
            const produitToxicite = parseInt(((_j = document.getElementById('produit-toxicite')) === null || _j === void 0 ? void 0 : _j.value) || '0');
            if (!clientPrenom || !clientNom || !clientTelephone || !clientAdresse) {
                alert('Veuillez remplir tous les champs obligatoires du client');
                return;
            }
            if (!produitLibelle || !produitPoids || !produitType) {
                alert('Veuillez remplir tous les champs obligatoires du produit');
                return;
            }
            if (produitType === 'chimique' && !produitToxicite) {
                alert('Veuillez sélectionner le niveau de toxicité pour un produit chimique');
                return;
            }
            const client = new Client_1.Client(clientNom, clientPrenom, clientTelephone, clientAdresse, clientEmail || undefined);
            let produit;
            switch (produitType) {
                case 'alimentaire':
                    produit = new Alimentaire_1.Alimentaire(produitLibelle, produitPoids);
                    break;
                case 'chimique':
                    produit = new Chimique_1.Chimique(produitLibelle, produitPoids, produitToxicite);
                    break;
                case 'materiel-fragile':
                    produit = new Fragile_1.Fragile(produitLibelle, produitPoids);
                    break;
                case 'materiel-incassable':
                    produit = new Incassable_1.Incassable(produitLibelle, produitPoids);
                    break;
                default:
                    throw new Error('Type de produit non reconnu');
            }
            const codeUniteForme = `COL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            const colis = new Colis_1.Colis(produit, codeUniteForme, client);
            this.produitsEnAttente.push(colis);
            const clientExiste = this.clientsEnregistres.some(c => c.getNom() === client.getNom() &&
                c.getPrenom() === client.getPrenom() &&
                c.getTelephone() === client.getTelephone());
            if (!clientExiste) {
                this.clientsEnregistres.push(client);
            }
            this.updateProduitsDisplay();
            this.clearProduitForm();
            this.updateCreateButton();
            alert(`Produit "${produitLibelle}" ajouté avec succès!`);
        }
        catch (error) {
            console.error('Erreur lors de l\'ajout du produit:', error);
            alert('Erreur lors de l\'ajout du produit');
        }
    }
    updateProduitsDisplay() {
        const produitsCount = document.getElementById('produits-count');
        const produitsList = document.getElementById('produits-list');
        const produitsContainer = document.getElementById('produits-container');
        const btnAddAnother = document.getElementById('btn-add-another-produit');
        if (produitsCount) {
            produitsCount.textContent = this.produitsEnAttente.length.toString();
        }
        if (btnAddAnother) {
            if (this.produitsEnAttente.length > 0) {
                btnAddAnother.classList.remove('hidden');
            }
            else {
                btnAddAnother.classList.add('hidden');
            }
        }
        if (produitsList && produitsContainer) {
            if (this.produitsEnAttente.length > 0) {
                produitsList.classList.remove('hidden');
                produitsContainer.innerHTML = this.produitsEnAttente.map((colis, index) => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex-1">
                            <div class="font-medium text-gray-900">${colis.getLibelle()}</div>
                            <div class="text-sm text-gray-600">
                                ${colis.getPoids()}kg - ${colis.getProduit().constructor.name} - 
                                Client: ${colis.getClient().getPrenom()} ${colis.getClient().getNom()}
                            </div>
                        </div>
                        <button onclick="appManager.removeProduit(${index})" 
                                class="text-red-600 hover:text-red-800 px-2 py-1">
                            
                        </button>
                    </div>
                `).join('');
            }
            else {
                produitsList.classList.add('hidden');
            }
        }
    }
    clearProduitForm() {
        const produitLibelle = document.getElementById('produit-libelle');
        const produitPoids = document.getElementById('produit-poids');
        const produitType = document.getElementById('produit-type');
        const produitToxicite = document.getElementById('produit-toxicite');
        if (produitLibelle)
            produitLibelle.value = '';
        if (produitPoids)
            produitPoids.value = '';
        if (produitType)
            produitType.value = '';
        if (produitToxicite)
            produitToxicite.value = '';
        const toxiciteContainer = document.getElementById('toxicite-container');
        if (toxiciteContainer) {
            toxiciteContainer.classList.add('hidden');
        }
    }
    updateCreateButton() {
        const btnCreateCargaison = document.getElementById('btn-create-cargaison');
        if (btnCreateCargaison) {
            btnCreateCargaison.disabled = this.produitsEnAttente.length === 0;
        }
    }
    removeProduit(index) {
        if (index >= 0 && index < this.produitsEnAttente.length) {
            this.produitsEnAttente.splice(index, 1);
            this.updateProduitsDisplay();
            this.updateCreateButton();
        }
    }
}
exports.AppManager = AppManager;
