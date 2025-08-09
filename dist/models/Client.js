"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
class Client {
    constructor(nom, prenom, telephone, adresse, email) {
        this.nom = nom;
        this.prenom = prenom;
        this.telephone = telephone;
        this.adresse = adresse;
        this.email = email;
    }
    getNomComplet() {
        return `${this.prenom} ${this.nom}`;
    }
    getNom() {
        return this.nom;
    }
    getPrenom() {
        return this.prenom;
    }
    getTelephone() {
        return this.telephone;
    }
    getAdresse() {
        return this.adresse;
    }
    getEmail() {
        return this.email;
    }
}
exports.Client = Client;
