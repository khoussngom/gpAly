import { Cargaison } from '../models/Cargaison';
import { Produit } from '../models/Produit';
import { Maritime } from '../models/Maritime';
import { Aerienne } from '../models/Aerienne';
import { Routiere } from '../models/Routiere';
import { Alimentaire } from '../models/Alimentaire';
import { Chimique } from '../models/Chimique';
import { Fragile } from '../models/Fragile';
import { Incassable } from '../models/Incassable';

export class AppManager {
    private container: HTMLElement;
    private currentCargaison: Cargaison | null = null;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public init(): void {
        this.render();
        this.attachEventListeners();
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
                </div>
            </header>


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
                                            <div class="text-center">
                                                <div class="font-semibold">Maritime</div>
                                                <div class="text-sm opacity-90">Transport par mer</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button id="btn-aerienne" class="cargo-type-btn cargo-aerienne text-white p-4 rounded-lg font-medium transition-all hover:scale-105">
                                        <div class="flex items-center justify-center">
                                            <div class="text-center">
                                                <div class="font-semibold">Aérienne</div>
                                                <div class="text-sm opacity-90">Transport aérien</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button id="btn-routiere" class="cargo-type-btn cargo-routiere text-white p-4 rounded-lg font-medium transition-all hover:scale-105">
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


                            <div class="card">
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="text-lg font-semibold text-gray-900">Produits dans la cargaison</h3>
                                    <div class="text-sm text-gray-600">
                                        <span id="product-counter">0</span> produit(s)
                                    </div>
                                </div>
                                <div id="products-list" class="space-y-3">


                                </div>
                                

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
                            <div class="text-6xl mb-4">Colis</div>
                            <h3 class="text-xl font-medium text-gray-900 mb-2">Aucune cargaison</h3>
                            <p class="text-gray-600">Créez une nouvelle cargaison pour commencer</p>
                        </div>
                    </div>
                </div>
            </main>
        `;
    }

    private attachEventListeners(): void {

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

    private createCargaison(): void {
        try {
            const transportType = document.querySelector('.cargo-type-btn.ring-4')?.id.replace('btn-', '');
            const distance = parseFloat((document.getElementById('distance') as HTMLInputElement).value);
            const productType = (document.getElementById('product-type') as HTMLSelectElement).value;
            const label = (document.getElementById('product-label') as HTMLInputElement).value;
            const weight = parseFloat((document.getElementById('product-weight') as HTMLInputElement).value);
            const toxicity = parseInt((document.getElementById('product-toxicity') as HTMLInputElement).value);

            if (!transportType || !distance || !productType || !label || !weight) {
                throw new Error('Veuillez remplir tous les champs obligatoires');
            }

            const initialProduct = this.createProduct(productType, label, weight, toxicity);

            switch (transportType) {
                case 'maritime':
                    this.currentCargaison = new Maritime(initialProduct, distance);
                    break;
                case 'aerienne':
                    this.currentCargaison = new Aerienne(initialProduct, distance);
                    break;
                case 'routiere':
                    this.currentCargaison = new Routiere(initialProduct, distance);
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

    private addProduct(): void {
        if (!this.currentCargaison) return;

        try {
            const productType = (document.getElementById('add-product-type') as HTMLSelectElement).value;
            const label = (document.getElementById('add-product-label') as HTMLInputElement).value;
            const weight = parseFloat((document.getElementById('add-product-weight') as HTMLInputElement).value);
            const toxicity = parseInt((document.getElementById('add-product-toxicity') as HTMLInputElement).value);

            if (!productType || !label || !weight) {
                throw new Error('Veuillez remplir tous les champs obligatoires');
            }

            const product = this.createProduct(productType, label, weight, toxicity);
            this.currentCargaison.ajouterProduit(product);
            
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
        const icons = { maritime: 'maritime', aerienne: 'aerienne', routiere: 'routiére' };
        const names = { maritime: 'Transport Maritime', aerienne: 'Transport Aérien', routiere: 'Transport Routier' };

        document.getElementById('cargo-icon')!.textContent = icons[transportType as keyof typeof icons];
        document.getElementById('cargo-type-name')!.textContent = names[transportType as keyof typeof names];
        document.getElementById('cargo-distance')!.textContent = `Distance: ${this.currentCargaison.getDistance()} km`;
        document.getElementById('product-count')!.textContent = this.currentCargaison.nbProduit().toString();
        document.getElementById('total-cost')!.textContent = `${this.currentCargaison.sommeTotale().toLocaleString()} FCFA`;

        document.getElementById('product-counter')!.textContent = this.currentCargaison.nbProduit().toString();

        this.updateSummary();

        this.updateProductsList();

        const headerCounter = document.querySelector('header .text-sm.text-gray-500');
        if (headerCounter) {
            headerCounter.textContent = `${this.currentCargaison.nbProduit()}/10 produits`;
        }
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

        document.getElementById('close-modal')?.addEventListener('click', () => {
            document.getElementById('validation-modal')?.remove();
        });

        document.getElementById('new-cargo')?.addEventListener('click', () => {
            document.getElementById('validation-modal')?.remove();
            this.resetCargaison();
        });
    }

    private resetCargaison(): void {
        this.currentCargaison = null;
        
        document.getElementById('cargo-dashboard')?.classList.add('hidden');
        document.getElementById('empty-state')?.classList.remove('hidden');

        this.clearInitialForm();
        this.clearAddForm();

        document.querySelectorAll('.cargo-type-btn').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-white', 'ring-opacity-50');
        });

        document.getElementById('initial-product-form')?.classList.add('hidden');

        this.render();
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

        productsList.innerHTML = products.map((product, index) => {
            const info = product.info();
            const typeProduit = product.constructor.name.toLowerCase();
            const frais = this.currentCargaison!.calculerFrais(typeProduit, product.getPoids());
            
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
                            <span class="text-3xl mr-4">${typeIcons[typeProduit as keyof typeof typeIcons] || 'colis'}</span>
                            <div>
                                <h4 class="font-semibold text-gray-900 text-lg">${product.getLibelle()}</h4>
                                <p class="text-sm text-gray-600 mb-1">
                                    <span class="inline-block mr-4">${typeNames[typeProduit as keyof typeof typeNames] || typeProduit}</span>
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

    private clearInitialForm(): void {
        const inputs = ['distance', 'product-label', 'product-weight', 'product-toxicity'];
        inputs.forEach(id => {
            const input = document.getElementById(id) as HTMLInputElement;
            if (input) input.value = '';
        });
        
        const selects = ['product-type'];
        selects.forEach(id => {
            const select = document.getElementById(id) as HTMLSelectElement;
            if (select) select.value = '';
        });

        document.getElementById('toxicity-field')?.classList.add('hidden');
    }

    private clearAddForm(): void {
        const inputs = ['add-product-label', 'add-product-weight', 'add-product-toxicity'];
        inputs.forEach(id => {
            const input = document.getElementById(id) as HTMLInputElement;
            if (input) input.value = '';
        });
        
        const selects = ['add-product-type'];
        selects.forEach(id => {
            const select = document.getElementById(id) as HTMLSelectElement;
            if (select) select.value = '';
        });

        document.getElementById('add-toxicity-field')?.classList.add('hidden');
    }
}
