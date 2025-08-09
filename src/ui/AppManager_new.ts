import { Cargaison, Coordonnee } from '../models/Cargaison';
import { Produit } from '../models/Produit';
import { Maritime } from '../models/Maritime';
import { Aerienne } from '../models/Aerienne';
import { Routiere } from '../models/Routiere';
import { Alimentaire } from '../models/Alimentaire';
import { Chimique } from '../models/Chimique';
import { Fragile } from '../models/Fragile';
import { Incassable } from '../models/Incassable';
import { Client } from '../models/Client';
import { Colis } from '../models/Colis';
import { GestionnaireCargaisons } from '../models/GestionnaireCargaisons';
import { MapSelector } from './MapSelector';
import { CargaisonManager } from './CargaisonManager';

export class AppManager {
    private container: HTMLElement;
    private currentCargaison: Cargaison | null = null;
    private gestionnaire: GestionnaireCargaisons;
    private mapSelector: MapSelector | null = null;
    private selectedDepartCoord: Coordonnee | null = null;
    private selectedArriveeCoord: Coordonnee | null = null;
    private cargaisonManager: CargaisonManager | null = null;
    private currentView: 'create' | 'manage' = 'create';

    constructor(container: HTMLElement) {
        this.container = container;
        this.gestionnaire = new GestionnaireCargaisons();
    }

    public init(): void {
        this.render();
        this.attachEventListeners();
        
        // Initialiser le gestionnaire de cargaisons
        const manageViewContainer = document.getElementById('manage-view');
        if (manageViewContainer) {
            this.cargaisonManager = new CargaisonManager(manageViewContainer);
            this.cargaisonManager.init();
        }
    }

