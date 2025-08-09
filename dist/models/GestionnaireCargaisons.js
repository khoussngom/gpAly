"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GestionnaireCargaisons = void 0;
const Colis_1 = require("./Colis");
const Maritime_1 = require("./Maritime");
const Aerienne_1 = require("./Aerienne");
const Routiere_1 = require("./Routiere");
class GestionnaireCargaisons {
    constructor() {
        this.cargaisons = new Map();
        this.colis = new Map();
    }
    creerCargaison(type, produitInitial, distance, lieuDepart, lieuArrivee) {
        let cargaison;
        switch (type) {
            case 'maritime':
                cargaison = new Maritime_1.Maritime(produitInitial, distance, lieuDepart, lieuArrivee);
                break;
            case 'aerienne':
                cargaison = new Aerienne_1.Aerienne(produitInitial, distance, lieuDepart, lieuArrivee);
                break;
            case 'routiere':
                cargaison = new Routiere_1.Routiere(produitInitial, distance, lieuDepart, lieuArrivee);
                break;
            default:
                throw new Error('Type de cargaison non reconnu');
        }
        this.cargaisons.set(cargaison.getNumero(), cargaison);
        this.colis.set(produitInitial.getCode(), produitInitial);
        return cargaison;
    }
    ajouterColisACargaison(numeroCargaison, colis) {
        const cargaison = this.cargaisons.get(numeroCargaison);
        if (!cargaison) {
            throw new Error('Cargaison non trouvée');
        }
        cargaison.ajouterProduit(colis);
        this.colis.set(colis.getCode(), colis);
    }
    rechercherColis(code) {
        return this.colis.get(code) || null;
    }
    rechercherCargaisonParCode(code) {
        return this.cargaisons.get(code) || null;
    }
    rechercherCargaisons(criteres) {
        const resultats = [];
        for (const cargaison of this.cargaisons.values()) {
            let correspond = true;
            if (criteres.code && cargaison.getNumero() !== criteres.code) {
                correspond = false;
            }
            if (criteres.lieuDepart && !cargaison.getLieuDepart().ville.toLowerCase().includes(criteres.lieuDepart.toLowerCase())) {
                correspond = false;
            }
            if (criteres.lieuArrivee && !cargaison.getLieuArrivee().ville.toLowerCase().includes(criteres.lieuArrivee.toLowerCase())) {
                correspond = false;
            }
            if (criteres.type && cargaison.getType() !== criteres.type.toLowerCase()) {
                correspond = false;
            }
            if (criteres.dateDepart && cargaison.getDateDepart()) {
                const dateCargaison = cargaison.getDateDepart().toDateString();
                const dateRecherche = criteres.dateDepart.toDateString();
                if (dateCargaison !== dateRecherche) {
                    correspond = false;
                }
            }
            if (criteres.dateArrivee && cargaison.getDateArrivee()) {
                const dateCargaison = cargaison.getDateArrivee().toDateString();
                const dateRecherche = criteres.dateArrivee.toDateString();
                if (dateCargaison !== dateRecherche) {
                    correspond = false;
                }
            }
            if (correspond) {
                resultats.push(cargaison);
            }
        }
        return resultats;
    }
    fermerCargaison(numeroCargaison) {
        const cargaison = this.cargaisons.get(numeroCargaison);
        if (!cargaison) {
            throw new Error('Cargaison non trouvée');
        }
        cargaison.fermerCargaison();
    }
    rouvrirCargaison(numeroCargaison) {
        const cargaison = this.cargaisons.get(numeroCargaison);
        if (!cargaison) {
            throw new Error('Cargaison non trouvée');
        }
        cargaison.rouvrirCargaison();
    }
    recupererColis(codeColis) {
        const colis = this.colis.get(codeColis);
        if (!colis) {
            return false;
        }
        // Trouver la cargaison contenant ce colis
        for (const cargaison of this.cargaisons.values()) {
            if (cargaison.recupererColis(codeColis)) {
                return true;
            }
        }
        return false;
    }
    marquerColisCommePerdu(codeColis) {
        const colis = this.colis.get(codeColis);
        if (!colis) {
            return false;
        }
        for (const cargaison of this.cargaisons.values()) {
            if (cargaison.marquerColisCommePerdu(codeColis)) {
                return true;
            }
        }
        return false;
    }
    archiverColis(codeColis) {
        const colis = this.colis.get(codeColis);
        if (!colis) {
            return false;
        }
        for (const cargaison of this.cargaisons.values()) {
            if (cargaison.archiverColis(codeColis)) {
                return true;
            }
        }
        return false;
    }
    annulerColis(codeColis) {
        const colis = this.colis.get(codeColis);
        if (!colis || colis.getEtat() !== Colis_1.EtatColis.EN_ATTENTE) {
            return false;
        }
        for (const cargaison of this.cargaisons.values()) {
            const colisInCargaison = cargaison.rechercherColis(codeColis);
            if (colisInCargaison && cargaison.estOuverte()) {
                colis.setEtat(Colis_1.EtatColis.ANNULE);
                return true;
            }
        }
        return false;
    }
    changerEtatColis(codeColis, nouvelEtat) {
        const colis = this.colis.get(codeColis);
        if (!colis) {
            return false;
        }
        colis.setEtat(nouvelEtat);
        return true;
    }
    archiverColisAutomatiquement() {
        const maintenant = new Date();
        const delaiArchivage = 30 * 24 * 60 * 60 * 1000;
        for (const colis of this.colis.values()) {
            if (colis.getEtat() === Colis_1.EtatColis.ARRIVE && colis.getDateArrivee()) {
                const tempsEcoule = maintenant.getTime() - colis.getDateArrivee().getTime();
                if (tempsEcoule > delaiArchivage) {
                    colis.setEtat(Colis_1.EtatColis.ARCHIVE);
                }
            }
        }
    }
    getToutesCargaisons() {
        return Array.from(this.cargaisons.values());
    }
    getTousColis() {
        return Array.from(this.colis.values());
    }
    genererRecu(codeColis) {
        const colis = this.colis.get(codeColis);
        if (!colis) {
            return null;
        }
        const client = colis.getClient();
        let cargaison = null;
        for (const c of this.cargaisons.values()) {
            if (c.rechercherColis(codeColis)) {
                cargaison = c;
                break;
            }
        }
        if (!cargaison) {
            return null;
        }
        return `
=== REÇU DE COLIS ===
Code du colis: ${colis.getCode()}
Date: ${new Date().toLocaleDateString()}

EXPÉDITEUR:
${client.getNomComplet()}
${client.getAdresse()}
Tél: ${client.getTelephone()}
${client.getEmail() ? `Email: ${client.getEmail()}` : ''}

COLIS:
Libellé: ${colis.getLibelle()}
Poids: ${colis.getPoids()} kg
État: ${colis.getInfoStatut()}

CARGAISON:
Numéro: ${cargaison.getNumero()}
Type: ${cargaison.getType()}
Départ: ${cargaison.getLieuDepart().ville}
Arrivée: ${cargaison.getLieuArrivee().ville}
Distance: ${cargaison.getDistance()} km

TARIFICATION:
Total à payer: ${cargaison.sommeTotale()} FCFA

=== FIN DU REÇU ===
        `;
    }
}
exports.GestionnaireCargaisons = GestionnaireCargaisons;
