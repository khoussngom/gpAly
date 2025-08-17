"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cargaison = exports.FRAIS_TRANSPORT = exports.TypeCargaison = exports.EtatCargaison = void 0;
var EtatCargaison;
(function (EtatCargaison) {
    EtatCargaison["EN_ATTENTE"] = "EN_ATTENTE";
    EtatCargaison["EN_COURS"] = "EN_COURS";
    EtatCargaison["ARRIVE"] = "ARRIVE";
    EtatCargaison["TERMINE"] = "TERMINE";
})(EtatCargaison || (exports.EtatCargaison = EtatCargaison = {}));
var TypeCargaison;
(function (TypeCargaison) {
    TypeCargaison["ROUTIERE"] = "routiere";
    TypeCargaison["MARITIME"] = "maritime";
    TypeCargaison["AERIENNE"] = "aerienne";
})(TypeCargaison || (exports.TypeCargaison = TypeCargaison = {}));
// Grille des frais de transport selon les règles
exports.FRAIS_TRANSPORT = {
    alimentaire: { routiere: 100, maritime: 90, aerienne: 300, autresFrais: 5000 },
    chimique: { routiere: 0, maritime: 500, aerienne: 0, autresFrais: 10000 }, // routière et aérienne interdites
    materiel: { routiere: 200, maritime: 400, aerienne: 1000, autresFrais: 0 }
};
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
        return 'CARG-' + Date.now().toString();
    }
    ajouterColis(colis) {
        if (this.estFermee) {
            console.warn('Cannot add colis to closed cargaison');
            return false;
        }
        // Vérifier la capacité
        const poidsTotal = this.produits.reduce((total, c) => total + c.getPoids(), 0);
        const nouveauPoids = poidsTotal + colis.getPoids();
        if (nouveauPoids > this.poidsMax) {
            console.warn(`Capacité dépassée. Poids actuel: ${poidsTotal}kg, tentative d'ajout: ${colis.getPoids()}kg, capacité max: ${this.poidsMax}kg`);
            return false;
        }
        // Vérifier la compatibilité des produits
        const produitToCheck = colis.getProduit();
        if (!this.verifierCompatibiliteProduit(produitToCheck)) {
            const typeProduit = produitToCheck.constructor.name.toLowerCase();
            console.warn(`Produit ${typeProduit} incompatible avec le transport ${this.type}`);
            return false;
        }
        this.produits.push(colis);
        // Calculer et afficher les frais pour ce colis
        const produit = colis.getProduit();
        const typeProduit = produit.constructor.name.toLowerCase();
        const frais = this.calculerFrais(typeProduit, produit.getPoids());
        console.log(`Produit ajouté : ${produit.getLibelle()} - ${produit.getPoids()}kg - Frais: ${frais} FCFA`);
        console.log(`Total frais pour ce colis : ${frais} FCFA`);
        console.log(`Poids total cargaison : ${nouveauPoids}kg / ${this.poidsMax}kg`);
        return true;
    }
    verifierCompatibiliteProduit(produit) {
        const typeProduit = produit.constructor.name.toLowerCase();
        const typeTransport = this.type;
        // Règles métier
        if (typeProduit === 'chimique' && typeTransport !== 'maritime') {
            return false; // Les produits chimiques doivent toujours transiter par voie maritime
        }
        if (typeProduit === 'fragile' && typeTransport === 'maritime') {
            return false; // Les produits fragiles ne doivent jamais passer par voie maritime
        }
        return true;
    }
    getTypeCargaison() {
        const type = this.constructor.name.toLowerCase();
        switch (type) {
            case 'maritime': return TypeCargaison.MARITIME;
            case 'aerienne': return TypeCargaison.AERIENNE;
            case 'routiere': return TypeCargaison.ROUTIERE;
            default: return TypeCargaison.ROUTIERE;
        }
    }
    calculerFrais(typeProduit, poids) {
        const typeTransport = this.getTypeCargaison();
        // Gestion des types composites
        let typeForCalculation = typeProduit;
        if (typeProduit === 'fragile' || typeProduit === 'incassable') {
            typeForCalculation = 'materiel';
        }
        // Accès sécurisé aux frais
        const fraisType = exports.FRAIS_TRANSPORT[typeForCalculation];
        if (!fraisType)
            return 0;
        const fraisParKg = fraisType[typeTransport] || 0;
        return fraisParKg * poids;
    }
    calculerMontantTotal() {
        let montantTotal = 0;
        for (const colis of this.produits) {
            const produit = colis.getProduit();
            const typeProduit = produit.constructor.name.toLowerCase();
            const frais = this.calculerFrais(typeProduit, produit.getPoids());
            montantTotal += frais;
        }
        return montantTotal;
    }
    fermerCargaison() {
        this.estFermee = true;
        this.etatAvancement = EtatCargaison.EN_COURS;
        this.dateDepart = new Date();
        const montantTotal = this.calculerMontantTotal();
        console.log(`Cargaison ${this.numero} fermée. Montant total: ${montantTotal} FCFA`);
    }
    obtenirRecapitulatif() {
        const poidsTotal = this.produits.reduce((total, c) => total + c.getPoids(), 0);
        const montantTotal = this.calculerMontantTotal();
        return {
            numero: this.numero,
            type: this.type,
            poidsTotal: poidsTotal,
            poidsMax: this.poidsMax,
            nombreColis: this.produits.length,
            montantTotal: montantTotal,
            distance: this.distance,
            lieuDepart: this.lieuDepart.ville,
            lieuArrivee: this.lieuArrivee.ville,
            estFermee: this.estFermee,
            etat: this.etatAvancement
        };
    }
    // Getters
    getNumero() { return this.numero; }
    getProduits() { return this.produits; }
    getDistance() { return this.distance; }
    getEstFermee() { return this.estFermee; }
    getPoidsMax() { return this.poidsMax; }
    getLieuDepart() { return this.lieuDepart; }
    getLieuArrivee() { return this.lieuArrivee; }
    getEtatAvancement() { return this.etatAvancement; }
    getDateDepart() { return this.dateDepart; }
    getDateArrivee() { return this.dateArrivee; }
    // Setters
    setEtatAvancement(etat) { this.etatAvancement = etat; }
    setDateArrivee(date) { this.dateArrivee = date; }
}
exports.Cargaison = Cargaison;
