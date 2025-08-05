export abstract class Produit
{
    protected libelle : string;
    protected poids : number;

    constructor(libelle:string,poids:number)
    {
        this.libelle = libelle;
        this.poids  = poids;
    }

    public getLibelle(): string {
        return this.libelle;
    }

    public getPoids(): number {
        return this.poids;
    }

    public setLibelle(libelle: string): void {
        this.libelle = libelle;
    }

    public setPoids(poids: number): void {
        this.poids = poids;
    }

    public info(): string[] {
        return [
            `Libellé : ${this.getLibelle()}`,
            `Poids : ${this.getPoids()} kg`
        ];
    }

}