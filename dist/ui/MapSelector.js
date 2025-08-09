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
exports.MapSelector = void 0;
class MapSelector {
    constructor(container, onCoordinateSelected) {
        this.map = null;
        this.markers = [];
        this.container = container;
        this.onCoordinateSelected = onCoordinateSelected;
    }
    init() {
        this.loadLeafletLibrary().then(() => {
            this.initMap();
        });
    }
    loadLeafletLibrary() {
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
    initMap() {
        // Carte centrée sur l'Afrique de l'Ouest
        this.map = window.L.map(this.container).setView([14.6928, -17.4467], 6);
        // Ajouter les tuiles OpenStreetMap
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        // Gérer les clics sur la carte
        this.map.on('click', (e) => {
            this.handleMapClick(e.latlng.lat, e.latlng.lng);
        });
        // Charger les coordonnées prédéfinies
        this.loadPredefinedCoordinates();
    }
    loadPredefinedCoordinates() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('/api/coordonnees');
                const coordinates = yield response.json();
                coordinates.forEach((coord) => {
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
            }
            catch (error) {
                console.error('Erreur lors du chargement des coordonnées:', error);
            }
        });
    }
    handleMapClick(lat, lng) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Géocodage inverse pour obtenir le nom de la ville
                const response = yield fetch(`/api/geocoding?lat=${lat}&lng=${lng}`);
                const data = yield response.json();
                const ville = data.display_name ?
                    data.display_name.split(',')[0].trim() :
                    `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                this.selectCoordinate({
                    ville,
                    latitude: lat,
                    longitude: lng
                });
            }
            catch (error) {
                console.error('Erreur de géocodage:', error);
                // Fallback avec les coordonnées
                this.selectCoordinate({
                    ville: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    latitude: lat,
                    longitude: lng
                });
            }
        });
    }
    selectCoordinate(coord) {
        if (!this.map)
            return;
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
        }).addTo(this.map);
        selectionMarker._isSelection = true;
        this.markers.push(selectionMarker);
        // Appeler le callback
        this.onCoordinateSelected(coord);
    }
    searchLocation(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`/api/geocoding?q=${encodeURIComponent(query)}`);
                const results = yield response.json();
                return results.map((result) => ({
                    ville: result.display_name.split(',')[0].trim(),
                    latitude: result.latitude,
                    longitude: result.longitude
                }));
            }
            catch (error) {
                console.error('Erreur de recherche:', error);
                return [];
            }
        });
    }
    centerOnCoordinate(coord) {
        if (this.map) {
            this.map.setView([coord.latitude, coord.longitude], 10);
        }
    }
    destroy() {
        if (this.map) {
            this.map.remove();
        }
    }
}
exports.MapSelector = MapSelector;
