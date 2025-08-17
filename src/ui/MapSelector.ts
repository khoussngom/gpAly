export interface Coordonnee {
    ville: string;
    latitude: number;
    longitude: number;
}

export interface LocationPoint {
    lat: number;
    lng: number;
    address: string;
    city: string;
    country: string;
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
    private departureMarker: any | null = null;
    private arrivalMarker: any | null = null;
    private routeLine: any | null = null;
    private currentMode: 'departure' | 'arrival' = 'departure';
    private onCoordinateSelected: (coord: Coordonnee) => void;
    private onLocationSelect?: (location: LocationPoint, type: 'departure' | 'arrival') => void;
    private onDistanceCalculated?: (distance: number) => void;

    constructor(
        container: HTMLElement, 
        onCoordinateSelected: (coord: Coordonnee) => void,
        options?: {
            onLocationSelect?: (location: LocationPoint, type: 'departure' | 'arrival') => void;
            onDistanceCalculated?: (distance: number) => void;
        }
    ) {
        this.container = container;
        this.onCoordinateSelected = onCoordinateSelected;
        this.onLocationSelect = options?.onLocationSelect;
        this.onDistanceCalculated = options?.onDistanceCalculated;
    }

    public init(): void {
        this.loadLeafletLibrary().then(() => {
            this.initMap();
            this.addMapControls();
        });
    }

    public setMode(mode: 'departure' | 'arrival'): void {
        this.currentMode = mode;
        this.updateModeButtons();
    }

    private updateModeButtons(): void {
        const departureBtn = document.getElementById('departure-mode-btn');
        const arrivalBtn = document.getElementById('arrival-mode-btn');
        
        if (departureBtn && arrivalBtn) {
            departureBtn.classList.toggle('active', this.currentMode === 'departure');
            arrivalBtn.classList.toggle('active', this.currentMode === 'arrival');
        }
    }

    private addMapControls(): void {
        const controlsHtml = `
            <div class="map-controls" style="position: absolute; top: 10px; right: 10px; z-index: 1000; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="margin-bottom: 8px; font-weight: bold; font-size: 12px;">Mode de sélection:</div>
                <button id="departure-mode-btn" class="map-control-btn active" style="margin: 2px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; background-color: #007cff; color: white;">
                    Départ
                </button>
                <button id="arrival-mode-btn" class="map-control-btn" style="margin: 2px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
                    Arrivée
                </button>
                <div style="margin-top: 8px;">
                    <button id="clear-markers-btn" style="margin: 2px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; background-color: #ff4444; color: white;">
                        Effacer
                    </button>
                </div>
            </div>
        `;
        
        this.container.style.position = 'relative';
        this.container.insertAdjacentHTML('beforeend', controlsHtml);
        
        document.getElementById('departure-mode-btn')?.addEventListener('click', () => {
            this.setMode('departure');
        });
        
        document.getElementById('arrival-mode-btn')?.addEventListener('click', () => {
            this.setMode('arrival');
        });
        
        document.getElementById('clear-markers-btn')?.addEventListener('click', () => {
            this.clearRouteMarkers();
        });
        
        const style = document.createElement('style');
        style.textContent = `
            .map-control-btn:hover {
                background-color: #f0f0f0 !important;
            }
            .map-control-btn.active {
                background-color: #007cff !important;
                color: white !important;
                border-color: #007cff !important;
            }
            .map-control-btn.active:hover {
                background-color: #0056b3 !important;
            }
        `;
        document.head.appendChild(style);
    }

