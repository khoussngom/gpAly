"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alimentaire = void 0;
const Produit_1 = require("./Produit");
class Alimentaire extends Produit_1.Produit {
    constructor(libelle, poids) {
        super(libelle, poids);
    }
}
exports.Alimentaire = Alimentaire;
