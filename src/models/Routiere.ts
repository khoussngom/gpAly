import { Cargaison, Coordonnee } from "./Cargaison";
import { Colis } from "./Colis";

export class Routiere extends Cargaison {
    constructor(produitInitial: Colis, distance: number, lieuDepart: Coordonnee, lieuArrivee: Coordonnee) {
        super(produitInitial, distance, lieuDepart, lieuArrivee);
        this.poidsMax = 1500;
    }

    public calculerDureeEstimee(): number {

        return Math.ceil(this.distance / 80);
    }

    public obtenirSpecificites(): string[] {
        return [
            "Transport routier flexible",
            "Capacité moyenne (1500kg max)",
            "Bon rapport qualité-prix",
            "Livraison porte-à-porte",
            "Interdit aux produits chimiques"
        ];
    }
}
