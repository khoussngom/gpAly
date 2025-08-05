"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chimique = void 0;
const Produit_1 = require("./Produit");
class Chimique extends Produit_1.Produit {
    constructor(libelle, poids, degres) {
        super(libelle, poids);
        this.degreDeToxicite = degres;
    }
    getDegreDeToxicite() {
        return this.degreDeToxicite;
    }
    setDegreDeToxicite(degreDeToxicite) {
        this.degreDeToxicite = degreDeToxicite;
    }
    info() {
        return [
            ...super.info(),
            `Toxicité : ${this.getDegreDeToxicite()}`
        ];
    }
}
exports.Chimique = Chimique;
