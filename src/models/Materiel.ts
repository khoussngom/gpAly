import { Produit } from './Produit';

export abstract class Materiel extends Produit
{
    protected type : string ;


    constructor(libelle:string,poids:number)
    {
        super(libelle,poids);
        this.type = '';
    }


    public getType(): string {
        return this.type;
    }

    public setType(type: string): void {
        this.type = type;
    }
}