    private render(): void {
        this.container.innerHTML = `
        <header class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-6">
                        <div class="flex items-center">
                            <div class="text-center">
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
                    
                    <!-- Navigation avec onglets -->
                    <div class="border-b border-gray-200">
                        <nav class="-mb-px flex space-x-8">
                            <button id="tab-create" class="tab-button ${this.currentView === 'create' ? 'active' : ''} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                                🚚 Créer une cargaison
                            </button>
                            <button id="tab-manage" class="tab-button ${this.currentView === 'manage' ? 'active' : ''} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                                📋 Gérer les cargaisons
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Vue de création de cargaison -->
                <div id="create-view" class="${this.currentView === 'create' ? '' : 'hidden'}">
                    ${this.renderCreateView()}
                </div>
                
                <!-- Vue de gestion des cargaisons -->
                <div id="manage-view" class="${this.currentView === 'manage' ? '' : 'hidden'}">
                </div>
            </main>

            <!-- Modal pour la sélection de coordonnées -->
            <div id="map-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50">
                <div class="flex items-center justify-center w-full h-full p-4">
                    <div class="bg-white rounded-lg p-6 w-11/12 h-5/6 max-w-4xl max-h-[90vh] flex flex-col">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-900" id="map-modal-title">Sélectionner les coordonnées</h3>
                            <button id="close-map-modal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                        </div>
                        
                        <div class="mb-4">
                            <div class="flex gap-2">
                                <input type="text" id="search-location" class="input-field flex-1" placeholder="Rechercher une ville...">
                                <button id="search-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                    🔍 Rechercher
                                </button>
                            </div>
                            <div id="search-results" class="mt-2 max-h-32 overflow-y-auto hidden"></div>
                        </div>
                        
                        <div id="map-container" class="flex-1 border border-gray-300 rounded-lg"></div>
                        
                        <div class="mt-4 flex justify-between items-center">
                            <div id="selected-coordinate-info" class="text-sm text-gray-600"></div>
                            <div class="flex gap-2">
                                <button id="cancel-selection" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                                    Annuler
                                </button>
                                <button id="confirm-selection" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg" disabled>
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private renderCreateView(): string {
        return `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Panneau de création de cargaison -->
                    <div class="lg:col-span-1">
                        <div class="card">
                            <h2 class="text-xl font-semibold text-gray-900 mb-6">Nouvelle Cargaison</h2>
                            
                            <div class="mb-6">
                                <label class="block text-sm font-medium text-gray-700 mb-3">Type de transport</label>
                                <div class="grid grid-cols-1 gap-3">
                                    <button id="btn-maritime" class="cargo-type-btn bg-green-600 text-white p-4 rounded-lg font-medium transition-all hover:scale-105">
                                        <div class="flex items-center justify-center">
                                            <div class="text-center">
                                                <div class="font-semibold">Maritime</div>
                                                <div class="text-sm opacity-90">Transport par mer</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button id="btn-aerienne" class="cargo-type-btn bg-yellow-600 text-white p-4 rounded-lg font-medium transition-all hover:scale-105">
                                        <div class="flex items-center justify-center">
                                            <div class="text-center">
                                                <div class="font-semibold">Aérienne</div>
                                                <div class="text-sm opacity-90">Transport aérien</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button id="btn-routiere" class="cargo-type-btn bg-red-600 text-white p-4 rounded-lg font-medium transition-all hover:scale-105">
                                        <div class="flex items-center justify-center">
                                            <div class="text-center">
                                                <div class="font-semibold">Routière</div>
                                                <div class="text-sm opacity-90">Transport routier</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div id="initial-product-form" class="hidden">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Informations client</h3>
                                <div class="space-y-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                            <input type="text" id="client-nom" class="input-field" placeholder="Nom du client" required>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                            <input type="text" id="client-prenom" class="input-field" placeholder="Prénom du client" required>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                            <input type="tel" id="client-telephone" class="input-field" placeholder="+221 77 123 45 67" required>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Email (facultatif)</label>
                                            <input type="email" id="client-email" class="input-field" placeholder="email@exemple.com">
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                        <textarea id="client-adresse" class="input-field" rows="2" placeholder="Adresse complète du client" required></textarea>
                                    </div>
                                </div>

                                <h3 class="text-lg font-medium text-gray-900 mb-4 mt-6">Informations trajet</h3>
                                <div class="space-y-4">
                                    <div class="grid grid-cols-1 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Lieu de départ</label>
                                            <div class="flex gap-2">
                                                <input type="text" id="lieu-depart" class="input-field flex-1" placeholder="ex: Dakar" required readonly>
                                                <button type="button" id="btn-select-depart" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                                                    📍 Choisir
                                                </button>
                                            </div>
                                            <div id="coord-depart-info" class="text-xs text-gray-500 mt-1 hidden"></div>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Lieu d'arrivée</label>
                                            <div class="flex gap-2">
                                                <input type="text" id="lieu-arrivee" class="input-field flex-1" placeholder="ex: Abidjan" required readonly>
                                                <button type="button" id="btn-select-arrivee" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                                                    📍 Choisir
                                                </button>
                                            </div>
                                            <div id="coord-arrivee-info" class="text-xs text-gray-500 mt-1 hidden"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                                        <input type="number" id="distance" class="input-field" placeholder="Calculée automatiquement" readonly>
                                        <div class="text-xs text-gray-500 mt-1">La distance sera calculée automatiquement entre les deux points</div>
                                    </div>
                                </div>

                                <h3 class="text-lg font-medium text-gray-900 mb-4 mt-6">Produit initial</h3>
                                <div class="space-y-4">
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
                                    <button id="create-cargo" class="bg-blue-600 h-10 rounded-xl text-white w-full">Créer la cargaison</button>
                                </div>
                            </div>
                        </div>
                    </div>

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

                            <div class="card mb-6 bg-white p-3 rounded xl">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Ajouter un produit</h3>
                                <div class="space-y-4">
                                    <h4 class="text-md font-medium text-gray-700">Informations client</h4>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                            <input type="text" id="add-client-nom" class="input-field" placeholder="Nom du client" required>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                            <input type="text" id="add-client-prenom" class="input-field" placeholder="Prénom du client" required>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                            <input type="tel" id="add-client-telephone" class="input-field" placeholder="+221 77 123 45 67" required>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Email (facultatif)</label>
                                            <input type="email" id="add-client-email" class="input-field" placeholder="email@exemple.com">
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                        <textarea id="add-client-adresse" class="input-field" rows="2" placeholder="Adresse complète du client" required></textarea>
                                    </div>

                                    <h4 class="text-md font-medium text-gray-700">Informations produit</h4>
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
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                                            <input type="number" id="add-product-weight" class="input-field" placeholder="ex: 10.5" min="0.1" step="0.1">
                                        </div>
                                        <div id="add-toxicity-field" class="hidden">
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Degré de toxicité (1-10)</label>
                                            <input type="number" id="add-product-toxicity" class="input-field" placeholder="ex: 5" min="1" max="10">
                                        </div>
                                    </div>
                                </div>
                                <button id="add-product" class="bg-blue-600 h-10 rounded-xl text-white mt-4 w-full">Ajouter le produit</button>
                            </div>

                            <div class="card">
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="text-lg font-semibold text-gray-900">Produits dans la cargaison</h3>
                                    <div class="text-sm text-gray-600">
                                        <span id="product-counter">0</span> produit(s)
                                    </div>
                                </div>
                                <div id="products-list" class="space-y-3"></div>
                                
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
                                            Valider la cargaison
                                        </button>
                                        <button id="reset-cargo" class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                                            Recommencer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="empty-state" class="text-center py-12">
                            <div class="text-6xl mb-4">📦</div>
                            <h3 class="text-xl font-medium text-gray-900 mb-2">Aucune cargaison</h3>
                            <p class="text-gray-600">Créez une nouvelle cargaison pour commencer</p>
                        </div>
                    </div>
                </div>
        `;
    }

    private attachEventListeners(): void {
        // Event listeners pour les onglets
        const tabCreate = document.getElementById('tab-create');
        const tabManage = document.getElementById('tab-manage');
        
        tabCreate?.addEventListener('click', () => this.switchTab('create'));
        tabManage?.addEventListener('click', () => this.switchTab('manage'));

        // Event listeners pour la création de cargaison
        ['maritime', 'aerienne', 'routiere'].forEach(type => {
            const btn = document.getElementById(`btn-${type}`);
            btn?.addEventListener('click', () => this.selectTransportType(type));
        });

        const productTypeSelect = document.getElementById('product-type') as HTMLSelectElement;
        productTypeSelect?.addEventListener('change', () => this.toggleToxicityField());

        const addProductTypeSelect = document.getElementById('add-product-type') as HTMLSelectElement;
        addProductTypeSelect?.addEventListener('change', () => this.toggleAddToxicityField());

        const createCargoBtn = document.getElementById('create-cargo');
        createCargoBtn?.addEventListener('click', () => this.createCargaison());

        const addProductBtn = document.getElementById('add-product');
        addProductBtn?.addEventListener('click', () => this.addProduct());

        const validateCargoBtn = document.getElementById('validate-cargo');
        validateCargoBtn?.addEventListener('click', () => this.validateCargaison());

        const resetCargoBtn = document.getElementById('reset-cargo');
        resetCargoBtn?.addEventListener('click', () => this.resetCargaison());

        // Event listeners pour la sélection de coordonnées
        const btnSelectDepart = document.getElementById('btn-select-depart');
        btnSelectDepart?.addEventListener('click', () => this.openMapModal('depart'));

        const btnSelectArrivee = document.getElementById('btn-select-arrivee');
        btnSelectArrivee?.addEventListener('click', () => this.openMapModal('arrivee'));

        const closeMapModal = document.getElementById('close-map-modal');
        closeMapModal?.addEventListener('click', () => this.closeMapModal());

        const cancelSelection = document.getElementById('cancel-selection');
        cancelSelection?.addEventListener('click', () => this.closeMapModal());

        const confirmSelection = document.getElementById('confirm-selection');
        confirmSelection?.addEventListener('click', () => this.confirmCoordinateSelection());

        const searchBtn = document.getElementById('search-btn');
        searchBtn?.addEventListener('click', () => this.searchLocation());

        const searchInput = document.getElementById('search-location') as HTMLInputElement;
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchLocation();
            }
        });
    }

    private switchTab(view: 'create' | 'manage'): void {
        this.currentView = view;
        
        // Mettre à jour l'apparence des onglets
        const createTab = document.getElementById('tab-create');
        const manageTab = document.getElementById('tab-manage');
        
        if (view === 'create') {
            createTab?.classList.add('border-blue-500', 'text-blue-600');
            createTab?.classList.remove('border-transparent', 'text-gray-500');
            manageTab?.classList.add('border-transparent', 'text-gray-500');
            manageTab?.classList.remove('border-blue-500', 'text-blue-600');
        } else {
            manageTab?.classList.add('border-blue-500', 'text-blue-600');
            manageTab?.classList.remove('border-transparent', 'text-gray-500');
            createTab?.classList.add('border-transparent', 'text-gray-500');
            createTab?.classList.remove('border-blue-500', 'text-blue-600');
        }
        
        // Afficher/masquer les vues
        const createView = document.getElementById('create-view');
        const manageView = document.getElementById('manage-view');
        
        if (view === 'create') {
            createView?.classList.remove('hidden');
            manageView?.classList.add('hidden');
        } else {
            createView?.classList.add('hidden');
            manageView?.classList.remove('hidden');
            
            // La vue de gestion se rafraîchira automatiquement
        }
    }

    private selectTransportType(type: string): void {
        document.querySelectorAll('.cargo-type-btn').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-white', 'ring-opacity-50');
        });
        
        const selectedBtn = document.getElementById(`btn-${type}`);
        selectedBtn?.classList.add('ring-4', 'ring-white', 'ring-opacity-50');

        const form = document.getElementById('initial-product-form');
        form?.classList.remove('hidden');

        this.updateProductOptions(type);
    }

    private updateProductOptions(transportType: string): void {
        const productSelect = document.getElementById('product-type') as HTMLSelectElement;
        const addProductSelect = document.getElementById('add-product-type') as HTMLSelectElement;
        
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
        
        if (productSelect) productSelect.innerHTML = options;
        if (addProductSelect) addProductSelect.innerHTML = options;
    }

    private toggleToxicityField(): void {
        const productType = (document.getElementById('product-type') as HTMLSelectElement).value;
        const toxicityField = document.getElementById('toxicity-field');
        
        if (productType === 'chimique') {
            toxicityField?.classList.remove('hidden');
        } else {
            toxicityField?.classList.add('hidden');
        }
    }

    private toggleAddToxicityField(): void {
        const productType = (document.getElementById('add-product-type') as HTMLSelectElement).value;
        const toxicityField = document.getElementById('add-toxicity-field');
        
        if (productType === 'chimique') {
            toxicityField?.classList.remove('hidden');
        } else {
            toxicityField?.classList.add('hidden');
        }
    }

    private afficherErreur(dist: HTMLElement | null, hasError: boolean): boolean {
        if (dist && !dist.parentElement?.querySelector('small')) {
            const small = document.createElement('small');
            small.textContent = 'Ce champ est obligatoire';
            small.style.color = 'red';
            small.style.fontSize = '10px';
            dist.parentElement?.appendChild(small);
        }
        return true;
    }

    private createCargaison(): void {
        try {
            const transportType = document.querySelector('.cargo-type-btn.ring-4')?.id.replace('btn-', '');
            
            const nomClient = (document.getElementById('client-nom') as HTMLInputElement).value;
            const prenomClient = (document.getElementById('client-prenom') as HTMLInputElement).value;
            const telephoneClient = (document.getElementById('client-telephone') as HTMLInputElement).value;
            const adresseClient = (document.getElementById('client-adresse') as HTMLTextAreaElement).value;
            const emailClient = (document.getElementById('client-email') as HTMLInputElement).value;

            const lieuDepart = (document.getElementById('lieu-depart') as HTMLInputElement).value;
            const lieuArrivee = (document.getElementById('lieu-arrivee') as HTMLInputElement).value;
            const distance = parseFloat((document.getElementById('distance') as HTMLInputElement).value);

            const productType = (document.getElementById('product-type') as HTMLSelectElement).value;
            const label = (document.getElementById('product-label') as HTMLInputElement).value;
            const weight = parseFloat((document.getElementById('product-weight') as HTMLInputElement).value);
            const toxicity = parseInt((document.getElementById('product-toxicity') as HTMLInputElement).value);

            let hasError = false;
            const champs = [
                { valeur: nomClient, id: 'client-nom' },
                { valeur: prenomClient, id: 'client-prenom' },
                { valeur: telephoneClient, id: 'client-telephone' },
                { valeur: adresseClient, id: 'client-adresse' },
                { valeur: lieuDepart, id: 'lieu-depart' },
                { valeur: lieuArrivee, id: 'lieu-arrivee' },
                { valeur: distance, id: 'distance' },
                { valeur: productType, id: 'product-type' },
                { valeur: label, id: 'product-label' },
                { valeur: weight, id: 'product-weight' },
            ];

            for (const champ of champs) {
                if (!champ.valeur) {
                    const element = document.getElementById(champ.id);
                    hasError = this.afficherErreur(element, hasError);
                }
            }

            if (!transportType || hasError) {
                return;
            }

            const produit = this.createProduct(productType, label, weight, toxicity);

            const client = new Client(nomClient, prenomClient, telephoneClient, adresseClient, emailClient || undefined);
            
            const code = this.generateCode();

            const colis = new Colis(produit, code, client);

            const coordonneeDepart: Coordonnee = this.selectedDepartCoord || {
                ville: lieuDepart,
                latitude: 14.6928,
                longitude: -17.4467
            };

            const coordonneeArrivee: Coordonnee = this.selectedArriveeCoord || {
                ville: lieuArrivee,
                latitude: 5.3600,
                longitude: -4.0083
            };

            switch (transportType) {
                case 'maritime':
                    this.currentCargaison = this.gestionnaire.creerCargaison('maritime', colis, distance, coordonneeDepart, coordonneeArrivee);
                    break;
                case 'aerienne':
                    this.currentCargaison = this.gestionnaire.creerCargaison('aerienne', colis, distance, coordonneeDepart, coordonneeArrivee);
                    break;
                case 'routiere':
                    this.currentCargaison = this.gestionnaire.creerCargaison('routiere', colis, distance, coordonneeDepart, coordonneeArrivee);
                    break;
                default:
                    throw new Error('Type de transport non reconnu');
            }

            this.updateUI();
            this.clearInitialForm();

        } catch (error) {
            alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    private generateCode(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `COL-${timestamp}-${random}`;
    }

    private addProduct(): void {
        if (!this.currentCargaison) return;

        try {
            const nomClient = (document.getElementById('add-client-nom') as HTMLInputElement).value;
            const prenomClient = (document.getElementById('add-client-prenom') as HTMLInputElement).value;
            const telephoneClient = (document.getElementById('add-client-telephone') as HTMLInputElement).value;
            const adresseClient = (document.getElementById('add-client-adresse') as HTMLTextAreaElement).value;
            const emailClient = (document.getElementById('add-client-email') as HTMLInputElement).value;

            const productType = (document.getElementById('add-product-type') as HTMLSelectElement).value;
            const label = (document.getElementById('add-product-label') as HTMLInputElement).value;
            const weight = parseFloat((document.getElementById('add-product-weight') as HTMLInputElement).value);
            const toxicity = parseInt((document.getElementById('add-product-toxicity') as HTMLInputElement).value);

            if (!nomClient || !prenomClient || !telephoneClient || !adresseClient || !productType || !label || !weight) {
                throw new Error('Veuillez remplir tous les champs obligatoires');
            }

            const product = this.createProduct(productType, label, weight, toxicity);
            
            const client = new Client(nomClient, prenomClient, telephoneClient, adresseClient, emailClient || undefined);
            
            const code = this.generateCode();
            
            const colis = new Colis(product, code, client);
            
            this.currentCargaison.ajouterProduit(colis);
            
            this.updateUI();
            this.clearAddForm();

        } catch (error) {
            alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    private createProduct(type: string, label: string, weight: number, toxicity?: number): Produit {
        switch (type) {
            case 'alimentaire':
                return new Alimentaire(label, weight);
            case 'chimique':
                if (toxicity === undefined || isNaN(toxicity)) {
                    throw new Error('Le degré de toxicité est requis pour les produits chimiques');
                }
                return new Chimique(label, weight, toxicity);
            case 'fragile':
                return new Fragile(label, weight);
            case 'incassable':
                return new Incassable(label, weight);
            default:
                throw new Error('Type de produit non reconnu');
        }
    }

    private updateUI(): void {
        if (!this.currentCargaison) return;

        document.getElementById('empty-state')?.classList.add('hidden');
        document.getElementById('cargo-dashboard')?.classList.remove('hidden');

        const transportType = this.currentCargaison.constructor.name.toLowerCase();
        const icons = { maritime: '🚢', aerienne: '✈️', routiere: '🚛' };
        const names = { maritime: 'Transport Maritime', aerienne: 'Transport Aérien', routiere: 'Transport Routier' };

        document.getElementById('cargo-icon')!.textContent = icons[transportType as keyof typeof icons];
        document.getElementById('cargo-type-name')!.textContent = names[transportType as keyof typeof names];
        document.getElementById('cargo-distance')!.textContent = `Distance: ${this.currentCargaison.getDistance()} km`;
        document.getElementById('product-count')!.textContent = this.currentCargaison.nbProduit().toString();
        document.getElementById('total-cost')!.textContent = `${this.currentCargaison.sommeTotale().toLocaleString()} FCFA`;

        document.getElementById('product-counter')!.textContent = this.currentCargaison.nbProduit().toString();

        this.updateProductsList();
        this.updateSummary();

        const headerCounter = document.querySelector('header .text-sm.text-gray-500');
        if (headerCounter) {
            headerCounter.textContent = `${this.currentCargaison.nbProduit()}/10 produits`;
        }
    }

    private updateProductsList(): void {
        if (!this.currentCargaison) return;

        const productsList = document.getElementById('products-list');
        if (!productsList) return;

        const products = this.currentCargaison.getProduits();
        
        if (products.length === 0) {
            productsList.innerHTML = '<p class="text-gray-500 text-center py-8">Aucun produit dans la cargaison</p>';
            return;
        }

        productsList.innerHTML = products.map((colis, index) => {
            const produit = colis.getProduit();
            const info = produit.info();
            const typeProduit = produit.constructor.name.toLowerCase();
            
            let typeForCalculation = typeProduit;
            if (typeProduit === 'fragile' || typeProduit === 'incassable') {
                typeForCalculation = 'materiel';
            }
            
            const frais = this.currentCargaison!.calculerFrais(typeForCalculation, colis.getPoids());
            
            const type = {
                alimentaire: '🍎',
                chimique: '⚗️',
                fragile: '📦',
                incassable: '📦'
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
                            <span class="text-3xl mr-4">${type[typeProduit as keyof typeof type] || '📦'}</span>
                            <div>
                                <h4 class="font-semibold text-gray-900 text-lg">${colis.getLibelle()}</h4>
                                <p class="text-sm text-gray-600 mb-1">
                                    <span class="inline-block mr-4">${typeNames[typeProduit as keyof typeof typeNames] || typeProduit}</span>
                                    <span class="inline-block">${colis.getPoids()} kg</span>
                                </p>
                                <p class="text-sm text-gray-600 mb-2">
                                    <span class="font-medium">Code:</span> ${colis.getCode()} | 
                                    <span class="font-medium">Client:</span> ${colis.getClient().getNomComplet()}
                                </p>
                                <div class="text-xs text-gray-500">
                                    ${info.join(' • ')}
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-primary-600">${frais.toLocaleString()} FCFA</div>
                            <div class="text-sm text-gray-500">Frais de transport</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    private updateSummary(): void {
        if (!this.currentCargaison) return;

        const summarySection = document.getElementById('cargo-summary');
        if (this.currentCargaison.nbProduit() > 0) {
            summarySection?.classList.remove('hidden');
            
            document.getElementById('summary-product-count')!.textContent = this.currentCargaison.nbProduit().toString();
            document.getElementById('summary-distance')!.textContent = `${this.currentCargaison.getDistance()} km`;
            document.getElementById('summary-total-cost')!.textContent = `${this.currentCargaison.sommeTotale().toLocaleString()} FCFA`;
        } else {
            summarySection?.classList.add('hidden');
        }
    }

    private validateCargaison(): void {
        if (!this.currentCargaison) return;

        try {
            this.currentCargaison.fermerCargaison();
            alert(`Cargaison validée et fermée! Numéro: ${this.currentCargaison.getNumero()}`);
            this.updateUI();
        } catch (error) {
            alert(`Erreur lors de la validation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    private resetCargaison(): void {
        if (confirm('Êtes-vous sûr de vouloir recommencer? Toutes les données seront perdues.')) {
            this.currentCargaison = null;
            document.getElementById('cargo-dashboard')?.classList.add('hidden');
            document.getElementById('empty-state')?.classList.remove('hidden');
            
            document.querySelectorAll('.cargo-type-btn').forEach(btn => {
                btn.classList.remove('ring-4', 'ring-white', 'ring-opacity-50');
            });
            
            document.getElementById('initial-product-form')?.classList.add('hidden');
            
            this.clearInitialForm();
            this.clearAddForm();
        }
    }

    private clearInitialForm(): void {
        const inputs = ['client-nom', 'client-prenom', 'client-telephone', 'client-email', 'client-adresse', 
                    'lieu-depart', 'lieu-arrivee', 'distance', 'product-label', 'product-weight', 'product-toxicity'];
        inputs.forEach(id => {
            const input = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
            if (input) input.value = '';
        });
        
        const selects = ['product-type'];
        selects.forEach(id => {
            const select = document.getElementById(id) as HTMLSelectElement;
            if (select) select.selectedIndex = 0;
        });

        // Réinitialiser les coordonnées
        this.selectedDepartCoord = null;
        this.selectedArriveeCoord = null;
        
        document.getElementById('coord-depart-info')?.classList.add('hidden');
        document.getElementById('coord-arrivee-info')?.classList.add('hidden');
        document.getElementById('toxicity-field')?.classList.add('hidden');
    }

    private clearAddForm(): void {
        const inputs = ['add-client-nom', 'add-client-prenom', 'add-client-telephone', 'add-client-email', 'add-client-adresse',
                    'add-product-label', 'add-product-weight', 'add-product-toxicity'];
        inputs.forEach(id => {
            const input = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
            if (input) input.value = '';
        });
        
        const selects = ['add-product-type'];
        selects.forEach(id => {
            const select = document.getElementById(id) as HTMLSelectElement;
            if (select) select.selectedIndex = 0;
        });

        document.getElementById('add-toxicity-field')?.classList.add('hidden');
    }

    // Méthodes pour la gestion de la carte
    private currentSelectionType: 'depart' | 'arrivee' | null = null;
    private tempSelectedCoord: Coordonnee | null = null;

    private openMapModal(type: 'depart' | 'arrivee'): void {
        this.currentSelectionType = type;
        const modal = document.getElementById('map-modal');
        const titleElement = document.getElementById('map-modal-title');
        
        if (modal && titleElement) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            titleElement.textContent = `Sélectionner le lieu ${type === 'depart' ? 'de départ' : 'd\'arrivée'}`;
            
            // Initialiser la carte
            setTimeout(() => {
                const mapContainer = document.getElementById('map-container');
                if (mapContainer) {
                    this.mapSelector = new MapSelector(mapContainer, (coord) => {
                        this.tempSelectedCoord = coord;
                        this.updateSelectedCoordinateInfo(coord);
                        this.enableConfirmButton();
                    });
                    this.mapSelector.init();
                }
            }, 100);
        }
    }

