"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cargaison = exports.EtatCargaison = void 0;
const Colis_1 = require("./Colis");
var EtatCargaison;
(function (EtatCargaison) {
    EtatCargaison["EN_ATTENTE"] = "EN_ATTENTE";
    EtatCargaison["EN_COURS"] = "EN_COURS";
    EtatCargaison["ARRIVE"] = "ARRIVE";
    EtatCargaison["TERMINE"] = "TERMINE";
})(EtatCargaison || (exports.EtatCargaison = EtatCargaison = {}));
class Cargaison {
    constructor(produitInitial, distance, lieuDepart, lieuArrivee) {
        this.produits = [];
        this.estFermee = false;
        this.poidsMax = 1000;
        this.etatAvancement = EtatCargaison.EN_ATTENTE;
        this.numero = this.generateNumero();
        this.produits.push(produitInitial);
        this.distance = distance;
        this.lieuDepart = lieuDepart;
        this.lieuArrivee = lieuArrivee;
        this.type = this.constructor.name.toLowerCase();
    }
    generateNumero() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `CARG-${timestamp}-${random}`;
    }
    ajouterProduit(produit) {
        if (this.estFermee) {
            throw new Error("Cargaison fermée. Impossible d'ajouter un produit.");
        }
        if (this.produits.length >= 10) {
            throw new Error("La cargaison est pleine (max 10 produits)");
        }
        const poidsTotal = this.getPoidsTotal() + produit.getPoids();
        if (poidsTotal > this.poidsMax) {
            throw new Error(`Poids maximum dépassé. Poids actuel: ${this.getPoidsTotal()}kg, Ajout: ${produit.getPoids()}kg, Max: ${this.poidsMax}kg`);
        }
        this.produits.push(produit);
        const typeProduit = produit.getProduit().constructor.name.toLowerCase();
        let typeForCalculation = typeProduit;
        if (typeProduit === 'fragile' || typeProduit === 'incassable') {
            typeForCalculation = 'materiel';
        }
        const frais = this.calculerFrais(typeForCalculation, produit.getPoids());
        console.log(`Produit ajouté : ${produit.getLibelle()} - ${produit.getPoids()}kg`);
        console.log(`Frais pour ce produit : ${frais} FCFA`);
    }
    fermerCargaison() {
        this.estFermee = true;
        this.etatAvancement = EtatCargaison.EN_COURS;
        this.dateDepart = new Date();
        this.produits.forEach(colis => {
            if (colis.getEtat() === Colis_1.EtatColis.EN_ATTENTE) {
                colis.setEtat(Colis_1.EtatColis.EN_COURS);
            }
        });
    }
    rouvrirCargaison() {
        if (this.etatAvancement !== EtatCargaison.EN_ATTENTE) {
            throw new Error("Une cargaison ne peut être rouverte que si son état d'avancement est EN ATTENTE");
        }
        this.estFermee = false;
    }
    marquerArrivee() {
        this.etatAvancement = EtatCargaison.ARRIVE;
        this.dateArrivee = new Date();
        this.produits.forEach(colis => {
            if (colis.getEtat() === Colis_1.EtatColis.EN_COURS) {
                colis.setEtat(Colis_1.EtatColis.ARRIVE);
            }
        });
    }
    getPoidsTotal() {
        return this.produits.reduce((total, colis) => total + colis.getPoids(), 0);
    }
    getNumero() { return this.numero; }
    getDistance() { return this.distance; }
    getPoidsMax() { return this.poidsMax; }
    getLieuDepart() { return this.lieuDepart; }
    getLieuArrivee() { return this.lieuArrivee; }
    getEtatAvancement() { return this.etatAvancement; }
    getDateDepart() { return this.dateDepart; }
    getDateArrivee() { return this.dateArrivee; }
    getType() { return this.type; }
    estOuverte() { return !this.estFermee; }
    nbProduit() { return this.produits.length; }
    getProduits() { return this.produits; }
    rechercherColis(code) {
        return this.produits.find(colis => colis.getCode() === code) || null;
    }
    marquerColisCommePerdu(code) {
        const colis = this.rechercherColis(code);
        if (colis) {
            colis.setEtat(Colis_1.EtatColis.PERDU);
            return true;
        }
        return false;
    }
    recupererColis(code) {
        const colis = this.rechercherColis(code);
        if (colis && colis.getEtat() === Colis_1.EtatColis.ARRIVE) {
            colis.setEtat(Colis_1.EtatColis.RECUPERE);
            return true;
        }
        return false;
    }
    archiverColis(code) {
        const colis = this.rechercherColis(code);
        if (colis) {
            colis.setEtat(Colis_1.EtatColis.ARCHIVE);
            return true;
        }
        return false;
    }
    sommeTotale() {
        let total = 0;
        for (let produit of this.getProduits()) {
            const typeProduit = produit.getProduit().constructor.name.toLowerCase();
            let typeForCalculation = typeProduit;
            if (typeProduit === 'fragile' || typeProduit === 'incassable') {
                typeForCalculation = 'materiel';
            }
            total += this.calculerFrais(typeForCalculation, produit.getPoids());
        }
        return total < 10000 ? 10000 : total;
    }
}
exports.Cargaison = Cargaison;
