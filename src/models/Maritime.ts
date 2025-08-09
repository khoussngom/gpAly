import { Cargaison, Coordonnee } from "./Cargaison";
import { Colis } from "./Colis";

export class Maritime extends Cargaison {
    constructor(produitInitial: Colis, distance: number, lieuDepart: Coordonnee, lieuArrivee: Coordonnee) {
        super(produitInitial, distance, lieuDepart, lieuArrivee);
        this.poidsMax = 2000;
    }

    public calculerFrais(type: 'alimentaire' | 'chimique' | 'materiel', poids: number): number {
        switch(type) {
            case 'alimentaire':
                return (poids * 90 * this.distance) + 5000 ;
            case 'chimique':
                return (poids * 500 * this.distance) + 10000;
            case 'materiel':
                return poids * 400 * this.distance;
            default:
                throw new Error("Type de produit non reconnu");
        }
    }
}