    private loadLeafletLibrary(): Promise<void> {
        return new Promise((resolve) => {

            if (window.L) {
                resolve();
                return;
            }


            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);


            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    }

    private initMap(): void {

        this.map = window.L.map(this.container).setView([14.7163792,  -17.471395], 6);


        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);


        this.map.on('click', (e: any) => {
            this.handleMapClick(e.latlng.lat, e.latlng.lng);
        });


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
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lng=${lng}&addressdetails=1`);
            const data = await response.json();
            
            const ville = data.address?.city || data.address?.town || data.address?.village || 
                        data.display_name?.split(',')[0].trim() || 
                        `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            const location: LocationPoint = {
                lat,
                lng,
                address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                city: ville,
                country: data.address?.country || 'Pays inconnu'
            };

            if (this.onLocationSelect) {
                if (this.currentMode === 'departure') {
                    this.setDepartureLocation(location);
                } else {
                    this.setArrivalLocation(location);
                }
                
                if (this.departureMarker && this.arrivalMarker) {
                    this.calculateAndDisplayRoute();
                }
                
                this.onLocationSelect(location, this.currentMode);
            }

            this.selectCoordinate({
                ville,
                latitude: lat,
                longitude: lng
            });

        } catch (error) {
            console.error('Erreur de géocodage:', error);
            const coord = {
                ville: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                latitude: lat,
                longitude: lng
            };
            this.selectCoordinate(coord);
        }
    }

    private setDepartureLocation(location: LocationPoint): void {
        if (this.departureMarker && this.map) {
            this.map.removeLayer(this.departureMarker);
        }
        
        const greenIcon = window.L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        
        this.departureMarker = window.L.marker([location.lat, location.lng], {
            icon: greenIcon
        }).addTo(this.map);
        
        this.departureMarker.bindPopup(`
            <strong>Point de départ</strong><br>
            ${location.city}, ${location.country}<br>
            <small>${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</small>
        `);
    }

    private setArrivalLocation(location: LocationPoint): void {
        if (this.arrivalMarker && this.map) {
            this.map.removeLayer(this.arrivalMarker);
        }
        
        const redIcon = window.L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        
        this.arrivalMarker = window.L.marker([location.lat, location.lng], {
            icon: redIcon
        }).addTo(this.map);
        
        this.arrivalMarker.bindPopup(`
            <strong>Point d'arrivée</strong><br>
            ${location.city}, ${location.country}<br>
            <small>${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</small>
        `);
    }

    private async calculateAndDisplayRoute(): Promise<void> {
        if (!this.departureMarker || !this.arrivalMarker || !this.map) return;

        const depLatLng = this.departureMarker.getLatLng();
        const arrLatLng = this.arrivalMarker.getLatLng();

        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${depLatLng.lng},${depLatLng.lat};${arrLatLng.lng},${arrLatLng.lat}?overview=full&geometries=geojson`
            );

            if (!response.ok) {
                throw new Error('Échec du calcul de route');
            }

            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const distance = Math.round(route.distance / 1000);
                
                this.drawRoute(route.geometry.coordinates);
                
                if (this.onDistanceCalculated) {
                    this.onDistanceCalculated(distance);
                }
                
                this.fitBounds();
            }
        } catch (error) {
            console.error('Erreur lors du calcul de route:', error);

            const distance = this.calculateStraightLineDistance(depLatLng, arrLatLng);
            if (this.onDistanceCalculated) {
                this.onDistanceCalculated(distance);
            }
        }
    }

    private drawRoute(coordinates: number[][]): void {
        if (this.routeLine && this.map) {
            this.map.removeLayer(this.routeLine);
        }

        const latLngs = coordinates.map(coord => [coord[1], coord[0]]);

        this.routeLine = window.L.polyline(latLngs, {
            color: '#007cff',
            weight: 4,
            opacity: 0.8
        }).addTo(this.map);
    }

    private calculateStraightLineDistance(point1: any, point2: any): number {
        return Math.round(point1.distanceTo(point2) / 1000);
    }

    private fitBounds(): void {
        if (this.departureMarker && this.arrivalMarker && this.map) {
            const group = window.L.featureGroup([this.departureMarker, this.arrivalMarker]);
            if (this.routeLine) {
                group.addLayer(this.routeLine);
            }
            this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
    }

    public clearRouteMarkers(): void {
        if (this.departureMarker && this.map) {
            this.map.removeLayer(this.departureMarker);
            this.departureMarker = null;
        }
        
        if (this.arrivalMarker && this.map) {
            this.map.removeLayer(this.arrivalMarker);
            this.arrivalMarker = null;
        }
        
        if (this.routeLine && this.map) {
            this.map.removeLayer(this.routeLine);
            this.routeLine = null;
        }
    }

    private selectCoordinate(coord: Coordonnee): void {
        if (!this.map) return;


        this.markers.forEach(marker => {
            if (marker._isSelection && this.map) {
                this.map.removeLayer(marker);
            }
        });


        const redIcon = window.L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });


        const selectionMarker = window.L.marker([coord.latitude, coord.longitude], {
            icon: redIcon
        }).addTo(this.map) as any;
        selectionMarker._isSelection = true;
        this.markers.push(selectionMarker);


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
