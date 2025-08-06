import { Produit } from './Produit';

export abstract class Cargaison {
    protected produits: Produit[] = [];
    protected distance: number;

    constructor(produitInitial: Produit, distance: number) {
        this.produits.push(produitInitial);
        this.distance = distance;
    }

    public getProduits(): Produit[] {
        return this.produits;
    }

    public getDistance(): number {
        return this.distance;
    }

    public setDistance(distance: number): void {
        this.distance = distance;
    }

public ajouterProduit(produit: Produit): void {
    if (this.produits.length >= 10) {
        throw new Error("La cargaison est pleine (max 10 produits)");
    }

    this.produits.push(produit);

    const typeProduit = produit.constructor.name.toLowerCase();
    
    // Convertir les types de matériel en 'materiel' pour le calcul des frais
    let typeForCalculation = typeProduit;
    if (typeProduit === 'fragile' || typeProduit === 'incassable') {
        typeForCalculation = 'materiel';
    }
    
    const frais = this.calculerFrais(typeForCalculation, produit.getPoids());

    console.log(` Produit ajouté : ${produit.getLibelle()} - ${produit.getPoids()}kg`);
    console.log(` Frais pour ce produit : ${frais} FCFA`);
}



    public nbProduit(): number {
        return this.produits.length;
    }

    public abstract calculerFrais(type:string,poids:number): number;


    public sommeTotale(): number {
        let total = 0;
        for (let produit of this.getProduits()) {
            const typeProduit = produit.constructor.name.toLowerCase();
            
            let typeForCalculation = typeProduit;
            if (typeProduit === 'fragile' || typeProduit === 'incassable') {
                typeForCalculation = 'materiel';
            }
            
            total += this.calculerFrais(typeForCalculation as any, produit.getPoids());
        }
        return total;
    }
}
