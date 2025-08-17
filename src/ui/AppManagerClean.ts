import { Cargaison, Coordonnee } from '../models/Cargaison';
import { GestionnaireCargaisons } from '../models/GestionnaireCargaisons';
import { Maritime } from '../models/Maritime';
import { Aerienne } from '../models/Aerienne';
import { Routiere } from '../models/Routiere';
import { CargaisonManager } from './CargaisonManager';
import { Alimentaire } from '../models/Alimentaire';
import { Client } from '../models/Client';
import { Colis } from '../models/Colis';

declare const L: any;

export class AppManager {
    private gestionnaire: GestionnaireCargaisons;
    private cargaisonManager: CargaisonManager;
    private currentTab: 'create' | 'manage' = 'create';
    private selectedCargaisonType: 'maritime' | 'aerienne' | 'routiere' | null = null;
    private map: any = null;
    private coordinatesDepart: { lat: number; lng: number } | null = null;
    private coordinatesArrivee: { lat: number; lng: number } | null = null;
    private selectingFor: 'depart' | 'arrivee' | null = null;

    constructor() {
        this.gestionnaire = new GestionnaireCargaisons();
        // On passera le container plus tard dans la méthode init
        this.cargaisonManager = null as any;
    }

    public init(): void {
        this.render();
        this.attachEventListeners();
        
        // Initialiser le CargaisonManager avec le container approprié
        const manageContainer = document.getElementById('manage-view');
        if (manageContainer) {
            this.cargaisonManager = new CargaisonManager(manageContainer);
            this.cargaisonManager.init();
        }
    }

