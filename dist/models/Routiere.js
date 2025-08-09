"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routiere = void 0;
const Cargaison_1 = require("./Cargaison");
class Routiere extends Cargaison_1.Cargaison {
    constructor(produitInitial, distance, lieuDepart, lieuArrivee) {
        super(produitInitial, distance, lieuDepart, lieuArrivee);
        this.poidsMax = 1500;
    }
    calculerFrais(type, poids) {
        switch (type) {
            case 'alimentaire':
                return (poids * 100 * this.distance) + 5000;
            case 'materiel':
                return poids * 400 * this.distance;
            default:
                throw new Error("Type de produit non reconnu");
        }
    }
}
exports.Routiere = Routiere;
