import { Colis, EtatColis } from './Colis';

export enum EtatCargaison {
    EN_ATTENTE = "EN_ATTENTE",
    EN_COURS = "EN_COURS",
    ARRIVE = "ARRIVE",
    TERMINE = "TERMINE"
}

export enum TypeCargaison {
    ROUTIERE = "routiere",
    MARITIME = "maritime",
    AERIENNE = "aerienne"
}

export interface Coordonnee {
    latitude: number;
    longitude: number;
    ville: string;
}

export interface FraisTransport {
    alimentaire: { routiere: number; maritime: number; aerienne: number; autresFrais: number };
    chimique: { routiere: number; maritime: number; aerienne: number; autresFrais: number };
    materiel: { routiere: number; maritime: number; aerienne: number; autresFrais: number };
}

export const FRAIS_TRANSPORT: FraisTransport = {
    alimentaire: { routiere: 100, maritime: 90, aerienne: 300, autresFrais: 5000 },
    chimique: { routiere: 0, maritime: 500, aerienne: 0, autresFrais: 10000 },
    materiel: { routiere: 200, maritime: 400, aerienne: 1000, autresFrais: 0 }
};

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
        return 'CARG-' + Date.now().toString();
    }

    public ajouterColis(colis: Colis): boolean {
        if (this.estFermee) {
            console.warn('Cannot add colis to closed cargaison');
            return false;
        }

        const poidsTotal = this.produits.reduce((total, c) => total + c.getPoids(), 0);
        const nouveauPoids = poidsTotal + colis.getPoids();

        if (nouveauPoids > this.poidsMax) {
            console.warn(`Capacité dépassée. Poids actuel: ${poidsTotal}kg, tentative d'ajout: ${colis.getPoids()}kg, capacité max: ${this.poidsMax}kg`);
            return false;
        }

        const produitToCheck = colis.getProduit();
        if (!this.verifierCompatibiliteProduit(produitToCheck)) {
            const typeProduit = produitToCheck.constructor.name.toLowerCase();
            console.warn(`Produit ${typeProduit} incompatible avec le transport ${this.type}`);
            return false;
        }

        this.produits.push(colis);
        
        const produit = colis.getProduit();
        const typeProduit = produit.constructor.name.toLowerCase();
        const frais = this.calculerFrais(typeProduit, produit.getPoids());
        
        console.log(`Produit ajouté : ${produit.getLibelle()} - ${produit.getPoids()}kg - Frais: ${frais} FCFA`);
        console.log(`Total frais pour ce colis : ${frais} FCFA`);
        console.log(`Poids total cargaison : ${nouveauPoids}kg / ${this.poidsMax}kg`);
        
        return true;
    }

    private verifierCompatibiliteProduit(produit: any): boolean {
        const typeProduit = produit.constructor.name.toLowerCase();
        const typeTransport = this.type;

        if (typeProduit === 'chimique' && typeTransport !== 'maritime') {
            return false;
        }
        
        if (typeProduit === 'fragile' && typeTransport === 'maritime') {
            return false;
        }

        return true;
    }

    private getTypeCargaison(): TypeCargaison {
        const type = this.constructor.name.toLowerCase();
        switch(type) {
            case 'maritime': return TypeCargaison.MARITIME;
            case 'aerienne': return TypeCargaison.AERIENNE;
            case 'routiere': return TypeCargaison.ROUTIERE;
            default: return TypeCargaison.ROUTIERE;
        }
    }

    private calculerFrais(typeProduit: string, poids: number): number {
        const typeTransport = this.getTypeCargaison();
        
        let typeForCalculation = typeProduit;
        if (typeProduit === 'fragile' || typeProduit === 'incassable') {
            typeForCalculation = 'materiel';
        }
        const fraisType = FRAIS_TRANSPORT[typeForCalculation as keyof FraisTransport];
        if (!fraisType) return 0;
        
        const fraisParKg = fraisType[typeTransport as keyof typeof fraisType] || 0;
        return fraisParKg * poids;
    }

    public calculerMontantTotal(): number {
        let montantTotal = 0;
        for (const colis of this.produits) {
            const produit = colis.getProduit();
            const typeProduit = produit.constructor.name.toLowerCase();
            const frais = this.calculerFrais(typeProduit, produit.getPoids());
            montantTotal += frais;
        }
        return montantTotal;
    }

    public fermerCargaison(): void {
        this.estFermee = true;
        this.etatAvancement = EtatCargaison.EN_COURS;
        this.dateDepart = new Date();
        
        const montantTotal = this.calculerMontantTotal();
        console.log(`Cargaison ${this.numero} fermée. Montant total: ${montantTotal} FCFA`);
    }

    public obtenirRecapitulatif(): any {
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

    public getNumero(): string { return this.numero; }
    public getProduits(): Colis[] { return this.produits; }
    public getDistance(): number { return this.distance; }
    public getEstFermee(): boolean { return this.estFermee; }
    public getPoidsMax(): number { return this.poidsMax; }
    public getLieuDepart(): Coordonnee { return this.lieuDepart; }
    public getLieuArrivee(): Coordonnee { return this.lieuArrivee; }
    public getEtatAvancement(): EtatCargaison { return this.etatAvancement; }
    public getDateDepart(): Date | undefined { return this.dateDepart; }
    public getDateArrivee(): Date | undefined { return this.dateArrivee; }

    public setEtatAvancement(etat: EtatCargaison): void { this.etatAvancement = etat; }
    public setDateArrivee(date: Date): void { this.dateArrivee = date; }

    public abstract calculerDureeEstimee(): number;
    public abstract obtenirSpecificites(): string[];
}
