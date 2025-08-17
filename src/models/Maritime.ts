import { Cargaison, Coordonnee } from "./Cargaison";
import { Colis } from "./Colis";

export class Maritime extends Cargaison {
    constructor(produitInitial: Colis, distance: number, lieuDepart: Coordonnee, lieuArrivee: Coordonnee) {
        super(produitInitial, distance, lieuDepart, lieuArrivee);
        this.poidsMax = 2000;
    }

    public calculerDureeEstimee(): number {

        return Math.ceil(this.distance / 30);
    }

    public obtenirSpecificites(): string[] {
        return [
            "Transport maritime économique",
            "Grande capacité (2000kg max)",
            "Obligatoire pour produits chimiques",
            "Interdit aux produits fragiles",
            "Durée de transport plus longue"
        ];
    }
}
