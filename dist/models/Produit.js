"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Produit = void 0;
class Produit {
    constructor(libelle, poids) {
        this.libelle = libelle;
        this.poids = poids;
    }
    getLibelle() {
        return this.libelle;
    }
    getPoids() {
        return this.poids;
    }
    setLibelle(libelle) {
        this.libelle = libelle;
    }
    setPoids(poids) {
        this.poids = poids;
    }
    info() {
        return [
            `Libellé : ${this.getLibelle()}`,
            `Poids : ${this.getPoids()} kg`
        ];
    }
}
exports.Produit = Produit;
