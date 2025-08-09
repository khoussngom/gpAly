import { Cargaison, Coordonnee } from "./Cargaison";
import { Colis } from "./Colis";

export class Routiere extends Cargaison {
    constructor(produitInitial: Colis, distance: number, lieuDepart: Coordonnee, lieuArrivee: Coordonnee) {
        super(produitInitial, distance, lieuDepart, lieuArrivee);
        this.poidsMax = 1500;
    }

    public calculerFrais(type: 'alimentaire' | 'materiel', poids: number): number {
        switch(type) {
            case 'alimentaire':
                return (poids * 100 * this.distance) + 5000;
            case 'materiel':
                return poids * 400 * this.distance;
            default:
                throw new Error("Type de produit non reconnu");
        }
    }
}
