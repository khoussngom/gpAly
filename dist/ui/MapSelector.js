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
    constructor(container, onCoordinateSelected, options) {
        this.map = null;
        this.markers = [];
        this.departureMarker = null;
        this.arrivalMarker = null;
        this.routeLine = null;
        this.currentMode = 'departure';
        this.container = container;
        this.onCoordinateSelected = onCoordinateSelected;
        this.onLocationSelect = options === null || options === void 0 ? void 0 : options.onLocationSelect;
        this.onDistanceCalculated = options === null || options === void 0 ? void 0 : options.onDistanceCalculated;
    }
    init() {
        this.loadLeafletLibrary().then(() => {
            this.initMap();
            this.addMapControls();
        });
    }
    setMode(mode) {
        this.currentMode = mode;
        this.updateModeButtons();
    }
    updateModeButtons() {
        const departureBtn = document.getElementById('departure-mode-btn');
        const arrivalBtn = document.getElementById('arrival-mode-btn');
        if (departureBtn && arrivalBtn) {
            departureBtn.classList.toggle('active', this.currentMode === 'departure');
            arrivalBtn.classList.toggle('active', this.currentMode === 'arrival');
        }
    }
    addMapControls() {
        var _a, _b, _c;
        const controlsHtml = `
            <div class="map-controls" style="position: absolute; top: 10px; right: 10px; z-index: 1000; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="margin-bottom: 8px; font-weight: bold; font-size: 12px;">Mode de sélection:</div>
                <button id="departure-mode-btn" class="map-control-btn active" style="margin: 2px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; background-color: #007cff; color: white;">
                    🟢 Départ
                </button>
                <button id="arrival-mode-btn" class="map-control-btn" style="margin: 2px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
                    🔴 Arrivée
                </button>
                <div style="margin-top: 8px;">
                    <button id="clear-markers-btn" style="margin: 2px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; background-color: #ff4444; color: white;">
                        🗑️ Effacer
                    </button>
                </div>
            </div>
        `;
        this.container.style.position = 'relative';
        this.container.insertAdjacentHTML('beforeend', controlsHtml);
        // Événements des boutons
        (_a = document.getElementById('departure-mode-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            this.setMode('departure');
        });
        (_b = document.getElementById('arrival-mode-btn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.setMode('arrival');
        });
        (_c = document.getElementById('clear-markers-btn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.clearRouteMarkers();
        });
        // Style CSS dynamique pour les boutons
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
    loadLeafletLibrary() {
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
    initMap() {
        this.map = window.L.map(this.container).setView([14.7163792, -17.471395], 6);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        this.map.on('click', (e) => {
            this.handleMapClick(e.latlng.lat, e.latlng.lng);
        });
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
            var _a, _b, _c, _d, _e;
            try {
                // Géocodage pour obtenir l'adresse
                const response = yield fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lng=${lng}&addressdetails=1`);
                const data = yield response.json();
                const ville = ((_a = data.address) === null || _a === void 0 ? void 0 : _a.city) || ((_b = data.address) === null || _b === void 0 ? void 0 : _b.town) || ((_c = data.address) === null || _c === void 0 ? void 0 : _c.village) ||
                    ((_d = data.display_name) === null || _d === void 0 ? void 0 : _d.split(',')[0].trim()) ||
                    `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                const location = {
                    lat,
                    lng,
                    address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    city: ville,
                    country: ((_e = data.address) === null || _e === void 0 ? void 0 : _e.country) || 'Pays inconnu'
                };
                // Mode de sélection départ/arrivée
                if (this.onLocationSelect) {
                    if (this.currentMode === 'departure') {
                        this.setDepartureLocation(location);
                    }
                    else {
                        this.setArrivalLocation(location);
                    }
                    // Calculer la distance si les deux points sont définis
                    if (this.departureMarker && this.arrivalMarker) {
                        this.calculateAndDisplayRoute();
                    }
                    this.onLocationSelect(location, this.currentMode);
                }
                // Mode de sélection classique (rétrocompatibilité)
                this.selectCoordinate({
                    ville,
                    latitude: lat,
                    longitude: lng
                });
            }
            catch (error) {
                console.error('Erreur de géocodage:', error);
                // Fallback
                const coord = {
                    ville: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    latitude: lat,
                    longitude: lng
                };
                this.selectCoordinate(coord);
            }
        });
    }
    setDepartureLocation(location) {
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
            <strong>🟢 Point de départ</strong><br>
            ${location.city}, ${location.country}<br>
            <small>${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</small>
        `);
    }
    setArrivalLocation(location) {
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
            <strong>🔴 Point d'arrivée</strong><br>
            ${location.city}, ${location.country}<br>
            <small>${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</small>
        `);
    }
    calculateAndDisplayRoute() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.departureMarker || !this.arrivalMarker || !this.map)
                return;
            const depLatLng = this.departureMarker.getLatLng();
            const arrLatLng = this.arrivalMarker.getLatLng();
            try {
                // Utiliser l'API de routage OSRM pour calculer la route
                const response = yield fetch(`https://router.project-osrm.org/route/v1/driving/${depLatLng.lng},${depLatLng.lat};${arrLatLng.lng},${arrLatLng.lat}?overview=full&geometries=geojson`);
                if (!response.ok) {
                    throw new Error('Échec du calcul de route');
                }
                const data = yield response.json();
                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const distance = Math.round(route.distance / 1000); // Convertir en kilomètres
                    // Dessiner la route sur la carte
                    this.drawRoute(route.geometry.coordinates);
                    // Informer le parent de la distance calculée
                    if (this.onDistanceCalculated) {
                        this.onDistanceCalculated(distance);
                    }
                    // Ajuster la vue pour inclure toute la route
                    this.fitBounds();
                }
            }
            catch (error) {
                console.error('Erreur lors du calcul de route:', error);
                // Fallback : calculer la distance à vol d'oiseau
                const distance = this.calculateStraightLineDistance(depLatLng, arrLatLng);
                if (this.onDistanceCalculated) {
                    this.onDistanceCalculated(distance);
                }
            }
        });
    }
    drawRoute(coordinates) {
        if (this.routeLine && this.map) {
            this.map.removeLayer(this.routeLine);
        }
        // Convertir les coordonnées [lng, lat] en [lat, lng] pour Leaflet
        const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
        this.routeLine = window.L.polyline(latLngs, {
            color: '#007cff',
            weight: 4,
            opacity: 0.8
        }).addTo(this.map);
    }
    calculateStraightLineDistance(point1, point2) {
        return Math.round(point1.distanceTo(point2) / 1000); // En kilomètres
    }
    fitBounds() {
        if (this.departureMarker && this.arrivalMarker && this.map) {
            const group = window.L.featureGroup([this.departureMarker, this.arrivalMarker]);
            if (this.routeLine) {
                group.addLayer(this.routeLine);
            }
            this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
    }
    clearRouteMarkers() {
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
    selectCoordinate(coord) {
        if (!this.map)
            return;
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
        }).addTo(this.map);
        selectionMarker._isSelection = true;
        this.markers.push(selectionMarker);
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
