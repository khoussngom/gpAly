import { Cargaison } from "./Cargaison";

export class Aerienne extends Cargaison {
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
