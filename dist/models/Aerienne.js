"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aerienne = void 0;
const Cargaison_1 = require("./Cargaison");
class Aerienne extends Cargaison_1.Cargaison {
    constructor(produitInitial, distance, lieuDepart, lieuArrivee) {
        super(produitInitial, distance, lieuDepart, lieuArrivee);
        this.poidsMax = 500;
    }
    calculerDureeEstimee() {
        // Transport aérien : 800 km/h en moyenne
        return Math.ceil(this.distance / 800);
    }
    obtenirSpecificites() {
        return [
            "Transport aérien rapide",
            "Capacité réduite (500kg max)",
            "Coût élevé mais livraison express",
            "Interdit aux produits chimiques"
        ];
    }
}
exports.Aerienne = Aerienne;
