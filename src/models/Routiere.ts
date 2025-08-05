import { Cargaison } from "./Cargaison";

export class Routiere extends Cargaison {
    public calculerFrais(type: 'alimentaire' | 'materiel', poids: number): number {
        switch(type) {
            case 'alimentaire':
                return (poids * 100 * this.distance) + 5000;
            case 'materiel':
                return poids * 200 * this.distance;
            default:
                throw new Error("Type de produit non reconnu");
        }
    }
}