    private render(): void {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

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

    private renderCreateView(): string {
        const typeSelectionHTML = `
            <div id="create-view" class="max-w-4xl mx-auto">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Créer une nouvelle cargaison</h2>
                    
                    <div class="mb-8">
                        <label class="block text-sm font-medium text-gray-700 mb-4">Type de transport</label>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button id="btn-maritime" class="cargo-type-btn p-6 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${this.selectedCargaisonType === 'maritime' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}">
                                <div class="text-center">
                                    <div class="text-4xl mb-2">🚢</div>
                                    <div class="font-semibold text-gray-800">Maritime</div>
                                    <div class="text-sm text-gray-600">Transport par mer</div>
                                </div>
                            </button>
                            <button id="btn-aerienne" class="cargo-type-btn p-6 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${this.selectedCargaisonType === 'aerienne' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}">
                                <div class="text-center">
                                    <div class="text-4xl mb-2">✈️</div>
                                    <div class="font-semibold text-gray-800">Aérienne</div>
                                    <div class="text-sm text-gray-600">Transport aérien</div>
                                </div>
                            </button>
                            <button id="btn-routiere" class="cargo-type-btn p-6 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${this.selectedCargaisonType === 'routiere' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}">
                                <div class="text-center">
                                    <div class="text-4xl mb-2">🚛</div>
                                    <div class="font-semibold text-gray-800">Routière</div>
                                    <div class="text-sm text-gray-600">Transport terrestre</div>
                                </div>
                            </button>
                        </div>
                    </div>`;

        const formHTML = `
                    <div id="form-container" class="${!this.selectedCargaisonType ? 'hidden' : ''}">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label for="numero" class="block text-sm font-medium text-gray-700 mb-2">Numéro</label>
                                <input type="text" id="numero" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="CARGO-2024-001">
                            </div>
                            <div>
                                <label for="poids-max" class="block text-sm font-medium text-gray-700 mb-2">Poids max (kg)</label>
                                <input type="number" id="poids-max" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="1000">
                            </div>
                        </div>
                        ${this.renderCoordinatesSection()}
                        ${this.renderMapSection()}
                        <div id="specific-fields" class="mb-6">
                            ${this.renderSpecificFields()}
                        </div>
                        <div class="flex justify-end">
                            <button id="btn-create-cargaison" class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Créer la cargaison
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;

        return typeSelectionHTML + formHTML;
    }

    private renderCoordinatesSection(): string {
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
            </div>`;
    }

    private renderMapSection(): string {
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

    private renderSpecificFields(): string {
        if (!this.selectedCargaisonType) return '';

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

    private attachEventListeners(): void {
        // Tab navigation
        const tabCreate = document.getElementById('tab-create');
        const tabManage = document.getElementById('tab-manage');

        if (tabCreate) {
            tabCreate.addEventListener('click', () => this.switchTab('create'));
        }
        if (tabManage) {
            tabManage.addEventListener('click', () => this.switchTab('manage'));
        }

        // Cargo type selection
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

        // Coordinate selection
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

        // Form submission
        const btnCreateCargaison = document.getElementById('btn-create-cargaison');
        if (btnCreateCargaison) {
            btnCreateCargaison.addEventListener('click', () => this.createCargaison());
        }
    }

    private switchTab(tab: 'create' | 'manage'): void {
        this.currentTab = tab;
        
        if (tab === 'manage') {
            const tabContent = document.getElementById('tab-content');
            if (tabContent) {
                tabContent.innerHTML = '<div id="manage-view"></div>';
                const manageContainer = document.getElementById('manage-view');
                if (manageContainer) {
                    this.cargaisonManager = new CargaisonManager(manageContainer);
                    this.cargaisonManager.init();
                }
            }
        } else {
            this.render();
            this.attachEventListeners();
        }
    }

    private selectCargaisonType(type: 'maritime' | 'aerienne' | 'routiere'): void {
        this.selectedCargaisonType = type;
        
        const formContainer = document.getElementById('form-container');
        const specificFields = document.getElementById('specific-fields');
        
        if (formContainer) {
            formContainer.classList.remove('hidden');
        }
        
        if (specificFields) {
            specificFields.innerHTML = this.renderSpecificFields();
        }

        // Update button styles
        document.querySelectorAll('.cargo-type-btn').forEach(btn => {
            btn.classList.remove('border-blue-500', 'bg-blue-50');
            btn.classList.add('border-gray-200');
        });
        
        const selectedBtn = document.getElementById(`btn-${type}`);
        if (selectedBtn) {
            selectedBtn.classList.remove('border-gray-200');
            selectedBtn.classList.add('border-blue-500', 'bg-blue-50');
        }

        // Re-attach event listeners for new elements
        this.attachEventListeners();
    }

    private openMapForSelection(type: 'depart' | 'arrivee'): void {
        this.selectingFor = type;
        const mapContainer = document.getElementById('map-container');
        
        if (mapContainer) {
            mapContainer.classList.remove('hidden');
            
            if (!this.map) {
                this.initializeMap();
            }
        }
    }

    private closeMap(): void {
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.classList.add('hidden');
        }
        this.selectingFor = null;
    }

    private initializeMap(): void {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        this.map = L.map('map').setView([36.8065, 10.1815], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.map.on('click', (e: any) => {
            if (this.selectingFor) {
                const { lat, lng } = e.latlng;
                this.setCoordinates(this.selectingFor, lat, lng);
            }
        });
    }

    private setCoordinates(type: 'depart' | 'arrivee', lat: number, lng: number): void {
        if (type === 'depart') {
            this.coordinatesDepart = { lat, lng };
            const latInput = document.getElementById('lat-depart') as HTMLInputElement;
            const lngInput = document.getElementById('lng-depart') as HTMLInputElement;
            
            if (latInput) latInput.value = lat.toFixed(6);
            if (lngInput) lngInput.value = lng.toFixed(6);
        } else {
            this.coordinatesArrivee = { lat, lng };
            const latInput = document.getElementById('lat-arrivee') as HTMLInputElement;
            const lngInput = document.getElementById('lng-arrivee') as HTMLInputElement;
            
            if (latInput) latInput.value = lat.toFixed(6);
            if (lngInput) lngInput.value = lng.toFixed(6);
        }

        if (this.map) {
            L.marker([lat, lng]).addTo(this.map)
                .bindPopup(`${type === 'depart' ? 'Départ' : 'Arrivée'}: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
                .openPopup();
        }

        this.closeMap();
    }

    private createCargaison(): void {
        if (!this.selectedCargaisonType) {
            alert('Veuillez sélectionner un type de transport');
            return;
        }

        const numeroInput = document.getElementById('numero') as HTMLInputElement;
        const poidsMaxInput = document.getElementById('poids-max') as HTMLInputElement;

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

        // Créer un produit et un colis initial pour la cargaison
        const produitInitial = new Alimentaire(`Produit initial ${numero}`, 1); // 1kg par défaut
        const clientInitial = new Client('Client', 'Initial', '0000000000', 'Adresse initiale');
        const colisInitial = new Colis(produitInitial, `COLIS-${numero}`, clientInitial);

        // Calculer la distance approximative entre les coordonnées
        const distance = this.calculateDistance(
            this.coordinatesDepart.lat, this.coordinatesDepart.lng,
            this.coordinatesArrivee.lat, this.coordinatesArrivee.lng
        );

        const lieuDepart: Coordonnee = { 
            latitude: this.coordinatesDepart.lat, 
            longitude: this.coordinatesDepart.lng,
            ville: 'Départ'
        };
        const lieuArrivee: Coordonnee = { 
            latitude: this.coordinatesArrivee.lat, 
            longitude: this.coordinatesArrivee.lng,
            ville: 'Arrivée'
        };

        let cargaison: Cargaison;

        try {
            switch (this.selectedCargaisonType) {
                case 'maritime':
                    const nomNavireInput = document.getElementById('nom-navire') as HTMLInputElement;
                    const portDepartInput = document.getElementById('port-depart') as HTMLInputElement;
                    const portArriveeInput = document.getElementById('port-arrivee') as HTMLInputElement;

                    if (!nomNavireInput || !portDepartInput || !portArriveeInput) {
                        throw new Error('Champs maritime manquants');
                    }

                    cargaison = this.gestionnaire.creerCargaison(
                        'maritime',
                        colisInitial,
                        distance,
                        lieuDepart,
                        lieuArrivee
                    );
                    break;

                case 'aerienne':
                    const numeroVolInput = document.getElementById('numero-vol') as HTMLInputElement;
                    const aeroportDepartInput = document.getElementById('aeroport-depart') as HTMLInputElement;
                    const aeroportArriveeInput = document.getElementById('aeroport-arrivee') as HTMLInputElement;

                    if (!numeroVolInput || !aeroportDepartInput || !aeroportArriveeInput) {
                        throw new Error('Champs aériens manquants');
                    }

                    cargaison = this.gestionnaire.creerCargaison(
                        'aerienne',
                        colisInitial,
                        distance,
                        lieuDepart,
                        lieuArrivee
                    );
                    break;

                case 'routiere':
                    const immatriculationInput = document.getElementById('immatriculation') as HTMLInputElement;
                    const nomChauffeurInput = document.getElementById('nom-chauffeur') as HTMLInputElement;

                    if (!immatriculationInput || !nomChauffeurInput) {
                        throw new Error('Champs routiers manquants');
                    }

                    cargaison = this.gestionnaire.creerCargaison(
                        'routiere',
                        colisInitial,
                        distance,
                        lieuDepart,
                        lieuArrivee
                    );
                    break;

                default:
                    throw new Error('Type de cargaison non supporté');
            }

            // La cargaison est déjà ajoutée par creerCargaison
            this.saveCargaisonToServer(cargaison);
            alert('Cargaison créée avec succès !');
            this.resetForm();

        } catch (error) {
            console.error('Erreur lors de la création de la cargaison:', error);
            alert('Erreur lors de la création de la cargaison');
        }
    }

    private async saveCargaisonToServer(cargaison: Cargaison): Promise<void> {
        try {
            const response = await fetch('http://localhost:3002/cargaisons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: cargaison.getNumero(),
                    type: this.selectedCargaisonType,
                    numero: cargaison.getNumero(),
                    poidsMax: cargaison.getPoidsMax(),
                    coordinatesDepart: {
                        lat: cargaison.getLieuDepart().latitude,
                        lng: cargaison.getLieuDepart().longitude
                    },
                    coordinatesArrivee: {
                        lat: cargaison.getLieuArrivee().latitude,
                        lng: cargaison.getLieuArrivee().longitude
                    },
                    dateCreation: new Date().toISOString(),
                    statut: 'ouverte',
                    colis: [],
                    specificData: this.getSpecificData(cargaison)
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }

    private getSpecificData(cargaison: Cargaison): any {
        if (cargaison instanceof Maritime) {
            return {
                nomNavire: (cargaison as any).nomNavire,
                portDepart: (cargaison as any).portDepart,
                portArrivee: (cargaison as any).portArrivee
            };
        } else if (cargaison instanceof Aerienne) {
            return {
                numeroVol: (cargaison as any).numeroVol,
                aeroportDepart: (cargaison as any).aeroportDepart,
                aeroportArrivee: (cargaison as any).aeroportArrivee
            };
        } else if (cargaison instanceof Routiere) {
            return {
                immatriculation: (cargaison as any).immatriculation,
                nomChauffeur: (cargaison as any).nomChauffeur
            };
        }
        return {};
    }

    private resetForm(): void {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type !== 'button') {
                input.value = '';
            }
        });

        this.coordinatesDepart = null;
        this.coordinatesArrivee = null;
        this.selectingFor = null;
        this.selectedCargaisonType = null;

        document.querySelectorAll('.cargo-type-btn').forEach(btn => {
            btn.classList.remove('border-blue-500', 'bg-blue-50');
            btn.classList.add('border-gray-200');
        });

        const formContainer = document.getElementById('form-container');
        if (formContainer) {
            formContainer.classList.add('hidden');
        }

        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.classList.add('hidden');
        }

        if (this.map) {
            this.map.eachLayer((layer: any) => {
                if (layer instanceof L.Marker) {
                    this.map.removeLayer(layer);
                }
            });
        }
    }

    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371; // Rayon de la Terre en kilomètres
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
