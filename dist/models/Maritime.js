"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Maritime = void 0;
const Cargaison_1 = require("./Cargaison");
class Maritime extends Cargaison_1.Cargaison {
    constructor(produitInitial, distance, lieuDepart, lieuArrivee) {
        super(produitInitial, distance, lieuDepart, lieuArrivee);
        this.poidsMax = 2000;
    }
    calculerFrais(type, poids) {
        switch (type) {
            case 'alimentaire':
                return (poids * 90 * this.distance) + 5000;
            case 'chimique':
                return (poids * 500 * this.distance) + 10000;
            case 'materiel':
                return poids * 400 * this.distance;
            default:
                throw new Error("Type de produit non reconnu");
        }
    }
}
exports.Maritime = Maritime;
