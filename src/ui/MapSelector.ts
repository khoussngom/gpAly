export interface Coordonnee {
    ville: string;
    latitude: number;
    longitude: number;
}

declare global {
    interface Window {
        L: any;
    }
}

export class MapSelector {
    private container: HTMLElement;
    private map: any | null = null;
    private markers: any[] = [];
    private onCoordinateSelected: (coord: Coordonnee) => void;

    constructor(container: HTMLElement, onCoordinateSelected: (coord: Coordonnee) => void) {
        this.container = container;
        this.onCoordinateSelected = onCoordinateSelected;
    }

    public init(): void {
        this.loadLeafletLibrary().then(() => {
            this.initMap();
        });
    }

    private loadLeafletLibrary(): Promise<void> {
        return new Promise((resolve) => {
            // Vérifier si Leaflet est déjà chargé
            if (window.L) {
                resolve();
                return;
            }

            // Charger les CSS de Leaflet
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            // Charger le JS de Leaflet
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    }

    private initMap(): void {
        // Carte centrée sur l'Afrique de l'Ouest
        this.map = window.L.map(this.container).setView([14.6928, -17.4467], 6);

        // Ajouter les tuiles OpenStreetMap
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Gérer les clics sur la carte
        this.map.on('click', (e: any) => {
            this.handleMapClick(e.latlng.lat, e.latlng.lng);
        });

        // Charger les coordonnées prédéfinies
        this.loadPredefinedCoordinates();
    }

    private async loadPredefinedCoordinates(): Promise<void> {
        try {
            const response = await fetch('/api/coordonnees');
            const coordinates = await response.json();

            coordinates.forEach((coord: any) => {
                if (this.map) {
                    const marker = window.L.marker([coord.latitude, coord.longitude])
                        .addTo(this.map)
                        .bindPopup(`${coord.ville}, ${coord.pays}`)
                        .on('click', () => {
                            this.selectCoordinate({
                                ville: coord.ville,
                                latitude: coord.latitude,
                                longitude: coord.longitude
                            });
                        });

                    this.markers.push(marker);
                }
            });
        } catch (error) {
            console.error('Erreur lors du chargement des coordonnées:', error);
        }
    }

    private async handleMapClick(lat: number, lng: number): Promise<void> {
        try {
            // Géocodage inverse pour obtenir le nom de la ville
            const response = await fetch(`/api/geocoding?lat=${lat}&lng=${lng}`);
            const data = await response.json();
            
            const ville = data.display_name ? 
                data.display_name.split(',')[0].trim() : 
                `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            this.selectCoordinate({
                ville,
                latitude: lat,
                longitude: lng
            });

        } catch (error) {
            console.error('Erreur de géocodage:', error);
            // Fallback avec les coordonnées
            this.selectCoordinate({
                ville: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                latitude: lat,
                longitude: lng
            });
        }
    }

    private selectCoordinate(coord: Coordonnee): void {
        if (!this.map) return;

        // Supprimer les anciens marqueurs de sélection
        this.markers.forEach(marker => {
            if (marker._isSelection && this.map) {
                this.map.removeLayer(marker);
            }
        });

        // Créer une icône rouge pour la sélection
        const redIcon = window.L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Ajouter un marqueur de sélection
        const selectionMarker = window.L.marker([coord.latitude, coord.longitude], {
            icon: redIcon
        }).addTo(this.map) as any;
        selectionMarker._isSelection = true;
        this.markers.push(selectionMarker);

        // Appeler le callback
        this.onCoordinateSelected(coord);
    }

    public async searchLocation(query: string): Promise<Coordonnee[]> {
        try {
            const response = await fetch(`/api/geocoding?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            
            return results.map((result: any) => ({
                ville: result.display_name.split(',')[0].trim(),
                latitude: result.latitude,
                longitude: result.longitude
            }));
        } catch (error) {
            console.error('Erreur de recherche:', error);
            return [];
        }
    }

    public centerOnCoordinate(coord: Coordonnee): void {
        if (this.map) {
            this.map.setView([coord.latitude, coord.longitude], 10);
        }
    }

    public destroy(): void {
        if (this.map) {
            this.map.remove();
        }
    }
}
