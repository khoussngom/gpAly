import { Materiel } from './Materiel';

export class Incassable extends Materiel {

    constructor(libelle:string,poids:number)
    {
        super(libelle,poids)
        this.type = 'incassable';
    }

}
