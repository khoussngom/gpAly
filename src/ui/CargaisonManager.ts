export interface CargaisonAPI {
    id: string;
    type: string;
    numero: string;
    distance: number;
    lieuDepart: {
        ville: string;
        latitude: number;
        longitude: number;
    };
    lieuArrivee: {
        ville: string;
        latitude: number;
        longitude: number;
    };
    dateCreation: string;
    dateDepart: string | null;
    dateArrivee: string | null;
    dateArriveeEstimee: string | null;
    etat: 'ouverte' | 'fermee' | 'en_transit' | 'arrivee' | 'annulee';
    colis: string[];
}

export interface ColisAPI {
    id: string;
    code: string;
    libelle: string;
    poids: number;
    produit: {
        type: string;
        libelle: string;
        poids: number;
        toxicite?: number;
    };
    client: {
        nom: string;
        prenom: string;
        telephone: string;
        adresse: string;
        email?: string;
    };
    etat: 'en_attente' | 'en_transit' | 'arrive' | 'perdu' | 'annule';
    dateCreation: string;
    dateExpedition: string | null;
    dateArrivee: string | null;
    cargaisonId: string;
}

export class CargaisonManager {
    private container: HTMLElement;
    private apiUrl = 'http://localhost:3002';

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public async init(): Promise<void> {
        await this.render();
        this.attachEventListeners();
        await this.loadCargaisons();
    }

