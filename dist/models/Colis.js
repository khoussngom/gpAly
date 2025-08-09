"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colis = exports.EtatColis = void 0;
var EtatColis;
(function (EtatColis) {
    EtatColis["EN_ATTENTE"] = "EN_ATTENTE";
    EtatColis["EN_COURS"] = "EN_COURS";
    EtatColis["ARRIVE"] = "ARRIVE";
    EtatColis["RECUPERE"] = "RECUPERE";
    EtatColis["PERDU"] = "PERDU";
    EtatColis["ARCHIVE"] = "ARCHIVE";
    EtatColis["ANNULE"] = "ANNULE";
})(EtatColis || (exports.EtatColis = EtatColis = {}));
class Colis {
    constructor(produit, code, client) {
        this.produit = produit;
        this.code = code;
        this.client = client;
        this.etat = EtatColis.EN_ATTENTE;
        this.dateCreation = new Date();
    }
    getCode() {
        return this.code;
    }
    getClient() {
        return this.client;
    }
    getProduit() {
        return this.produit;
    }
    getLibelle() {
        return this.produit.getLibelle();
    }
    getPoids() {
        return this.produit.getPoids();
    }
    getEtat() {
        return this.etat;
    }
    setEtat(etat) {
        this.etat = etat;
        if (etat === EtatColis.ARRIVE) {
            this.dateArrivee = new Date();
        }
    }
    getDateCreation() {
        return this.dateCreation;
    }
    getDateArrivee() {
        return this.dateArrivee;
    }
    setRetard(jours) {
        this.retardJours = jours;
    }
    getRetard() {
        return this.retardJours;
    }
    getInfoStatut() {
        switch (this.etat) {
            case EtatColis.EN_ATTENTE:
                return "Votre colis est en attente de traitement";
            case EtatColis.EN_COURS:
                if (this.retardJours && this.retardJours > 0) {
                    return `En retard de ${this.retardJours} jour(s)`;
                }
                return "Votre colis est en cours de transport";
            case EtatColis.ARRIVE:
                return "Votre colis est arrivé à destination";
            case EtatColis.RECUPERE:
                return "Votre colis a été récupéré";
            case EtatColis.PERDU:
                return "Votre colis a été déclaré perdu";
            case EtatColis.ARCHIVE:
                return "Votre colis a été archivé";
            case EtatColis.ANNULE:
                return "Votre colis a été annulé";
            default:
                return "Statut inconnu";
        }
    }
}
exports.Colis = Colis;
