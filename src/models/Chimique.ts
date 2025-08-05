import { Produit } from './Produit';


export class Chimique extends Produit
{
    private degreDeToxicite : number;

    constructor(libelle:string,poids:number,degres:number)
    {
        super(libelle,poids);
        this.degreDeToxicite = degres;
        
    }


    public getDegreDeToxicite(): number {
        return this.degreDeToxicite;
    }

    public setDegreDeToxicite(degreDeToxicite: number): void {
        this.degreDeToxicite = degreDeToxicite;
    }

    public override info(): string[] {
        return [
            ...super.info(),
            `Toxicité : ${this.getDegreDeToxicite()}`
        ];
    }
}