    private async render(): Promise<void> {
        this.container.innerHTML = `
            <div class="space-y-6">
                <!-- Recherche de colis -->
                <div class="card">
                    <h2 class="text-xl font-semibold text-gray-900 mb-4">🔍 Recherche de colis</h2>
                    <div class="flex gap-4">
                        <input type="text" id="search-colis-id" class="input-field flex-1" placeholder="Entrez l'ID du colis (ex: COL-1691234567890-5678)">
                        <button id="btn-search-colis" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                            Rechercher
                        </button>
                    </div>
                    <div id="search-result" class="mt-4 hidden"></div>
                </div>

                <!-- Liste des cargaisons -->
                <div class="card">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold text-gray-900"> Gestion des cargaisons</h2>
                        <div class="flex gap-2">
                            <select id="filter-etat" class="input-field">
                                <option value="">Tous les états</option>
                                <option value="ouverte">Ouverte</option>
                                <option value="fermee">Fermée</option>
                                <option value="en_transit">En transit</option>
                                <option value="arrivee">Arrivée</option>
                                <option value="annulee">Annulée</option>
                            </select>
                            <button id="btn-refresh" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                                🔄 Actualiser
                            </button>
                        </div>
                    </div>
                    <div id="cargaisons-list" class="space-y-4"></div>
                </div>
            </div>

            <!-- Modal de gestion des dates -->
            <div id="date-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50">
                <div class="flex items-center justify-center w-full h-full p-4">
                    <div class="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" id="date-modal-title">Gestion des dates</h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Date de départ</label>
                                <input type="datetime-local" id="date-depart" class="input-field">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Date d'arrivée estimée</label>
                                <input type="datetime-local" id="date-arrivee-estimee" class="input-field">
                            </div>
                            
                            <div id="date-arrivee-container" class="hidden">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Date d'arrivée réelle</label>
                                <input type="datetime-local" id="date-arrivee" class="input-field">
                            </div>
                        </div>
                        
                        <div class="mt-6 flex gap-2 justify-end">
                            <button id="cancel-date-modal" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                                Annuler
                            </button>
                            <button id="save-dates" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal d'ajout de colis -->
            <div id="add-colis-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50">
                <div class="flex items-center justify-center w-full h-full p-4">
                    <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Ajouter un colis</h3>
                        
                        <div class="space-y-4">
                            <h4 class="text-md font-medium text-gray-700">Informations client</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <input type="text" id="modal-client-nom" class="input-field" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                    <input type="text" id="modal-client-prenom" class="input-field" required>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                    <input type="tel" id="modal-client-telephone" class="input-field" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Email (facultatif)</label>
                                    <input type="email" id="modal-client-email" class="input-field">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                <textarea id="modal-client-adresse" class="input-field" rows="2" required></textarea>
                            </div>

                            <h4 class="text-md font-medium text-gray-700">Informations produit</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Type de produit</label>
                                    <select id="modal-product-type" class="input-field" required>
                                        <option value="">Sélectionner un type</option>
                                        <option value="alimentaire">Alimentaire</option>
                                        <option value="chimique">Chimique</option>
                                        <option value="fragile">Matériel fragile</option>
                                        <option value="incassable">Matériel incassable</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
                                    <input type="text" id="modal-product-label" class="input-field" required>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                                    <input type="number" id="modal-product-weight" class="input-field" min="0.1" step="0.1" required>
                                </div>
                                <div id="modal-toxicity-field" class="hidden">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Degré de toxicité (1-10)</label>
                                    <input type="number" id="modal-product-toxicity" class="input-field" min="1" max="10">
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-6 flex gap-2 justify-end">
                            <button id="cancel-add-colis" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                                Annuler
                            </button>
                            <button id="save-new-colis" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                                Ajouter le colis
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private attachEventListeners(): void {

        document.getElementById('btn-search-colis')?.addEventListener('click', () => this.searchColis());
        document.getElementById('search-colis-id')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchColis();
        });


        document.getElementById('filter-etat')?.addEventListener('change', () => this.loadCargaisons());
        document.getElementById('btn-refresh')?.addEventListener('click', () => this.loadCargaisons());


        document.getElementById('cancel-date-modal')?.addEventListener('click', () => this.closeDateModal());
        document.getElementById('save-dates')?.addEventListener('click', () => this.saveDates());


        document.getElementById('cancel-add-colis')?.addEventListener('click', () => this.closeAddColisModal());
        document.getElementById('save-new-colis')?.addEventListener('click', () => this.saveNewColis());
        document.getElementById('modal-product-type')?.addEventListener('change', () => this.toggleModalToxicityField());
    }

    private async searchColis(): Promise<void> {
        const searchInput = document.getElementById('search-colis-id') as HTMLInputElement;
        const resultContainer = document.getElementById('search-result');
        
        if (!searchInput || !resultContainer) return;
        
        const colisId = searchInput.value.trim();
        if (!colisId) {
            alert('Veuillez entrer un ID de colis');
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/colis?code=${colisId}`);
            const colis = await response.json();
            
