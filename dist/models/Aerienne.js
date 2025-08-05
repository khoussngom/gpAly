"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aerienne = void 0;
const Cargaison_1 = require("./Cargaison");
class Aerienne extends Cargaison_1.Cargaison {
    calculerFrais(type, poids) {
        switch (type) {
            case 'alimentaire':
                return (poids * 300 * this.distance) + 5000;
            case 'materiel':
                return poids * 1000 * this.distance;
            default:
                throw new Error("Type de produit non reconnu");
        }
    }
}
exports.Aerienne = Aerienne;
