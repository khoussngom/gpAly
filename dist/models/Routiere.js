"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routiere = void 0;
const Cargaison_1 = require("./Cargaison");
class Routiere extends Cargaison_1.Cargaison {
    constructor(produitInitial, distance, lieuDepart, lieuArrivee) {
        super(produitInitial, distance, lieuDepart, lieuArrivee);
        this.poidsMax = 1500;
    }
    calculerDureeEstimee() {
        // Transport routier : 80 km/h en moyenne
        return Math.ceil(this.distance / 80);
    }
    obtenirSpecificites() {
        return [
            "Transport routier flexible",
            "Capacité moyenne (1500kg max)",
            "Bon rapport qualité-prix",
            "Livraison porte-à-porte",
            "Interdit aux produits chimiques"
        ];
    }
}
exports.Routiere = Routiere;
