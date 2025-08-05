"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppManager = void 0;
const Maritime_1 = require("../models/Maritime");
const Aerienne_1 = require("../models/Aerienne");
const Routiere_1 = require("../models/Routiere");
const Alimentaire_1 = require("../models/Alimentaire");
const Chimique_1 = require("../models/Chimique");
const Fragile_1 = require("../models/Fragile");
const Incassable_1 = require("../models/Incassable");
class AppManager {
    constructor(container) {
        this.currentCargaison = null;
        this.container = container;
    }
    init() {
        this.render();
        this.attachEventListeners();
    }
    render() {
        this.container.innerHTML = `
            <!-- Header -->
            <header class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-6">
                        <div class="flex items-center">
                            <div class="text-3xl mr-3">🚢</div>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-900">Gestionnaire de Cargaison</h1>
                                <p class="text-sm text-gray-500">Système de gestion de transport</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="text-sm text-gray-500">
                                ${this.currentCargaison ? `${this.currentCargaison.nbProduit()}/10 produits` : 'Aucune cargaison'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Main Content -->
            <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Panneau de création de cargaison -->
                    <div class="lg:col-span-1">
                        <div class="card">
                            <h2 class="text-xl font-semibold text-gray-900 mb-6">Nouvelle Cargaison</h2>
                            
                            <!-- Sélection du type de transport -->
                            <div class="mb-6">
                                <label class="block text-sm font-medium text-gray-700 mb-3">Type de transport</label>
                                <div class="grid grid-cols-1 gap-3">
                                    <button id="btn-maritime" class="cargo-type-btn cargo-maritime text-white p-4 rounded-lg font-medium transition-all hover:scale-105">
                                        <div class="flex items-center justify-center">
                                            <span class="text-2xl mr-2">🚢</span>
                                            <div class="text-left">
                                                <div class="font-semibold">Maritime</div>
                                                <div class="text-sm opacity-90">Transport par mer</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button id="btn-aerienne" class="cargo-type-btn cargo-aerienne text-white p-4 rounded-lg font-medium transition-all hover:scale-105">
                                        <div class="flex items-center justify-center">
                                            <span class="text-2xl mr-2">✈️</span>
                                            <div class="text-left">
                                                <div class="font-semibold">Aérienne</div>
                                                <div class="text-sm opacity-90">Transport aérien</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button id="btn-routiere" class="cargo-type-btn cargo-routiere text-white p-4 rounded-lg font-medium transition-all hover:scale-105">
                                        <div class="flex items-center justify-center">
                                            <span class="text-2xl mr-2">🚛</span>
                                            <div class="text-left">
                                                <div class="font-semibold">Routière</div>
                                                <div class="text-sm opacity-90">Transport routier</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <!-- Formulaire de produit initial -->
                            <div id="initial-product-form" class="hidden">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Produit initial</h3>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                                        <input type="number" id="distance" class="input-field" placeholder="ex: 1000" min="1">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Type de produit</label>
                                        <select id="product-type" class="input-field">
                                            <option value="">Sélectionner un type</option>
                                            <option value="alimentaire">Alimentaire</option>
                                            <option value="chimique">Chimique</option>
                                            <option value="fragile">Matériel fragile</option>
                                            <option value="incassable">Matériel incassable</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
                                        <input type="text" id="product-label" class="input-field" placeholder="Nom du produit">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                                        <input type="number" id="product-weight" class="input-field" placeholder="ex: 10.5" min="0.1" step="0.1">
                                    </div>
                                    <div id="toxicity-field" class="hidden">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Degré de toxicité (1-10)</label>
                                        <input type="number" id="product-toxicity" class="input-field" placeholder="ex: 5" min="1" max="10">
                                    </div>
                                    <button id="create-cargo" class="btn-primary w-full">Créer la cargaison</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Panneau principal -->
                    <div class="lg:col-span-2">
                        <div id="cargo-dashboard" class="hidden">
                            <!-- Informations de la cargaison -->
                            <div class="card mb-6">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 class="text-xl font-semibold text-gray-900">Cargaison actuelle</h2>
                                        <p id="cargo-info" class="text-gray-600"></p>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-2xl font-bold text-primary-600" id="total-cost">0 FCFA</div>
                                        <div class="text-sm text-gray-500">Coût total</div>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div class="flex items-center">
                                        <span id="cargo-icon" class="text-3xl mr-3"></span>
                                        <div>
                                            <div class="font-medium" id="cargo-type-name"></div>
                                            <div class="text-sm text-gray-600" id="cargo-distance"></div>
                                        </div>
                                    </div>
                                    <div class="text-sm text-gray-600">
                                        <span id="product-count">0</span>/10 produits
                                    </div>
                                </div>
                            </div>

                            <!-- Ajouter un produit -->
                            <div class="card mb-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Ajouter un produit</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Type de produit</label>
                                        <select id="add-product-type" class="input-field">
                                            <option value="">Sélectionner un type</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
                                        <input type="text" id="add-product-label" class="input-field" placeholder="Nom du produit">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                                        <input type="number" id="add-product-weight" class="input-field" placeholder="ex: 10.5" min="0.1" step="0.1">
                                    </div>
                                    <div id="add-toxicity-field" class="hidden">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Degré de toxicité (1-10)</label>
                                        <input type="number" id="add-product-toxicity" class="input-field" placeholder="ex: 5" min="1" max="10">
                                    </div>
                                </div>
                                <button id="add-product" class="btn-primary mt-4">Ajouter le produit</button>
                            </div>

                            <!-- Liste des produits -->
                            <div class="card">
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="text-lg font-semibold text-gray-900">Produits dans la cargaison</h3>
                                    <div class="text-sm text-gray-600">
                                        <span id="product-counter">0</span> produit(s)
                                    </div>
                                </div>
                                <div id="products-list" class="space-y-3">
                                    <!-- Les produits seront affichés ici -->
                                </div>
                                
                                <!-- Résumé et validation -->
                                <div id="cargo-summary" class="hidden mt-6 pt-6 border-t border-gray-200">
                                    <div class="bg-blue-50 rounded-lg p-4 mb-4">
                                        <h4 class="font-medium text-blue-900 mb-2">Résumé de la cargaison</h4>
                                        <div class="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span class="text-blue-700">Nombre de produits :</span>
                                                <span class="font-medium" id="summary-product-count">0</span>
                                            </div>
                                            <div>
                                                <span class="text-blue-700">Distance :</span>
                                                <span class="font-medium" id="summary-distance">0 km</span>
                                            </div>
                                        </div>
                                        <div class="mt-3 text-lg">
                                            <span class="text-blue-700">Total des frais :</span>
                                            <span class="font-bold text-blue-900" id="summary-total-cost">0 FCFA</span>
                                        </div>
                                    </div>
                                    
                                    <div class="flex gap-3">
                                        <button id="validate-cargo" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                                            ✅ Valider la cargaison
                                        </button>
                                        <button id="reset-cargo" class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                                            🔄 Recommencer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- État initial -->
                        <div id="empty-state" class="text-center py-12">
                            <div class="text-6xl mb-4">📦</div>
                            <h3 class="text-xl font-medium text-gray-900 mb-2">Aucune cargaison</h3>
                            <p class="text-gray-600">Créez une nouvelle cargaison pour commencer</p>
                        </div>
                    </div>
                </div>
            </main>
        `;
    }
    attachEventListeners() {
        // Sélection du type de transport
        ['maritime', 'aerienne', 'routiere'].forEach(type => {
            const btn = document.getElementById(`btn-${type}`);
            btn === null || btn === void 0 ? void 0 : btn.addEventListener('click', () => this.selectTransportType(type));
        });
        // Gestion du changement de type de produit
        const productTypeSelect = document.getElementById('product-type');
        productTypeSelect === null || productTypeSelect === void 0 ? void 0 : productTypeSelect.addEventListener('change', () => this.toggleToxicityField());
        const addProductTypeSelect = document.getElementById('add-product-type');
        addProductTypeSelect === null || addProductTypeSelect === void 0 ? void 0 : addProductTypeSelect.addEventListener('change', () => this.toggleAddToxicityField());
        // Création de la cargaison
        const createCargoBtn = document.getElementById('create-cargo');
        createCargoBtn === null || createCargoBtn === void 0 ? void 0 : createCargoBtn.addEventListener('click', () => this.createCargaison());
        // Ajout de produit
        const addProductBtn = document.getElementById('add-product');
        addProductBtn === null || addProductBtn === void 0 ? void 0 : addProductBtn.addEventListener('click', () => this.addProduct());
        // Validation de la cargaison
        const validateCargoBtn = document.getElementById('validate-cargo');
        validateCargoBtn === null || validateCargoBtn === void 0 ? void 0 : validateCargoBtn.addEventListener('click', () => this.validateCargaison());
        // Reset de la cargaison
        const resetCargoBtn = document.getElementById('reset-cargo');
        resetCargoBtn === null || resetCargoBtn === void 0 ? void 0 : resetCargoBtn.addEventListener('click', () => this.resetCargaison());
    }
    selectTransportType(type) {
        // Mettre à jour l'interface
        document.querySelectorAll('.cargo-type-btn').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-white', 'ring-opacity-50');
        });
        const selectedBtn = document.getElementById(`btn-${type}`);
        selectedBtn === null || selectedBtn === void 0 ? void 0 : selectedBtn.classList.add('ring-4', 'ring-white', 'ring-opacity-50');
        // Afficher le formulaire
        const form = document.getElementById('initial-product-form');
        form === null || form === void 0 ? void 0 : form.classList.remove('hidden');
        // Mettre à jour les options de produit selon le type de transport
        this.updateProductOptions(type);
    }
    updateProductOptions(transportType) {
        const productSelect = document.getElementById('product-type');
        const addProductSelect = document.getElementById('add-product-type');
        let options = '';
        switch (transportType) {
            case 'maritime':
                options = `
                    <option value="">Sélectionner un type</option>
                    <option value="alimentaire">Alimentaire</option>
                    <option value="chimique">Chimique</option>
                    <option value="fragile">Matériel fragile</option>
                    <option value="incassable">Matériel incassable</option>
                `;
                break;
            case 'aerienne':
            case 'routiere':
                options = `
                    <option value="">Sélectionner un type</option>
                    <option value="alimentaire">Alimentaire</option>
                    <option value="fragile">Matériel fragile</option>
                    <option value="incassable">Matériel incassable</option>
                `;
                break;
        }
        if (productSelect)
            productSelect.innerHTML = options;
        if (addProductSelect)
            addProductSelect.innerHTML = options;
    }
    toggleToxicityField() {
        const productType = document.getElementById('product-type').value;
        const toxicityField = document.getElementById('toxicity-field');
        if (productType === 'chimique') {
            toxicityField === null || toxicityField === void 0 ? void 0 : toxicityField.classList.remove('hidden');
        }
        else {
            toxicityField === null || toxicityField === void 0 ? void 0 : toxicityField.classList.add('hidden');
        }
    }
    toggleAddToxicityField() {
        const productType = document.getElementById('add-product-type').value;
        const toxicityField = document.getElementById('add-toxicity-field');
        if (productType === 'chimique') {
            toxicityField === null || toxicityField === void 0 ? void 0 : toxicityField.classList.remove('hidden');
        }
        else {
            toxicityField === null || toxicityField === void 0 ? void 0 : toxicityField.classList.add('hidden');
        }
    }
    createCargaison() {
        var _a;
        try {
            const transportType = (_a = document.querySelector('.cargo-type-btn.ring-4')) === null || _a === void 0 ? void 0 : _a.id.replace('btn-', '');
            const distance = parseFloat(document.getElementById('distance').value);
            const productType = document.getElementById('product-type').value;
            const label = document.getElementById('product-label').value;
            const weight = parseFloat(document.getElementById('product-weight').value);
            const toxicity = parseInt(document.getElementById('product-toxicity').value);
            if (!transportType || !distance || !productType || !label || !weight) {
                throw new Error('Veuillez remplir tous les champs obligatoires');
            }
            // Créer le produit initial
            const initialProduct = this.createProduct(productType, label, weight, toxicity);
            // Créer la cargaison
            switch (transportType) {
                case 'maritime':
                    this.currentCargaison = new Maritime_1.Maritime(initialProduct, distance);
                    break;
                case 'aerienne':
                    this.currentCargaison = new Aerienne_1.Aerienne(initialProduct, distance);
                    break;
                case 'routiere':
                    this.currentCargaison = new Routiere_1.Routiere(initialProduct, distance);
                    break;
                default:
                    throw new Error('Type de transport non reconnu');
            }
            this.updateUI();
            this.clearInitialForm();
        }
        catch (error) {
            alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    addProduct() {
        if (!this.currentCargaison)
            return;
        try {
            const productType = document.getElementById('add-product-type').value;
            const label = document.getElementById('add-product-label').value;
            const weight = parseFloat(document.getElementById('add-product-weight').value);
            const toxicity = parseInt(document.getElementById('add-product-toxicity').value);
            if (!productType || !label || !weight) {
                throw new Error('Veuillez remplir tous les champs obligatoires');
            }
            const product = this.createProduct(productType, label, weight, toxicity);
            this.currentCargaison.ajouterProduit(product);
            this.updateUI();
            this.clearAddForm();
        }
        catch (error) {
            alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    createProduct(type, label, weight, toxicity) {
        switch (type) {
            case 'alimentaire':
                return new Alimentaire_1.Alimentaire(label, weight);
            case 'chimique':
                if (toxicity === undefined || isNaN(toxicity)) {
                    throw new Error('Le degré de toxicité est requis pour les produits chimiques');
                }
                return new Chimique_1.Chimique(label, weight, toxicity);
            case 'fragile':
                return new Fragile_1.Fragile(label, weight);
            case 'incassable':
                return new Incassable_1.Incassable(label, weight);
            default:
                throw new Error('Type de produit non reconnu');
        }
    }
    updateUI() {
        var _a, _b;
        if (!this.currentCargaison)
            return;
        // Afficher le dashboard
        (_a = document.getElementById('empty-state')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
        (_b = document.getElementById('cargo-dashboard')) === null || _b === void 0 ? void 0 : _b.classList.remove('hidden');
        // Mettre à jour les informations
        const transportType = this.currentCargaison.constructor.name.toLowerCase();
        const icons = { maritime: '🚢', aerienne: '✈️', routiere: '🚛' };
        const names = { maritime: 'Transport Maritime', aerienne: 'Transport Aérien', routiere: 'Transport Routier' };
        document.getElementById('cargo-icon').textContent = icons[transportType];
        document.getElementById('cargo-type-name').textContent = names[transportType];
        document.getElementById('cargo-distance').textContent = `Distance: ${this.currentCargaison.getDistance()} km`;
        document.getElementById('product-count').textContent = this.currentCargaison.nbProduit().toString();
        document.getElementById('total-cost').textContent = `${this.currentCargaison.sommeTotale().toLocaleString()} FCFA`;
        // Mettre à jour le compteur de produits
        document.getElementById('product-counter').textContent = this.currentCargaison.nbProduit().toString();
        // Mettre à jour le résumé
        this.updateSummary();
        // Mettre à jour la liste des produits
        this.updateProductsList();
        // Mettre à jour le header compteur (sans re-render complet)
        const headerCounter = document.querySelector('header .text-sm.text-gray-500');
        if (headerCounter) {
            headerCounter.textContent = `${this.currentCargaison.nbProduit()}/10 produits`;
        }
    }
    updateSummary() {
        if (!this.currentCargaison)
            return;
        const summarySection = document.getElementById('cargo-summary');
        if (this.currentCargaison.nbProduit() > 0) {
            summarySection === null || summarySection === void 0 ? void 0 : summarySection.classList.remove('hidden');
            document.getElementById('summary-product-count').textContent = this.currentCargaison.nbProduit().toString();
            document.getElementById('summary-distance').textContent = `${this.currentCargaison.getDistance()} km`;
            document.getElementById('summary-total-cost').textContent = `${this.currentCargaison.sommeTotale().toLocaleString()} FCFA`;
        }
        else {
            summarySection === null || summarySection === void 0 ? void 0 : summarySection.classList.add('hidden');
        }
    }
    validateCargaison() {
        var _a, _b;
        if (!this.currentCargaison)
            return;
        const totalCost = this.currentCargaison.sommeTotale();
        const productCount = this.currentCargaison.nbProduit();
        const transportType = this.currentCargaison.constructor.name;
        const distance = this.currentCargaison.getDistance();
        const modalHtml = `
            <div id="validation-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                    <div class="text-center">
                        <div class="text-6xl mb-4">ok</div>
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Cargaison Validée !</h2>
                        
                        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <h3 class="font-medium text-gray-900 mb-3">Détails de la cargaison :</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Type de transport :</span>
                                    <span class="font-medium">${transportType}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Distance :</span>
                                    <span class="font-medium">${distance} km</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Nombre de produits :</span>
                                    <span class="font-medium">${productCount}</span>
                                </div>
                                <div class="flex justify-between border-t pt-2 mt-2">
                                    <span class="text-gray-900 font-medium">Coût total :</span>
                                    <span class="font-bold text-green-600">${totalCost.toLocaleString()} FCFA</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex gap-3">
                            <button id="close-modal" class="flex-1 btn-primary">Fermer</button>
                            <button id="new-cargo" class="flex-1 btn-secondary">Nouvelle cargaison</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        (_a = document.getElementById('close-modal')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            var _a;
            (_a = document.getElementById('validation-modal')) === null || _a === void 0 ? void 0 : _a.remove();
        });
        (_b = document.getElementById('new-cargo')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            var _a;
            (_a = document.getElementById('validation-modal')) === null || _a === void 0 ? void 0 : _a.remove();
            this.resetCargaison();
        });
    }
    resetCargaison() {
        var _a, _b, _c;
        this.currentCargaison = null;
        (_a = document.getElementById('cargo-dashboard')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
        (_b = document.getElementById('empty-state')) === null || _b === void 0 ? void 0 : _b.classList.remove('hidden');
        this.clearInitialForm();
        this.clearAddForm();
        document.querySelectorAll('.cargo-type-btn').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-white', 'ring-opacity-50');
        });
        (_c = document.getElementById('initial-product-form')) === null || _c === void 0 ? void 0 : _c.classList.add('hidden');
        this.render();
    }
    updateProductsList() {
        if (!this.currentCargaison)
            return;
        const productsList = document.getElementById('products-list');
        if (!productsList)
            return;
        const products = this.currentCargaison.getProduits();
        if (products.length === 0) {
            productsList.innerHTML = '<p class="text-gray-500 text-center py-8">Aucun produit dans la cargaison</p>';
            return;
        }
        productsList.innerHTML = products.map((product, index) => {
            const info = product.info();
            const typeProduit = product.constructor.name.toLowerCase();
            const frais = this.currentCargaison.calculerFrais(typeProduit, product.getPoids());
            const typeIcons = {
                alimentaire: 'alimentaire',
                chimique: 'chimique',
                fragile: 'fragile',
                incassable: 'incassable'
            };
            const typeNames = {
                alimentaire: 'Alimentaire',
                chimique: 'Chimique',
                fragile: 'Matériel fragile',
                incassable: 'Matériel incassable'
            };
            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div class="flex items-start justify-between">
                        <div class="flex items-center">
                            <span class="text-3xl mr-4">${typeIcons[typeProduit] || '📦'}</span>
                            <div>
                                <h4 class="font-semibold text-gray-900 text-lg">${product.getLibelle()}</h4>
                                <p class="text-sm text-gray-600 mb-1">
                                    <span class="inline-block mr-4">📂 ${typeNames[typeProduit] || typeProduit}</span>
                                    <span class="inline-block">⚖️ ${product.getPoids()} kg</span>
                                </p>
                                ${info.length > 2 ? `<p class="text-xs text-gray-500">${info.slice(2).join(' • ')}</p>` : ''}
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-xl font-bold text-blue-600">${frais.toLocaleString()} FCFA</div>
                            <div class="text-sm text-gray-500">Frais de transport</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    clearInitialForm() {
        var _a;
        const inputs = ['distance', 'product-label', 'product-weight', 'product-toxicity'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input)
                input.value = '';
        });
        const selects = ['product-type'];
        selects.forEach(id => {
            const select = document.getElementById(id);
            if (select)
                select.value = '';
        });
        (_a = document.getElementById('toxicity-field')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
    }
    clearAddForm() {
        var _a;
        const inputs = ['add-product-label', 'add-product-weight', 'add-product-toxicity'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input)
                input.value = '';
        });
        const selects = ['add-product-type'];
        selects.forEach(id => {
            const select = document.getElementById(id);
            if (select)
                select.value = '';
        });
        (_a = document.getElementById('add-toxicity-field')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
    }
}
exports.AppManager = AppManager;
