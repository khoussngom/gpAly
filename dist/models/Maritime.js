"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Maritime = void 0;
const Cargaison_1 = require("./Cargaison");
class Maritime extends Cargaison_1.Cargaison {
    constructor(produitInitial, distance, lieuDepart, lieuArrivee) {
        super(produitInitial, distance, lieuDepart, lieuArrivee);
        this.poidsMax = 2000;
    }
    calculerDureeEstimee() {
        return Math.ceil(this.distance / 30);
    }
    obtenirSpecificites() {
        return [
            "Transport maritime économique",
            "Grande capacité (2000kg max)",
            "Obligatoire pour produits chimiques",
            "Interdit aux produits fragiles",
            "Durée de transport plus longue"
        ];
    }
}
exports.Maritime = Maritime;
