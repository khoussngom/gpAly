"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GestionnaireCargaisons = void 0;
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
    obtenirToutesCargaisons() {
        return Array.from(this.cargaisons.values());
    }
    obtenirTousLesColis() {
        return Array.from(this.colis.values());
    }
    changerEtatColis(code, nouvelEtat) {
        const colis = this.colis.get(code);
        if (!colis) {
            return false;
        }
        colis.setEtat(nouvelEtat);
        return true;
    }
    obtenirDetailsCargaison(numero) {
        const cargaison = this.cargaisons.get(numero);
        if (!cargaison) {
            return 'Cargaison non trouvée';
        }
        let details = `=== DÉTAILS DE LA CARGAISON ${numero} ===\n`;
        details += `Type: ${cargaison.getType().toUpperCase()}\n`;
        details += `État: ${cargaison.getEtatAvancement()}\n`;
        details += `Lieu de départ: ${cargaison.getLieuDepart().ville}\n`;
        details += `Lieu d'arrivée: ${cargaison.getLieuArrivee().ville}\n`;
        details += `Distance: ${cargaison.getDistance()} km\n`;
        details += `Poids total: ${cargaison.getPoidsTotal()} kg\n`;
        details += `Nombre de colis: ${cargaison.nbProduit()}\n`;
        details += `Coût total: ${cargaison.sommeTotale()} FCFA\n`;
        if (cargaison.getDateDepart()) {
            details += `Date de départ: ${cargaison.getDateDepart().toLocaleDateString()}\n`;
        }
        if (cargaison.getDateArrivee()) {
            details += `Date d'arrivée: ${cargaison.getDateArrivee().toLocaleDateString()}\n`;
        }
        details += '\n=== COLIS ===\n';
        const produits = cargaison.getProduits();
        if (produits.length === 0) {
            details += 'Aucun colis dans cette cargaison\n';
        }
        else {
            produits.forEach((colis, index) => {
                details += `${index + 1}. ${colis.getCode()} - ${colis.getLibelle()}\n`;
                details += `   Poids: ${colis.getPoids()} kg\n`;
                details += `   État: ${colis.getInfoStatut()}\n`;
                details += `   Client: ${colis.getClient().getNomComplet()}\n\n`;
            });
        }
        return details;
    }
    obtenirDetailsColis(code) {
        const colis = this.colis.get(code);
        if (!colis) {
            return 'Colis non trouvé';
        }
        let details = `=== DÉTAILS DU COLIS ${code} ===\n`;
        details += `Libellé: ${colis.getLibelle()}\n`;
        details += `Poids: ${colis.getPoids()} kg\n`;
        details += `État: ${colis.getInfoStatut()}\n`;
        const client = colis.getClient();
        details += '\n=== CLIENT ===\n';
        details += `Nom: ${client.getNomComplet()}\n`;
        details += `Adresse: ${client.getAdresse()}\n`;
        details += `Téléphone: ${client.getTelephone()}\n`;
        if (client.getEmail()) {
            details += `Email: ${client.getEmail()}\n`;
        }
        // Trouver la cargaison contenant ce colis
        for (const cargaison of this.cargaisons.values()) {
            if (cargaison.getProduits().some(p => p.getCode() === code)) {
                details += '\n=== CARGAISON ===\n';
                details += `Numéro: ${cargaison.getNumero()}\n`;
                details += `Type: ${cargaison.getType().toUpperCase()}\n`;
                details += `De: ${cargaison.getLieuDepart().ville}\n`;
                details += `Vers: ${cargaison.getLieuArrivee().ville}\n`;
                break;
            }
        }
        return details;
    }
    genererRecu(codeColis) {
        const colis = this.colis.get(codeColis);
        if (!colis) {
            return 'Colis non trouvé';
        }
        const client = colis.getClient();
        // Trouver la cargaison contenant ce colis
        let cargaison = null;
        for (const c of this.cargaisons.values()) {
            if (c.getProduits().some(p => p.getCode() === codeColis)) {
                cargaison = c;
                break;
            }
        }
        if (!cargaison) {
            return 'Cargaison non trouvée pour ce colis';
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
    // Méthodes alias pour compatibilité avec CargaisonManager
    getToutesCargaisons() {
        return this.obtenirToutesCargaisons();
    }
    getTousColis() {
        return this.obtenirTousLesColis();
    }
}
exports.GestionnaireCargaisons = GestionnaireCargaisons;
