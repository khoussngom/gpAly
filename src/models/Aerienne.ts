import { Cargaison, Coordonnee } from "./Cargaison";
import { Colis } from "./Colis";

export class Aerienne extends Cargaison {
    constructor(produitInitial: Colis, distance: number, lieuDepart: Coordonnee, lieuArrivee: Coordonnee) {
        super(produitInitial, distance, lieuDepart, lieuArrivee);
        this.poidsMax = 500;
    }

    public calculerFrais(type: 'alimentaire' | 'materiel', poids: number): number {
        switch(type) {
            case 'alimentaire':
                return (poids * 300 * this.distance) + 5000;
            case 'materiel':
                return poids * 1000 * this.distance;
            default:
                throw new Error("Type de produit non reconnu");
        }
    }
}