import { Materiel } from './Materiel';

export class Fragile extends Materiel {
        constructor(libelle:string,poids:number)
    {
        super(libelle,poids)
        this.type = 'fragile';
    }
}
