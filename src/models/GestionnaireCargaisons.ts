import { Cargaison, EtatCargaison, Coordonnee } from './Cargaison';
import { Colis, EtatColis } from './Colis';
import { Maritime } from './Maritime';
import { Aerienne } from './Aerienne';
import { Routiere } from './Routiere';

export interface CritereRecherche {
    code?: string;
    lieuDepart?: string;
    lieuArrivee?: string;
    dateDepart?: Date;
    dateArrivee?: Date;
    type?: string;
}

export class GestionnaireCargaisons {
    private cargaisons: Map<string, Cargaison> = new Map();
    private colis: Map<string, Colis> = new Map();

    @clientRestricted("Les clients ne peuvent pas créer de cargaisons")
    @auditLog("Création de cargaison")
    public creerCargaison(
        type: 'maritime' | 'aerienne' | 'routiere',
        produitInitial: Colis,
        distance: number,
        lieuDepart: Coordonnee,
        lieuArrivee: Coordonnee
    ): Cargaison {
        let cargaison: Cargaison;

        switch (type) {
            case 'maritime':
                cargaison = new Maritime(produitInitial, distance, lieuDepart, lieuArrivee);
                break;
            case 'aerienne':
                cargaison = new Aerienne(produitInitial, distance, lieuDepart, lieuArrivee);
                break;
            case 'routiere':
                cargaison = new Routiere(produitInitial, distance, lieuDepart, lieuArrivee);
                break;
            default:
                throw new Error('Type de cargaison non reconnu');
        }

        this.cargaisons.set(cargaison.getNumero(), cargaison);
        this.colis.set(produitInitial.getCode(), produitInitial);

        return cargaison;
    }

    @requireRole('gestionnaire', "Seuls les gestionnaires peuvent ajouter des colis aux cargaisons")
    @auditLog("Ajout de colis à une cargaison")
    public ajouterColisACargaison(numeroCargaison: string, colis: Colis): void {
        const cargaison = this.cargaisons.get(numeroCargaison);
        if (!cargaison) {
            throw new Error('Cargaison non trouvée');
        }

        cargaison.ajouterProduit(colis);
        this.colis.set(colis.getCode(), colis);
    }

    public rechercherColis(code: string): Colis | null {
        return this.colis.get(code) || null;
    }

    public rechercherCargaisonParCode(code: string): Cargaison | null {
        return this.cargaisons.get(code) || null;
    }

    public rechercherCargaisons(criteres: CritereRecherche): Cargaison[] {
        const resultats: Cargaison[] = [];

        for (const cargaison of this.cargaisons.values()) {
            let correspond = true;

            if (criteres.code && cargaison.getNumero() !== criteres.code) {
                correspond = false;
            }

            if (criteres.lieuDepart && !cargaison.getLieuDepart().ville.toLowerCase().includes(criteres.lieuDepart.toLowerCase())) {
                correspond = false;
            }

            if (criteres.lieuArrivee && !cargaison.getLieuArrivee().ville.toLowerCase().includes(criteres.lieuArrivee.toLowerCase())) {
                correspond = false;
            }

            if (criteres.type && cargaison.getType() !== criteres.type.toLowerCase()) {
                correspond = false;
            }

            if (criteres.dateDepart && cargaison.getDateDepart()) {
                const dateCargaison = cargaison.getDateDepart()!.toDateString();
                const dateRecherche = criteres.dateDepart.toDateString();
                if (dateCargaison !== dateRecherche) {
                    correspond = false;
                }
            }

            if (criteres.dateArrivee && cargaison.getDateArrivee()) {
                const dateCargaison = cargaison.getDateArrivee()!.toDateString();
                const dateRecherche = criteres.dateArrivee.toDateString();
                if (dateCargaison !== dateRecherche) {
                    correspond = false;
                }
            }

            if (correspond) {
                resultats.push(cargaison);
            }
        }

        return resultats;
    }

    public fermerCargaison(numeroCargaison: string): void {
        const cargaison = this.cargaisons.get(numeroCargaison);
        if (!cargaison) {
            throw new Error('Cargaison non trouvée');
        }
        cargaison.fermerCargaison();
    }

    public rouvrirCargaison(numeroCargaison: string): void {
        const cargaison = this.cargaisons.get(numeroCargaison);
        if (!cargaison) {
            throw new Error('Cargaison non trouvée');
        }
        cargaison.rouvrirCargaison();
    }

