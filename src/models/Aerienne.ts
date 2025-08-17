import { Cargaison, Coordonnee } from "./Cargaison";
import { Colis } from "./Colis";

export class Aerienne extends Cargaison {
    constructor(produitInitial: Colis, distance: number, lieuDepart: Coordonnee, lieuArrivee: Coordonnee) {
        super(produitInitial, distance, lieuDepart, lieuArrivee);
        this.poidsMax = 500;
    }

    public calculerDureeEstimee(): number {

        return Math.ceil(this.distance / 800);
    }

    public obtenirSpecificites(): string[] {
        return [
            "Transport aérien rapide",
            "Capacité réduite (500kg max)",
            "Coût élevé mais livraison express",
            "Interdit aux produits chimiques"
        ];
    }
}