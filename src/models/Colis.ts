import { Produit } from "./Produit";
import { Client } from "./Client";

export enum EtatColis {
    EN_ATTENTE = "EN_ATTENTE",
    EN_COURS = "EN_COURS",
    ARRIVE = "ARRIVE",
    RECUPERE = "RECUPERE",
    PERDU = "PERDU",
    ARCHIVE = "ARCHIVE",
    ANNULE = "ANNULE"
}

export class Colis {
    private produit: Produit;
    private code: string;
    private client: Client;
    private etat: EtatColis;
    private dateCreation: Date;
    private dateArrivee?: Date;
    private retardJours?: number;

    constructor(produit: Produit, code: string, client: Client) {
        this.produit = produit;
        this.code = code;
        this.client = client;
        this.etat = EtatColis.EN_ATTENTE;
        this.dateCreation = new Date();
    }

    public getCode(): string {
        return this.code;
    }

    public getClient(): Client {
        return this.client;
    }

    public getProduit(): Produit {
        return this.produit;
    }

    public getLibelle(): string {
        return this.produit.getLibelle();
    }

    public getPoids(): number {
        return this.produit.getPoids();
    }

    public getEtat(): EtatColis {
        return this.etat;
    }

    public setEtat(etat: EtatColis): void {
        this.etat = etat;
        if (etat === EtatColis.ARRIVE) {
            this.dateArrivee = new Date();
        }
    }

    public getDateCreation(): Date {
        return this.dateCreation;
    }

    public getDateArrivee(): Date | undefined {
        return this.dateArrivee;
    }

    public setRetard(jours: number): void {
        this.retardJours = jours;
    }

    public getRetard(): number | undefined {
        return this.retardJours;
    }

    public getInfoStatut(): string {
        switch (this.etat) {
            case EtatColis.EN_ATTENTE:
                return "Votre colis est en attente de traitement";
            case EtatColis.EN_COURS:
                if (this.retardJours && this.retardJours > 0) {
                    return `En retard de ${this.retardJours} jour(s)`;
                }
                return "Votre colis est en cours de transport";
            case EtatColis.ARRIVE:
                return "Votre colis est arrivé à destination";
            case EtatColis.RECUPERE:
                return "Votre colis a été récupéré";
            case EtatColis.PERDU:
                return "Votre colis a été déclaré perdu";
            case EtatColis.ARCHIVE:
                return "Votre colis a été archivé";
            case EtatColis.ANNULE:
                return "Votre colis a été annulé";
            default:
                return "Statut inconnu";
        }
    }
}