    public recupererColis(codeColis: string): boolean {
        const colis = this.colis.get(codeColis);
        if (!colis) {
            return false;
        }

        for (const cargaison of this.cargaisons.values()) {
            if (cargaison.recupererColis(codeColis)) {
                return true;
            }
        }
        return false;
    }

    @isAdmin("Seuls les administrateurs peuvent marquer un colis comme perdu")
    @auditLog("Marquage d'un colis comme perdu")
    public marquerColisCommePerdu(codeColis: string): boolean {
        const colis = this.colis.get(codeColis);
        if (!colis) {
            return false;
        }

        for (const cargaison of this.cargaisons.values()) {
            if (cargaison.marquerColisCommePerdu(codeColis)) {
                return true;
            }
        }
        return false;
    }

    @requirePermission('archive_management', "Permission d'archivage requise")
    @auditLog("Archivage d'un colis")
    public archiverColis(codeColis: string): boolean {
        const colis = this.colis.get(codeColis);
        if (!colis) {
            return false;
        }

        for (const cargaison of this.cargaisons.values()) {
            if (cargaison.archiverColis(codeColis)) {
                return true;
            }
        }
        return false;
    }

    public annulerColis(codeColis: string): boolean {
        const colis = this.colis.get(codeColis);
        if (!colis || colis.getEtat() !== EtatColis.EN_ATTENTE) {
            return false;
        }

        for (const cargaison of this.cargaisons.values()) {
            const colisInCargaison = cargaison.rechercherColis(codeColis);
            if (colisInCargaison && cargaison.estOuverte()) {
                colis.setEtat(EtatColis.ANNULE);
                return true;
            }
        }
        return false;
    }

    @requireRole('gestionnaire', "Seuls les gestionnaires peuvent changer l'état des colis")
    @auditLog("Modification de l'état d'un colis")
    public changerEtatColis(codeColis: string, nouvelEtat: EtatColis): boolean {
        const colis = this.colis.get(codeColis);
        if (!colis) {
            return false;
        }

        colis.setEtat(nouvelEtat);
        return true;
    }

    @isAdmin("Seuls les administrateurs peuvent lancer l'archivage automatique")
    @auditLog("Archivage automatique des colis")
    public archiverColisAutomatiquement(): void {
        const maintenant = new Date();
        const delaiArchivage = 30 * 24 * 60 * 60 * 1000;

        for (const colis of this.colis.values()) {
            if (colis.getEtat() === EtatColis.ARRIVE && colis.getDateArrivee()) {
                const tempsEcoule = maintenant.getTime() - colis.getDateArrivee()!.getTime();
                if (tempsEcoule > delaiArchivage) {
                    colis.setEtat(EtatColis.ARCHIVE);
                }
            }
        }
    }

    @clientRestricted("Les clients ne peuvent pas accéder à toutes les cargaisons")
    public getToutesCargaisons(): Cargaison[] {
        return Array.from(this.cargaisons.values());
    }

    @clientRestricted("Les clients ne peuvent pas accéder à tous les colis")
    public getTousColis(): Colis[] {
        return Array.from(this.colis.values());
    }

    public genererRecu(codeColis: string): string | null {
        const colis = this.colis.get(codeColis);
        if (!colis) {
            return null;
        }

        const client = colis.getClient();
        let cargaison: Cargaison | null = null;

        for (const c of this.cargaisons.values()) {
            if (c.rechercherColis(codeColis)) {
                cargaison = c;
                break;
            }
        }

        if (!cargaison) {
            return null;
        }

        return `
=== REÇU DE COLIS ===
Code du colis: ${colis.getCode()}
Date: ${new Date().toLocaleDateString()}

EXPÉDITEUR:
${client.getNomComplet()}
${client.getAdresse()}
Tél: ${client.getTelephone()}
${client.getEmail() ? `Email: ${client.getEmail()}` : ''}

COLIS:
Libellé: ${colis.getLibelle()}
Poids: ${colis.getPoids()} kg
État: ${colis.getInfoStatut()}

CARGAISON:
Numéro: ${cargaison.getNumero()}
Type: ${cargaison.getType()}
Départ: ${cargaison.getLieuDepart().ville}
Arrivée: ${cargaison.getLieuArrivee().ville}
Distance: ${cargaison.getDistance()} km

TARIFICATION:
Total à payer: ${cargaison.sommeTotale()} FCFA

=== FIN DU REÇU ===
        `;
    }
}
