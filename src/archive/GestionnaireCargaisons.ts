// TODO: Reconnecter ces imports une fois les modèles créés
// import { Cargaison, EtatCargaison, Coordonnee } from './Cargaison';
// import { Colis, EtatColis } from './Colis';
// import { Maritime } from './Maritime';
// import { Aerienne } from './Aerienne';
// import { Routiere } from './Routiere';
// import { Client } from './Client';

// Types temporaires pour la compilation
type Cargaison = any;
type EtatCargaison = any;
type Coordonnee = any;
type Colis = any;
type EtatColis = any;
type Maritime = any;
type Aerienne = any;
type Routiere = any;
type Client = any;

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

    public obtenirToutesCargaisons(): Cargaison[] {
        return Array.from(this.cargaisons.values());
    }

    public obtenirTousLesColis(): Colis[] {
        return Array.from(this.colis.values());
    }

    public changerEtatColis(code: string, nouvelEtat: EtatColis): boolean {
        const colis = this.colis.get(code);
        if (!colis) {
            return false;
        }
        colis.setEtat(nouvelEtat);
        return true;
    }

    public obtenirDetailsCargaison(numero: string): string {
        const cargaison = this.cargaisons.get(numero);
        if (!cargaison) {
            return 'Cargaison non trouvée';
        }

        let details = `=== DÉTAILS DE LA CARGAISON ${numero} ===\n`;
        details += `Type: ${cargaison.getType().toUpperCase()}\n`;
        details += `État: ${cargaison.getEtatAvancement()}\n`;
        details += `Lieu de départ: ${cargaison.getLieuDepart().ville}\n`;
        details += `Lieu d'arrivée: ${cargaison.getLieuArrivee().ville}\n`;
        details += `Distance: ${cargaison.getDistance()} km\n`;
        details += `Poids total: ${cargaison.getPoidsTotal()} kg\n`;
        details += `Nombre de colis: ${cargaison.nbProduit()}\n`;
        details += `Coût total: ${cargaison.sommeTotale()} FCFA\n`;
        
        if (cargaison.getDateDepart()) {
            details += `Date de départ: ${cargaison.getDateDepart()!.toLocaleDateString()}\n`;
        }
        
        if (cargaison.getDateArrivee()) {
            details += `Date d'arrivée: ${cargaison.getDateArrivee()!.toLocaleDateString()}\n`;
        }

        details += '\n=== COLIS ===\n';
        const produits = cargaison.getProduits();
        if (produits.length === 0) {
            details += 'Aucun colis dans cette cargaison\n';
        } else {
            produits.forEach((colis, index) => {
                details += `${index + 1}. ${colis.getCode()} - ${colis.getLibelle()}\n`;
                details += `   Poids: ${colis.getPoids()} kg\n`;
                details += `   État: ${colis.getInfoStatut()}\n`;
                details += `   Client: ${colis.getClient().getNomComplet()}\n\n`;
            });
        }

        return details;
    }

    public obtenirDetailsColis(code: string): string {
        const colis = this.colis.get(code);
        if (!colis) {
            return 'Colis non trouvé';
        }

        let details = `=== DÉTAILS DU COLIS ${code} ===\n`;
        details += `Libellé: ${colis.getLibelle()}\n`;
        details += `Poids: ${colis.getPoids()} kg\n`;
        details += `État: ${colis.getInfoStatut()}\n`;
        
        const client = colis.getClient();
        details += '\n=== CLIENT ===\n';
        details += `Nom: ${client.getNomComplet()}\n`;
        details += `Adresse: ${client.getAdresse()}\n`;
        details += `Téléphone: ${client.getTelephone()}\n`;
        if (client.getEmail()) {
            details += `Email: ${client.getEmail()}\n`;
        }

        for (const cargaison of this.cargaisons.values()) {
            if (cargaison.getProduits().some(p => p.getCode() === code)) {
                details += '\n=== CARGAISON ===\n';
                details += `Numéro: ${cargaison.getNumero()}\n`;
                details += `Type: ${cargaison.getType().toUpperCase()}\n`;
                details += `De: ${cargaison.getLieuDepart().ville}\n`;
                details += `Vers: ${cargaison.getLieuArrivee().ville}\n`;
                break;
            }
        }

        return details;
    }

    public modifierColis(code: string, nouvellesInfos: Partial<{
        libelle: string;
        poids: number;
    }>): void {
        const colis = this.colis.get(code);
        if (!colis) {
            throw new Error('Colis non trouvé');
        }

        if (nouvellesInfos.libelle !== undefined) {
            (colis as any).produit.libelle = nouvellesInfos.libelle;
        }
        if (nouvellesInfos.poids !== undefined) {
            (colis as any).produit.poids = nouvellesInfos.poids;
        }
    }

    public supprimerColis(code: string): void {
        const colis = this.colis.get(code);
        if (!colis) {
            throw new Error('Colis non trouvé');
        }

        for (const cargaison of this.cargaisons.values()) {
            const produits = cargaison.getProduits();
            const index = produits.findIndex(p => p.getCode() === code);
            if (index !== -1) {
                produits.splice(index, 1);
                break;
            }
        }

        this.colis.delete(code);
    }

    public supprimerCargaison(numero: string): void {
        const cargaison = this.cargaisons.get(numero);
        if (!cargaison) {
            throw new Error('Cargaison non trouvée');
        }

        const produits = cargaison.getProduits();
        produits.forEach(colis => {
            this.colis.delete(colis.getCode());
        });

        this.cargaisons.delete(numero);
    }

    public genererRecu(codeColis: string): string {
        const colis = this.colis.get(codeColis);
        if (!colis) {
            return 'Colis non trouvé';
        }

        const client = colis.getClient();
        
        let cargaison: Cargaison | null = null;
        for (const c of this.cargaisons.values()) {
            if (c.getProduits().some(p => p.getCode() === codeColis)) {
                cargaison = c;
                break;
            }
        }

        if (!cargaison) {
            return 'Cargaison non trouvée pour ce colis';
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

    public getToutesCargaisons(): Cargaison[] {
        return this.obtenirToutesCargaisons();
    }

    public getTousColis(): Colis[] {
        return this.obtenirTousLesColis();
    }
}