    private closeMapModal(): void {
        const modal = document.getElementById('map-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        
        if (this.mapSelector) {
            this.mapSelector.destroy();
            this.mapSelector = null;
        }
        
        this.currentSelectionType = null;
        this.tempSelectedCoord = null;
        this.disableConfirmButton();
        this.clearSelectedCoordinateInfo();
    }

    private updateSelectedCoordinateInfo(coord: Coordonnee): void {
        const infoElement = document.getElementById('selected-coordinate-info');
        if (infoElement) {
            infoElement.textContent = `Sélectionné: ${coord.ville} (${coord.latitude.toFixed(4)}, ${coord.longitude.toFixed(4)})`;
        }
    }

    private clearSelectedCoordinateInfo(): void {
        const infoElement = document.getElementById('selected-coordinate-info');
        if (infoElement) {
            infoElement.textContent = '';
        }
    }

    private enableConfirmButton(): void {
        const confirmBtn = document.getElementById('confirm-selection') as HTMLButtonElement;
        if (confirmBtn) {
            confirmBtn.disabled = false;
        }
    }

    private disableConfirmButton(): void {
        const confirmBtn = document.getElementById('confirm-selection') as HTMLButtonElement;
        if (confirmBtn) {
            confirmBtn.disabled = true;
        }
    }

    private confirmCoordinateSelection(): void {
        if (!this.tempSelectedCoord || !this.currentSelectionType) return;

        if (this.currentSelectionType === 'depart') {
            this.selectedDepartCoord = this.tempSelectedCoord;
            const input = document.getElementById('lieu-depart') as HTMLInputElement;
            const info = document.getElementById('coord-depart-info');
            if (input && info) {
                input.value = this.tempSelectedCoord.ville;
                info.textContent = `Lat: ${this.tempSelectedCoord.latitude.toFixed(4)}, Lng: ${this.tempSelectedCoord.longitude.toFixed(4)}`;
                info.classList.remove('hidden');
            }
        } else {
            this.selectedArriveeCoord = this.tempSelectedCoord;
            const input = document.getElementById('lieu-arrivee') as HTMLInputElement;
            const info = document.getElementById('coord-arrivee-info');
            if (input && info) {
                input.value = this.tempSelectedCoord.ville;
                info.textContent = `Lat: ${this.tempSelectedCoord.latitude.toFixed(4)}, Lng: ${this.tempSelectedCoord.longitude.toFixed(4)}`;
                info.classList.remove('hidden');
            }
        }

        // Calculer la distance si les deux coordonnées sont sélectionnées
        this.calculateDistance();
        
        this.closeMapModal();
    }

    private calculateDistance(): void {
        if (this.selectedDepartCoord && this.selectedArriveeCoord) {
            const distance = this.haversineDistance(
                this.selectedDepartCoord.latitude,
                this.selectedDepartCoord.longitude,
                this.selectedArriveeCoord.latitude,
                this.selectedArriveeCoord.longitude
            );
            
            const distanceInput = document.getElementById('distance') as HTMLInputElement;
            if (distanceInput) {
                distanceInput.value = Math.round(distance).toString();
            }
        }
    }

    private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Rayon de la Terre en kilomètres
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    private async searchLocation(): Promise<void> {
        const searchInput = document.getElementById('search-location') as HTMLInputElement;
        const resultsContainer = document.getElementById('search-results');
        
        if (!searchInput || !resultsContainer || !this.mapSelector) return;
        
        const query = searchInput.value.trim();
        if (!query) return;

        try {
            const results = await this.mapSelector.searchLocation(query);
            
            if (results.length === 0) {
                resultsContainer.innerHTML = '<div class="text-gray-500 p-2">Aucun résultat trouvé</div>';
            } else {
                resultsContainer.innerHTML = results.map(result => `
                    <div class="search-result-item p-2 hover:bg-gray-100 cursor-pointer border-b" 
                         data-lat="${result.latitude}" data-lng="${result.longitude}" data-ville="${result.ville}">
                        ${result.ville}
                    </div>
                `).join('');
                
                // Ajouter les event listeners pour les résultats
                resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const lat = parseFloat(item.getAttribute('data-lat') || '0');
                        const lng = parseFloat(item.getAttribute('data-lng') || '0');
                        const ville = item.getAttribute('data-ville') || '';
                        
                        const coord: Coordonnee = { ville, latitude: lat, longitude: lng };
                        this.mapSelector?.centerOnCoordinate(coord);
                        resultsContainer.classList.add('hidden');
                    });
                });
            }
            
            resultsContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Erreur de recherche:', error);
            resultsContainer.innerHTML = '<div class="text-red-500 p-2">Erreur lors de la recherche</div>';
            resultsContainer.classList.remove('hidden');
        }
    }
}
