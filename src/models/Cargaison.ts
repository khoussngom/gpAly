import { Colis, EtatColis } from './Colis';

export enum EtatCargaison {
    EN_ATTENTE = "EN_ATTENTE",
    EN_COURS = "EN_COURS",
    ARRIVE = "ARRIVE",
    TERMINE = "TERMINE"
}

export interface Coordonnee {
    latitude: number;
    longitude: number;
    ville: string;
}

export abstract class Cargaison {
    protected numero: string;
    protected produits: Colis[] = [];
    protected distance: number;
    protected estFermee: boolean = false;
    protected poidsMax: number = 1000; 
    protected lieuDepart: Coordonnee;
    protected lieuArrivee: Coordonnee;
    protected etatAvancement: EtatCargaison = EtatCargaison.EN_ATTENTE;
    protected dateDepart?: Date;
    protected dateArrivee?: Date;
    protected type: string;

    constructor(produitInitial: Colis, distance: number, lieuDepart: Coordonnee, lieuArrivee: Coordonnee) {
        this.numero = this.generateNumero();
        this.produits.push(produitInitial);
        this.distance = distance;
        this.lieuDepart = lieuDepart;
        this.lieuArrivee = lieuArrivee;
        this.type = this.constructor.name.toLowerCase();
    }

    private generateNumero(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `CARG-${timestamp}-${random}`;
    }

    public ajouterProduit(produit: Colis): void {
        if (this.estFermee) {
            throw new Error("Cargaison fermée. Impossible d'ajouter un produit.");
        }

        if (this.produits.length >= 10) {
            throw new Error("La cargaison est pleine (max 10 produits)");
        }

        const poidsTotal = this.getPoidsTotal() + produit.getPoids();
        if (poidsTotal > this.poidsMax) {
            throw new Error(`Poids maximum dépassé. Poids actuel: ${this.getPoidsTotal()}kg, Ajout: ${produit.getPoids()}kg, Max: ${this.poidsMax}kg`);
        }

        this.produits.push(produit);

        const typeProduit = produit.getProduit().constructor.name.toLowerCase();
        let typeForCalculation = typeProduit;
        if (typeProduit === 'fragile' || typeProduit === 'incassable') {
            typeForCalculation = 'materiel';
        }

        const frais = this.calculerFrais(typeForCalculation, produit.getPoids());
        console.log(`Produit ajouté : ${produit.getLibelle()} - ${produit.getPoids()}kg`);
        console.log(`Frais pour ce produit : ${frais} FCFA`);
    }

    public fermerCargaison(): void {
        this.estFermee = true;
        this.etatAvancement = EtatCargaison.EN_COURS;
        this.dateDepart = new Date();
        
        this.produits.forEach(colis => {
            if (colis.getEtat() === EtatColis.EN_ATTENTE) {
                colis.setEtat(EtatColis.EN_COURS);
            }
        });
    }

    public rouvrirCargaison(): void {
        if (this.etatAvancement !== EtatCargaison.EN_ATTENTE) {
            throw new Error("Une cargaison ne peut être rouverte que si son état d'avancement est EN ATTENTE");
        }
        this.estFermee = false;
    }

    public marquerArrivee(): void {
        this.etatAvancement = EtatCargaison.ARRIVE;
        this.dateArrivee = new Date();
        
        this.produits.forEach(colis => {
            if (colis.getEtat() === EtatColis.EN_COURS) {
                colis.setEtat(EtatColis.ARRIVE);
            }
        });
    }

    public getPoidsTotal(): number {
        return this.produits.reduce((total, colis) => total + colis.getPoids(), 0);
    }

    public getNumero(): string { return this.numero; }
    public getDistance(): number { return this.distance; }
    public getPoidsMax(): number { return this.poidsMax; }
    public getLieuDepart(): Coordonnee { return this.lieuDepart; }
    public getLieuArrivee(): Coordonnee { return this.lieuArrivee; }
    public getEtatAvancement(): EtatCargaison { return this.etatAvancement; }
    public getDateDepart(): Date | undefined { return this.dateDepart; }
    public getDateArrivee(): Date | undefined { return this.dateArrivee; }
    public getType(): string { return this.type; }
    public estOuverte(): boolean { return !this.estFermee; }
    public nbProduit(): number { return this.produits.length; }
    public getProduits(): Colis[] { return this.produits; }

    public rechercherColis(code: string): Colis | null {
        return this.produits.find(colis => colis.getCode() === code) || null;
    }

    public marquerColisCommePerdu(code: string): boolean {
        const colis = this.rechercherColis(code);
        if (colis) {
            colis.setEtat(EtatColis.PERDU);
            return true;
        }
        return false;
    }

    public recupererColis(code: string): boolean {
        const colis = this.rechercherColis(code);
        if (colis && colis.getEtat() === EtatColis.ARRIVE) {
            colis.setEtat(EtatColis.RECUPERE);
            return true;
        }
        return false;
    }

    public archiverColis(code: string): boolean {
        const colis = this.rechercherColis(code);
        if (colis) {
            colis.setEtat(EtatColis.ARCHIVE);
            return true;
        }
        return false;
    }

    public abstract calculerFrais(type: string, poids: number): number;

    public sommeTotale(): number {
        let total = 0;
        for (let produit of this.getProduits()) {
            const typeProduit = produit.getProduit().constructor.name.toLowerCase();

            let typeForCalculation = typeProduit;
            if (typeProduit === 'fragile' || typeProduit === 'incassable') {
                typeForCalculation = 'materiel';
            }

            total += this.calculerFrais(typeForCalculation as any, produit.getPoids());
        }
        return total < 10000 ? 10000 : total;
    }
}
