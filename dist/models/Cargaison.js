"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cargaison = void 0;
class Cargaison {
    constructor(produitInitial, distance) {
        this.produits = [];
        this.produits.push(produitInitial);
        this.distance = distance;
    }
    getProduits() {
        return this.produits;
    }
    getDistance() {
        return this.distance;
    }
    setDistance(distance) {
        this.distance = distance;
    }
    ajouterProduit(produit) {
        if (this.produits.length >= 10) {
            throw new Error("La cargaison est pleine (max 10 produits)");
        }
        this.produits.push(produit);
        const typeProduit = produit.constructor.name.toLowerCase();
        const frais = this.calculerFrais(typeProduit, produit.getPoids());
        console.log(` Produit ajouté : ${produit.getLibelle()} - ${produit.getPoids()}kg`);
        console.log(` Frais pour ce produit : ${frais} FCFA`);
    }
    nbProduit() {
        return this.produits.length;
    }
    sommeTotale() {
        let total = 0;
        for (let produit of this.getProduits()) {
            const typeProduit = produit.constructor.name.toLowerCase();
            total += this.calculerFrais(typeProduit, produit.getPoids());
        }
        return total;
    }
}
exports.Cargaison = Cargaison;
