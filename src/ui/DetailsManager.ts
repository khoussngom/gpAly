import { CargaisonAPI, ColisAPI } from './CargaisonManager';

export class DetailsManager {
    private apiUrl = 'http://localhost:3002';
    private coordonneesCache: Map<string, { latitude: number, longitude: number, pays: string }> = new Map();

    constructor() {
        this.loadCoordonnees();
    }

    private async loadCoordonnees(): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/coordonnees`);
            if (response.ok) {
                const coordonnees = await response.json();
                coordonnees.forEach((coord: any) => {
                    this.coordonneesCache.set(coord.ville, {
                        latitude: coord.latitude,
                        longitude: coord.longitude,
                        pays: coord.pays
                    });
                });
                console.log('Coordonnées géographiques chargées:', this.coordonneesCache.size, 'villes');
            }
        } catch (error) {
            console.warn('Impossible de charger les coordonnées:', error);
        }
    }

    private getCoordonnees(ville: string): { latitude: number, longitude: number, pays?: string } {
        const coord = this.coordonneesCache.get(ville);
        return coord ? coord : { latitude: 0, longitude: 0 };
    }

    public async showCargaisonDetail(numero: string): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/cargaisons?numero=${numero}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            
            const cargaisons: CargaisonAPI[] = await response.json();
            if (cargaisons.length === 0) {
                alert('Cargaison non trouvée');
                return;
            }

            const cargaison = cargaisons[0];
            this.displayCargaisonDetailModal(cargaison);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la récupération des détails de la cargaison');
        }
    }

    public async showColisDetail(code: string): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/colis?code=${code}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            
            const colisList: ColisAPI[] = await response.json();
            if (colisList.length === 0) {
                alert('Colis non trouvé');
                return;
            }

            const colis = colisList[0];
            this.displayColisDetailModal(colis);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la récupération des détails du colis');
        }
    }

    public async editCargaison(numero: string): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/cargaisons?numero=${numero}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            
            const cargaisons: CargaisonAPI[] = await response.json();
            if (cargaisons.length === 0) {
                alert('Cargaison non trouvée');
                return;
            }

            const cargaison = cargaisons[0];
            this.displayEditCargaisonModal(cargaison);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la récupération des données de la cargaison');
        }
    }

    public async editColis(code: string): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/colis?code=${code}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            
            const colisList: ColisAPI[] = await response.json();
            if (colisList.length === 0) {
                alert('Colis non trouvé');
                return;
            }

            const colis = colisList[0];
            this.displayEditColisModal(colis);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la récupération des données du colis');
        }
    }

    public async deleteCargaison(numero: string): Promise<void> {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la cargaison ${numero} ?`)) {
            return;
        }

        try {
            // Récupérer la cargaison d'abord pour obtenir son ID
            const response = await fetch(`${this.apiUrl}/cargaisons?numero=${numero}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            
            const cargaisons: CargaisonAPI[] = await response.json();
            if (cargaisons.length === 0) {
                alert('Cargaison non trouvée');
                return;
            }

            const cargaison = cargaisons[0];

            // Supprimer tous les colis associés d'abord
            for (const colisCode of cargaison.colis) {
                const colisResponse = await fetch(`${this.apiUrl}/colis?code=${colisCode}`);
                if (colisResponse.ok) {
                    const colisList: ColisAPI[] = await colisResponse.json();
                    if (colisList.length > 0) {
                        await fetch(`${this.apiUrl}/colis/${colisList[0].id}`, {
                            method: 'DELETE'
                        });
                    }
                }
            }

            // Supprimer la cargaison
            const deleteResponse = await fetch(`${this.apiUrl}/cargaisons/${cargaison.id}`, {
                method: 'DELETE'
            });

            if (deleteResponse.ok) {
                alert('Cargaison supprimée avec succès');
                // Recharger la liste des cargaisons
                if (typeof window.refreshCargaisonsList === 'function') {
                    window.refreshCargaisonsList();
                }
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression de la cargaison');
        }
    }

    public async deleteColis(code: string): Promise<void> {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le colis ${code} ?`)) {
            return;
        }

        try {
            // Récupérer le colis d'abord pour obtenir son ID
            const response = await fetch(`${this.apiUrl}/colis?code=${code}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            
            const colisList: ColisAPI[] = await response.json();
            if (colisList.length === 0) {
                alert('Colis non trouvé');
                return;
            }

            const colis = colisList[0];

            // Retirer le colis de sa cargaison
            const cargaisonResponse = await fetch(`${this.apiUrl}/cargaisons/${colis.cargaisonId}`);
            if (cargaisonResponse.ok) {
                const cargaison: CargaisonAPI = await cargaisonResponse.json();
                const updatedColis = cargaison.colis.filter(c => c !== code);
                
                await fetch(`${this.apiUrl}/cargaisons/${colis.cargaisonId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ colis: updatedColis }),
                });
            }

            // Supprimer le colis
            const deleteResponse = await fetch(`${this.apiUrl}/colis/${colis.id}`, {
                method: 'DELETE'
            });

            if (deleteResponse.ok) {
                alert('Colis supprimé avec succès');
                // Recharger la liste des colis
                if (typeof window.refreshColisList === 'function') {
                    window.refreshColisList();
                }
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression du colis');
        }
    }

    private displayCargaisonDetailModal(cargaison: CargaisonAPI): void {
        const modalHtml = `
            <div id="cargaison-detail-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">Détails de la Cargaison ${cargaison.numero}</h3>
                        <button onclick="this.closest('#cargaison-detail-modal').remove()" 
                                class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-gray-700 mb-2">Informations générales</h4>
                                <div class="space-y-2">
                                    <div><span class="font-medium">Type:</span> ${this.getTypeLabel(cargaison.type)}</div>
                                    <div><span class="font-medium">Numéro:</span> ${cargaison.numero}</div>
                                    <div><span class="font-medium">État:</span> 
                                        <span class="inline-block px-2 py-1 rounded-full text-xs font-medium ${this.getEtatBadgeClass(cargaison.etat)}">
                                            ${this.getEtatLabel(cargaison.etat)}
                                        </span>
                                    </div>
                                    <div><span class="font-medium">Distance:</span> ${cargaison.distance.toLocaleString('fr-FR')} km</div>
                                    <div><span class="font-medium">ID:</span> <code class="text-xs bg-gray-200 px-1 rounded">${cargaison.id}</code></div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-gray-700 mb-2">Dates</h4>
                                <div class="space-y-2">
                                    <div><span class="font-medium">Création:</span> ${this.formatDate(cargaison.dateCreation)}</div>
                                    ${cargaison.dateDepart ? `<div><span class="font-medium">Départ:</span> ${this.formatDate(cargaison.dateDepart)}</div>` : '<div class="text-gray-500 italic">Départ non programmé</div>'}
                                    ${cargaison.dateArriveeEstimee ? `<div><span class="font-medium">Arrivée estimée:</span> ${this.formatDate(cargaison.dateArriveeEstimee)}</div>` : '<div class="text-gray-500 italic">Arrivée non estimée</div>'}
                                    ${cargaison.dateArrivee ? `<div><span class="font-medium">Arrivée réelle:</span> ${this.formatDate(cargaison.dateArrivee)}</div>` : ''}
                                </div>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-gray-700 mb-2">🗺️ Itinéraire</h4>
                                <div class="space-y-3">
                                    <div class="flex items-center space-x-2">
                                        <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                                        <div>
                                            <span class="font-medium">Départ:</span> ${cargaison.lieuDepart.ville}${this.formatPays(cargaison.lieuDepart.ville)}
                                            <div class="text-xs text-gray-500">📍 ${cargaison.lieuDepart.latitude.toFixed(4)}, ${cargaison.lieuDepart.longitude.toFixed(4)}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="w-3 h-3 bg-red-500 rounded-full"></span>
                                        <div>
                                            <span class="font-medium">Arrivée:</span> ${cargaison.lieuArrivee.ville}${this.formatPays(cargaison.lieuArrivee.ville)}
                                            <div class="text-xs text-gray-500">📍 ${cargaison.lieuArrivee.latitude.toFixed(4)}, ${cargaison.lieuArrivee.longitude.toFixed(4)}</div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-gray-700 mb-2">Colis (${cargaison.colis.length})</h4>
                                ${cargaison.colis.length > 0 ? 
                                    `<div class="space-y-1 max-h-32 overflow-y-auto">
                                        ${cargaison.colis.map(code => `<div class="text-sm text-blue-600 cursor-pointer hover:underline" onclick="window.detailsManager.showColisDetail('${code}')">${code}</div>`).join('')}
                                    </div>` : 
                                    '<div class="text-gray-500 text-sm">Aucun colis</div>'
                                }
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 flex justify-end space-x-2">
                        <button onclick="this.closest('#cargaison-detail-modal').remove()" 
                                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                            Fermer
                        </button>
                        <button onclick="this.closest('#cargaison-detail-modal').remove(); window.detailsManager.editCargaison('${cargaison.numero}')" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            Modifier
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    private displayColisDetailModal(colis: ColisAPI): void {
        const modalHtml = `
            <div id="colis-detail-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div class="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">Détails du Colis ${colis.code}</h3>
                        <button onclick="this.closest('#colis-detail-modal').remove()" 
                                class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-gray-700 mb-2">📦 Informations du colis</h4>
                                <div class="space-y-2">
                                    <div><span class="font-medium">Code:</span> ${colis.code}</div>
                                    <div><span class="font-medium">Libellé:</span> ${colis.libelle}</div>
                                    <div><span class="font-medium">Poids:</span> ${colis.poids} kg</div>
                                    <div><span class="font-medium">État:</span> 
                                        <span class="inline-block px-2 py-1 rounded-full text-xs font-medium ${this.getColisEtatBadgeClass(colis.etat)}">
                                            ${this.getColisEtatLabel(colis.etat)}
                                        </span>
                                    </div>
                                    <div><span class="font-medium">ID:</span> <code class="text-xs bg-gray-200 px-1 rounded">${colis.id}</code></div>
                                    <div><span class="font-medium">Cargaison:</span> <span class="text-blue-600 cursor-pointer hover:underline" onclick="window.detailsManager.showCargaisonByIdModal('${colis.cargaisonId}')">${colis.cargaisonId}</span></div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-gray-700 mb-2">📋 Produit</h4>
                                <div class="space-y-2">
                                    <div><span class="font-medium">Type:</span> ${this.getProductTypeLabel(colis.produit.type)}</div>
                                    <div><span class="font-medium">Libellé:</span> ${colis.produit.libelle}</div>
                                    <div><span class="font-medium">Poids:</span> ${colis.produit.poids} kg</div>
                                    ${colis.produit.toxicite ? `<div><span class="font-medium">Toxicité:</span> <span class="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Niveau ${colis.produit.toxicite}</span></div>` : ''}
                                </div>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-gray-700 mb-2">👤 Client</h4>
                                <div class="space-y-2">
                                    <div><span class="font-medium">Nom complet:</span> ${colis.client.prenom} ${colis.client.nom}</div>
                                    <div><span class="font-medium">Téléphone:</span> <a href="tel:${colis.client.telephone}" class="text-blue-600 hover:underline">${colis.client.telephone}</a></div>
                                    <div><span class="font-medium">Adresse:</span> ${colis.client.adresse}</div>
                                    ${colis.client.email ? `<div><span class="font-medium">Email:</span> <a href="mailto:${colis.client.email}" class="text-blue-600 hover:underline">${colis.client.email}</a></div>` : '<div class="text-gray-500 italic">Aucun email renseigné</div>'}
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-gray-700 mb-2">📅 Dates</h4>
                                <div class="space-y-2">
                                    <div><span class="font-medium">Création:</span> ${this.formatDate(colis.dateCreation)}</div>
                                    ${colis.dateExpedition ? `<div><span class="font-medium">Expédition:</span> ${this.formatDate(colis.dateExpedition)}</div>` : '<div class="text-gray-500 italic">Pas encore expédié</div>'}
                                    ${colis.dateArrivee ? `<div><span class="font-medium">Arrivée:</span> ${this.formatDate(colis.dateArrivee)}</div>` : '<div class="text-gray-500 italic">Pas encore arrivé</div>'}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 flex justify-end space-x-2">
                        <button onclick="this.closest('#colis-detail-modal').remove()" 
                                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                            Fermer
                        </button>
                        <button onclick="this.closest('#colis-detail-modal').remove(); window.detailsManager.editColis('${colis.code}')" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            Modifier
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    private displayEditCargaisonModal(cargaison: CargaisonAPI): void {
        const modalHtml = `
            <div id="edit-cargaison-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">Modifier la Cargaison ${cargaison.numero}</h3>
                        <button onclick="this.closest('#edit-cargaison-modal').remove()" 
                                class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                    </div>
                    
                    <form id="edit-cargaison-form" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select id="edit-cargaison-type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="aerienne" ${cargaison.type === 'aerienne' ? 'selected' : ''}>Aérienne</option>
                                    <option value="maritime" ${cargaison.type === 'maritime' ? 'selected' : ''}>Maritime</option>
                                    <option value="routiere" ${cargaison.type === 'routiere' ? 'selected' : ''}>Routière</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">État</label>
                                <select id="edit-cargaison-etat" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="ouverte" ${cargaison.etat === 'ouverte' ? 'selected' : ''}>Ouverte</option>
                                    <option value="fermee" ${cargaison.etat === 'fermee' ? 'selected' : ''}>Fermée</option>
                                    <option value="en_transit" ${cargaison.etat === 'en_transit' ? 'selected' : ''}>En transit</option>
                                    <option value="arrivee" ${cargaison.etat === 'arrivee' ? 'selected' : ''}>Arrivée</option>
                                    <option value="annulee" ${cargaison.etat === 'annulee' ? 'selected' : ''}>Annulée</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                            <input type="number" id="edit-cargaison-distance" value="${cargaison.distance}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Ville de départ</label>
                                <input type="text" id="edit-cargaison-depart" value="${cargaison.lieuDepart.ville}" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Ville d'arrivée</label>
                                <input type="text" id="edit-cargaison-arrivee" value="${cargaison.lieuArrivee.ville}" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Date de départ</label>
                                <input type="datetime-local" id="edit-cargaison-date-depart" 
                                       value="${cargaison.dateDepart ? new Date(cargaison.dateDepart).toISOString().slice(0, 16) : ''}" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Date d'arrivée estimée</label>
                                <input type="datetime-local" id="edit-cargaison-date-arrivee-estimee" 
                                       value="${cargaison.dateArriveeEstimee ? new Date(cargaison.dateArriveeEstimee).toISOString().slice(0, 16) : ''}" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        
                        <div class="mt-6 flex justify-end space-x-2">
                            <button type="button" onclick="this.closest('#edit-cargaison-modal').remove()" 
                                    class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                                Annuler
                            </button>
                            <button type="button" onclick="window.detailsManager.saveCargaisonChanges('${cargaison.id}')" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                Sauvegarder
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    private displayEditColisModal(colis: ColisAPI): void {
        const modalHtml = `
            <div id="edit-colis-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-2xl font-bold text-gray-900">Modifier le Colis ${colis.code}</h3>
                        <button onclick="this.closest('#edit-colis-modal').remove()" 
                                class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                    </div>
                    
                    <form id="edit-colis-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
                            <input type="text" id="edit-colis-libelle" value="${colis.libelle}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                                <input type="number" step="0.1" id="edit-colis-poids" value="${colis.poids}" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">État</label>
                                <select id="edit-colis-etat" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="en_attente" ${colis.etat === 'en_attente' ? 'selected' : ''}>En attente</option>
                                    <option value="en_transit" ${colis.etat === 'en_transit' ? 'selected' : ''}>En transit</option>
                                    <option value="arrive" ${colis.etat === 'arrive' ? 'selected' : ''}>Arrivé</option>
                                    <option value="perdu" ${colis.etat === 'perdu' ? 'selected' : ''}>Perdu</option>
                                    <option value="annule" ${colis.etat === 'annule' ? 'selected' : ''}>Annulé</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="border-t pt-4">
                            <h4 class="font-semibold text-gray-700 mb-2">Informations client</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <input type="text" id="edit-client-nom" value="${colis.client.nom}" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                    <input type="text" id="edit-client-prenom" value="${colis.client.prenom}" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                    <input type="tel" id="edit-client-telephone" value="${colis.client.telephone}" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" id="edit-client-email" value="${colis.client.email || ''}" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div class="mt-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                <textarea id="edit-client-adresse" rows="2" 
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">${colis.client.adresse}</textarea>
                            </div>
                        </div>
                        
                        <div class="mt-6 flex justify-end space-x-2">
                            <button type="button" onclick="this.closest('#edit-colis-modal').remove()" 
                                    class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                                Annuler
                            </button>
                            <button type="button" onclick="window.detailsManager.saveColisChanges('${colis.id}')" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                Sauvegarder
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    public async saveCargaisonChanges(cargaisonId: string): Promise<void> {
        try {
            const type = (document.getElementById('edit-cargaison-type') as HTMLSelectElement).value;
            const etat = (document.getElementById('edit-cargaison-etat') as HTMLSelectElement).value;
            const distance = parseFloat((document.getElementById('edit-cargaison-distance') as HTMLInputElement).value);
            const villeDepart = (document.getElementById('edit-cargaison-depart') as HTMLInputElement).value;
            const villeArrivee = (document.getElementById('edit-cargaison-arrivee') as HTMLInputElement).value;
            const dateDepart = (document.getElementById('edit-cargaison-date-depart') as HTMLInputElement).value;
            const dateArriveeEstimee = (document.getElementById('edit-cargaison-date-arrivee-estimee') as HTMLInputElement).value;

            // Utiliser les coordonnées de l'API si disponibles
            const coordDepart = this.getCoordonnees(villeDepart);
            const coordArrivee = this.getCoordonnees(villeArrivee);

            const updateData: Partial<CargaisonAPI> = {
                type,
                etat: etat as any,
                distance,
                lieuDepart: {
                    ville: villeDepart,
                    latitude: coordDepart.latitude,
                    longitude: coordDepart.longitude
                },
                lieuArrivee: {
                    ville: villeArrivee,
                    latitude: coordArrivee.latitude,
                    longitude: coordArrivee.longitude
                },
                dateDepart: dateDepart ? new Date(dateDepart).toISOString() : null,
                dateArriveeEstimee: dateArriveeEstimee ? new Date(dateArriveeEstimee).toISOString() : null
            };

            const response = await fetch(`${this.apiUrl}/cargaisons/${cargaisonId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                alert('Cargaison modifiée avec succès');
                document.getElementById('edit-cargaison-modal')?.remove();
                if (typeof window.refreshCargaisonsList === 'function') {
                    window.refreshCargaisonsList();
                }
            } else {
                throw new Error('Erreur lors de la modification');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la modification de la cargaison');
        }
    }

    public async saveColisChanges(colisId: string): Promise<void> {
        try {
            const libelle = (document.getElementById('edit-colis-libelle') as HTMLInputElement).value;
            const poids = parseFloat((document.getElementById('edit-colis-poids') as HTMLInputElement).value);
            const etat = (document.getElementById('edit-colis-etat') as HTMLSelectElement).value;
            const clientNom = (document.getElementById('edit-client-nom') as HTMLInputElement).value;
            const clientPrenom = (document.getElementById('edit-client-prenom') as HTMLInputElement).value;
            const clientTelephone = (document.getElementById('edit-client-telephone') as HTMLInputElement).value;
            const clientEmail = (document.getElementById('edit-client-email') as HTMLInputElement).value;
            const clientAdresse = (document.getElementById('edit-client-adresse') as HTMLTextAreaElement).value;

            // Récupérer les données actuelles du colis pour préserver les informations non modifiables
            const currentResponse = await fetch(`${this.apiUrl}/colis/${colisId}`);
            const currentColis: ColisAPI = await currentResponse.json();

            const updateData: Partial<ColisAPI> = {
                libelle,
                poids,
                etat: etat as any,
                client: {
                    nom: clientNom,
                    prenom: clientPrenom,
                    telephone: clientTelephone,
                    email: clientEmail,
                    adresse: clientAdresse
                },
                produit: {
                    ...currentColis.produit,
                    poids // Mettre à jour le poids du produit aussi
                }
            };

            const response = await fetch(`${this.apiUrl}/colis/${colisId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                alert('Colis modifié avec succès');
                document.getElementById('edit-colis-modal')?.remove();
                if (typeof window.refreshColisList === 'function') {
                    window.refreshColisList();
                }
            } else {
                throw new Error('Erreur lors de la modification');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la modification du colis');
        }
    }

    private getEtatBadgeClass(etat: string): string {
        switch (etat) {
            case 'ouverte': return 'bg-green-100 text-green-800';
            case 'fermee': return 'bg-blue-100 text-blue-800';
            case 'en_transit': return 'bg-yellow-100 text-yellow-800';
            case 'arrivee': return 'bg-purple-100 text-purple-800';
            case 'annulee': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    private getEtatLabel(etat: string): string {
        switch (etat) {
            case 'ouverte': return 'Ouverte';
            case 'fermee': return 'Fermée';
            case 'en_transit': return 'En transit';
            case 'arrivee': return 'Arrivée';
            case 'annulee': return 'Annulée';
            default: return etat;
        }
    }

    private getColisEtatBadgeClass(etat: string): string {
        switch (etat) {
            case 'en_attente': return 'bg-gray-100 text-gray-800';
            case 'en_transit': return 'bg-yellow-100 text-yellow-800';
            case 'arrive': return 'bg-green-100 text-green-800';
            case 'perdu': return 'bg-red-100 text-red-800';
            case 'annule': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    private getColisEtatLabel(etat: string): string {
        switch (etat) {
            case 'en_attente': return 'En attente';
            case 'en_transit': return 'En transit';
            case 'arrive': return 'Arrivé';
            case 'perdu': return 'Perdu';
            case 'annule': return 'Annulé';
            default: return etat;
        }
    }

    private getTypeLabel(type: string): string {
        switch (type) {
            case 'maritime': return '🚢 Maritime';
            case 'aerienne': return '✈️ Aérienne';
            case 'routiere': return '🚛 Routière';
            default: return type;
        }
    }

    private getProductTypeLabel(type: string): string {
        switch (type) {
            case 'alimentaire': return '🍚 Alimentaire';
            case 'fragile': return '📱 Fragile';
            case 'chimique': return '⚗️ Chimique';
            case 'incassable': return '🧳 Incassable';
            case 'materiel': return '🔧 Matériel';
            default: return type;
        }
    }

    public async showCargaisonByIdModal(cargaisonId: string): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/cargaisons/${cargaisonId}`);
            if (!response.ok) {
                throw new Error('Cargaison non trouvée');
            }
            
            const cargaison: CargaisonAPI = await response.json();
            this.displayCargaisonDetailModal(cargaison);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la récupération des détails de la cargaison');
        }
    }

    private formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private formatPays(ville: string): string {
        const coord = this.coordonneesCache.get(ville);
        return coord?.pays ? ` (${coord.pays})` : '';
    }
}

// Rendre la classe disponible globalement
declare global {
    interface Window {
        detailsManager: DetailsManager;
        refreshCargaisonsList?: () => void;
        refreshColisList?: () => void;
    }
}