            if (colis.length === 0) {
                resultContainer.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p class="text-red-700"> Aucun colis trouvé avec l'ID: ${colisId}</p>
                    </div>
                `;
            } else {
                const colisInfo = colis[0];
                const cargaisonResponse = await fetch(`${this.apiUrl}/cargaisons/${colisInfo.cargaisonId}`);
                const cargaison = await cargaisonResponse.json();
                
                resultContainer.innerHTML = `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 class="font-semibold text-green-800 mb-2"> Colis trouvé!</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p><strong>Code:</strong> ${colisInfo.code}</p>
                                <p><strong>Libellé:</strong> ${colisInfo.libelle}</p>
                                <p><strong>Poids:</strong> ${colisInfo.poids} kg</p>
                                <p><strong>État:</strong> <span class="badge-${colisInfo.etat}">${this.getEtatLabel(colisInfo.etat)}</span></p>
                            </div>
                            <div>
                                <p><strong>Client:</strong> ${colisInfo.client.prenom} ${colisInfo.client.nom}</p>
                                <p><strong>Cargaison:</strong> ${cargaison.numero}</p>
                                <p><strong>Type transport:</strong> ${this.getTransportIcon(cargaison.type)} ${cargaison.type}</p>
                                <p><strong>Trajet:</strong> ${cargaison.lieuDepart.ville} → ${cargaison.lieuArrivee.ville}</p>
                            </div>
                        </div>
                        ${colisInfo.dateExpedition ? `<p class="mt-2 text-xs text-gray-600">Expédié le ${new Date(colisInfo.dateExpedition).toLocaleString()}</p>` : ''}
                        ${colisInfo.dateArrivee ? `<p class="text-xs text-gray-600">Arrivé le ${new Date(colisInfo.dateArrivee).toLocaleString()}</p>` : ''}
                    </div>
                `;
            }
            
            resultContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            resultContainer.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-700"> Erreur lors de la recherche</p>
                </div>
            `;
            resultContainer.classList.remove('hidden');
        }
    }

    private async loadCargaisons(): Promise<void> {
        try {
            const filterEtat = (document.getElementById('filter-etat') as HTMLSelectElement)?.value;
            let url = `${this.apiUrl}/cargaisons`;
            if (filterEtat) {
                url += `?etat=${filterEtat}`;
            }
            
            const response = await fetch(url);
            const cargaisons: CargaisonAPI[] = await response.json();
            
            const container = document.getElementById('cargaisons-list');
            if (!container) return;
            
            if (cargaisons.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <p>Aucune cargaison trouvée</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = cargaisons.map(cargaison => this.renderCargaisonCard(cargaison)).join('');
            
            this.attachCargaisonEventListeners();
            
        } catch (error) {
            console.error('Erreur lors du chargement des cargaisons:', error);
        }
    }

    private renderCargaisonCard(cargaison: CargaisonAPI): string {
        const statusBadge = this.getStatusBadge(cargaison.etat);
        const transportIcon = this.getTransportIcon(cargaison.type);
        const isActive = ['ouverte', 'en_transit'].includes(cargaison.etat);
        
        return `
            <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${!isActive ? 'bg-gray-50' : 'bg-white'}">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">${transportIcon}</span>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">${cargaison.numero}</h3>
                            <p class="text-sm text-gray-600">${cargaison.lieuDepart.ville} → ${cargaison.lieuArrivee.ville}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        ${statusBadge}
                        <p class="text-xs text-gray-500 mt-1">${cargaison.distance} km</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="text-sm">
                        <span class="font-medium">Créée:</span>
                        <br>${new Date(cargaison.dateCreation).toLocaleDateString()}
                    </div>
                    <div class="text-sm">
                        <span class="font-medium">Départ:</span>
                        <br>${cargaison.dateDepart ? new Date(cargaison.dateDepart).toLocaleDateString() : 'Non programmé'}
                    </div>
                    <div class="text-sm">
                        <span class="font-medium">Arrivée:</span>
                        <br>${cargaison.dateArrivee ? new Date(cargaison.dateArrivee).toLocaleDateString() : 
                            cargaison.dateArriveeEstimee ? `Estimée: ${new Date(cargaison.dateArriveeEstimee).toLocaleDateString()}` : 'Non estimée'}
                    </div>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-600">
                        <span class="font-medium">${cargaison.colis.length}</span> colis
                    </div>
                    <div class="flex gap-2">
                        ${isActive ? `
                            <button class="btn-add-colis bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm" data-id="${cargaison.id}">
                                    Ajouter colis
                            </button>
                        ` : ''}
                        <button class="btn-manage-dates bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm" data-id="${cargaison.id}">
                                Dates
                        </button>
                        ${cargaison.etat === 'ouverte' ? `
                            <button class="btn-start-transit bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm" data-id="${cargaison.id}">
                                    Démarrer
                            </button>
                        ` : ''}
                        ${cargaison.etat === 'en_transit' ? `
                            <button class="btn-mark-arrived bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm" data-id="${cargaison.id}">
                                Arrivée
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    private attachCargaisonEventListeners(): void {

        document.querySelectorAll('.btn-manage-dates').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cargaisonId = (e.target as HTMLElement).getAttribute('data-id');
                if (cargaisonId) this.openDateModal(cargaisonId);
            });
        });


        document.querySelectorAll('.btn-add-colis').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cargaisonId = (e.target as HTMLElement).getAttribute('data-id');
                if (cargaisonId) this.openAddColisModal(cargaisonId);
            });
        });


        document.querySelectorAll('.btn-start-transit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cargaisonId = (e.target as HTMLElement).getAttribute('data-id');
                if (cargaisonId) this.startTransit(cargaisonId);
            });
        });


        document.querySelectorAll('.btn-mark-arrived').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cargaisonId = (e.target as HTMLElement).getAttribute('data-id');
                if (cargaisonId) this.markArrived(cargaisonId);
            });
        });
    }

    private getStatusBadge(etat: string): string {
        const badges = {
            'ouverte': '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"> Ouverte</span>',
            'fermee': '<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium"> Fermée</span>',
            'en_transit': '<span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium"> En transit</span>',
            'arrivee': '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"> Arrivée</span>',
            'annulee': '<span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium"> Annulée</span>'
        };
        return badges[etat as keyof typeof badges] || badges['ouverte'];
    }

    private getTransportIcon(type: string): string {
        const icons = {
            'maritime': 'Maritime',
            'aerienne': 'Aerienne',
            'routiere': 'Routiére'
        };
        return icons[type as keyof typeof icons] || 'Colis';
    }

    private getEtatLabel(etat: string): string {
        const labels = {
            'en_attente': 'En attente',
            'en_transit': 'En transit',
            'arrive': 'Arrivé',
            'perdu': 'Perdu',
            'annule': 'Annulé'
        };
        return labels[etat as keyof typeof labels] || etat;
    }

    private currentCargaisonId: string | null = null;

    private async openDateModal(cargaisonId: string): Promise<void> {
        this.currentCargaisonId = cargaisonId;
        
        try {
            const response = await fetch(`${this.apiUrl}/cargaisons/${cargaisonId}`);
            const cargaison: CargaisonAPI = await response.json();
            
            const modal = document.getElementById('date-modal');
            const title = document.getElementById('date-modal-title');
            const departInput = document.getElementById('date-depart') as HTMLInputElement;
            const arriveeEstimeeInput = document.getElementById('date-arrivee-estimee') as HTMLInputElement;
            const arriveeInput = document.getElementById('date-arrivee') as HTMLInputElement;
            const arriveeContainer = document.getElementById('date-arrivee-container');
            
            if (title) title.textContent = `Dates - ${cargaison.numero}`;
            
            if (departInput && cargaison.dateDepart) {
                departInput.value = new Date(cargaison.dateDepart).toISOString().slice(0, 16);
            }
            if (arriveeEstimeeInput && cargaison.dateArriveeEstimee) {
                arriveeEstimeeInput.value = new Date(cargaison.dateArriveeEstimee).toISOString().slice(0, 16);
            }
            if (arriveeInput && cargaison.dateArrivee) {
                arriveeInput.value = new Date(cargaison.dateArrivee).toISOString().slice(0, 16);
            }
            
            if (arriveeContainer && ['en_transit', 'arrivee'].includes(cargaison.etat)) {
                arriveeContainer.classList.remove('hidden');
            } else if (arriveeContainer) {
                arriveeContainer.classList.add('hidden');
            }
            
            modal?.classList.remove('hidden');
        } catch (error) {
            console.error('Erreur lors de l\'ouverture du modal de dates:', error);
        }
    }

    private closeDateModal(): void {
        const modal = document.getElementById('date-modal');
        modal?.classList.add('hidden');
        this.currentCargaisonId = null;
    }

    private async saveDates(): Promise<void> {
        if (!this.currentCargaisonId) return;
        
        const departInput = document.getElementById('date-depart') as HTMLInputElement;
        const arriveeEstimeeInput = document.getElementById('date-arrivee-estimee') as HTMLInputElement;
        const arriveeInput = document.getElementById('date-arrivee') as HTMLInputElement;
        
        const updateData: any = {};
        
        if (departInput.value) {
            updateData.dateDepart = new Date(departInput.value).toISOString();
        }
        if (arriveeEstimeeInput.value) {
            updateData.dateArriveeEstimee = new Date(arriveeEstimeeInput.value).toISOString();
        }
        if (arriveeInput.value) {
            updateData.dateArrivee = new Date(arriveeInput.value).toISOString();
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/cargaisons/${this.currentCargaisonId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });
            
            if (response.ok) {
                this.closeDateModal();
                await this.loadCargaisons();
                alert('Dates mises à jour avec succès!');
            } else {
                throw new Error('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des dates:', error);
            alert('Erreur lors de la sauvegarde des dates');
        }
    }

    private openAddColisModal(cargaisonId: string): void {
        this.currentCargaisonId = cargaisonId;
        const modal = document.getElementById('add-colis-modal');
        modal?.classList.remove('hidden');
    }

    private closeAddColisModal(): void {
        const modal = document.getElementById('add-colis-modal');
        modal?.classList.add('hidden');
        this.currentCargaisonId = null;
        this.clearAddColisForm();
    }

    private toggleModalToxicityField(): void {
        const productType = (document.getElementById('modal-product-type') as HTMLSelectElement).value;
        const toxicityField = document.getElementById('modal-toxicity-field');
        
        if (productType === 'chimique') {
            toxicityField?.classList.remove('hidden');
        } else {
            toxicityField?.classList.add('hidden');
        }
    }

    private async saveNewColis(): Promise<void> {
        if (!this.currentCargaisonId) return;
        
        try {
            const nom = (document.getElementById('modal-client-nom') as HTMLInputElement).value;
            const prenom = (document.getElementById('modal-client-prenom') as HTMLInputElement).value;
            const telephone = (document.getElementById('modal-client-telephone') as HTMLInputElement).value;
            const email = (document.getElementById('modal-client-email') as HTMLInputElement).value;
            const adresse = (document.getElementById('modal-client-adresse') as HTMLTextAreaElement).value;
            
            const productType = (document.getElementById('modal-product-type') as HTMLSelectElement).value;
            const label = (document.getElementById('modal-product-label') as HTMLInputElement).value;
            const weight = parseFloat((document.getElementById('modal-product-weight') as HTMLInputElement).value);
            const toxicity = parseInt((document.getElementById('modal-product-toxicity') as HTMLInputElement).value);
            
            if (!nom || !prenom || !telephone || !adresse || !productType || !label || !weight) {
                alert('Veuillez remplir tous les champs obligatoires');
                return;
            }
            
            const code = this.generateColisCode();
            
            const newColis: Partial<ColisAPI> = {
                id: code,
                code: code,
                libelle: label,
                poids: weight,
                produit: {
                    type: productType,
                    libelle: label,
                    poids: weight,
                    ...(productType === 'chimique' && toxicity ? { toxicite: toxicity } : {})
                },
                client: {
                    nom: nom,
                    prenom: prenom,
                    telephone: telephone,
                    adresse: adresse,
                    ...(email ? { email: email } : {})
                },
                etat: 'en_attente',
                dateCreation: new Date().toISOString(),
                dateExpedition: null,
                dateArrivee: null,
                cargaisonId: this.currentCargaisonId
            };
            

            const colisResponse = await fetch(`${this.apiUrl}/colis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newColis),
            });
            
            if (!colisResponse.ok) {
                throw new Error('Erreur lors de l\'ajout du colis');
            }
            
            const cargaisonResponse = await fetch(`${this.apiUrl}/cargaisons/${this.currentCargaisonId}`);
            const cargaison = await cargaisonResponse.json();
            
            const updatedColis = [...cargaison.colis, code];
            
            await fetch(`${this.apiUrl}/cargaisons/${this.currentCargaisonId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ colis: updatedColis }),
            });
            
            this.closeAddColisModal();
            await this.loadCargaisons();
            alert('Colis ajouté avec succès!');
            
        } catch (error) {
            console.error('Erreur lors de l\'ajout du colis:', error);
            alert('Erreur lors de l\'ajout du colis');
        }
    }

    private clearAddColisForm(): void {
        const inputs = ['modal-client-nom', 'modal-client-prenom', 'modal-client-telephone', 'modal-client-email', 'modal-client-adresse',
                    'modal-product-label', 'modal-product-weight', 'modal-product-toxicity'];
        inputs.forEach(id => {
            const input = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
            if (input) input.value = '';
        });
        
        const selects = ['modal-product-type'];
        selects.forEach(id => {
            const select = document.getElementById(id) as HTMLSelectElement;
            if (select) select.selectedIndex = 0;
        });

        document.getElementById('modal-toxicity-field')?.classList.add('hidden');
    }

    private generateColisCode(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `COL-${timestamp}-${random}`;
    }

    private async startTransit(cargaisonId: string): Promise<void> {
        if (!confirm('Êtes-vous sûr de vouloir démarrer le transit de cette cargaison?')) return;
        
        try {
            const updateData = {
                etat: 'en_transit',
                dateDepart: new Date().toISOString()
            };
            
            const response = await fetch(`${this.apiUrl}/cargaisons/${cargaisonId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });
            
            if (response.ok) {

                const cargaisonResponse = await fetch(`${this.apiUrl}/cargaisons/${cargaisonId}`);
                const cargaison = await cargaisonResponse.json();
                
                for (const colisCode of cargaison.colis) {
                    const colisResponse = await fetch(`${this.apiUrl}/colis?code=${colisCode}`);
                    const colisArray = await colisResponse.json();
                    if (colisArray.length > 0) {
                        const colis = colisArray[0];
                        await fetch(`${this.apiUrl}/colis/${colis.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                etat: 'en_transit',
                                dateExpedition: new Date().toISOString()
                            }),
                        });
                    }
                }
                
                await this.loadCargaisons();
                alert('Transit démarré avec succès!');
            } else {
                throw new Error('Erreur lors du démarrage du transit');
            }
        } catch (error) {
            console.error('Erreur lors du démarrage du transit:', error);
            alert('Erreur lors du démarrage du transit');
        }
    }

    private async markArrived(cargaisonId: string): Promise<void> {
        if (!confirm('Êtes-vous sûr de marquer cette cargaison comme arrivée?')) return;
        
        try {
            const updateData = {
                etat: 'arrivee',
                dateArrivee: new Date().toISOString()
            };
            
            const response = await fetch(`${this.apiUrl}/cargaisons/${cargaisonId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });
            
            if (response.ok) {

                const cargaisonResponse = await fetch(`${this.apiUrl}/cargaisons/${cargaisonId}`);
                const cargaison = await cargaisonResponse.json();
                
                for (const colisCode of cargaison.colis) {
                    const colisResponse = await fetch(`${this.apiUrl}/colis?code=${colisCode}`);
                    const colisArray = await colisResponse.json();
                    if (colisArray.length > 0) {
                        const colis = colisArray[0];
                        await fetch(`${this.apiUrl}/colis/${colis.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                etat: 'arrive',
                                dateArrivee: new Date().toISOString()
                            }),
                        });
                    }
                }
                
                await this.loadCargaisons();
                alert('Cargaison marquée comme arrivée!');
            } else {
                throw new Error('Erreur lors du marquage d\'arrivée');
            }
        } catch (error) {
            console.error('Erreur lors du marquage d\'arrivée:', error);
            alert('Erreur lors du marquage d\'arrivée');
        }
    }
}
