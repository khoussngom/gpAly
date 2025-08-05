import { Chimique } from './models/Chimique';
import { Alimentaire } from './models/Alimentaire';
import { Fragile } from './models/Fragile';
import { Incassable } from './models/Incassable';
import { Maritime } from './models/Maritime';
const produit1 = new Chimique("Acide chlorhydrique", 3.5, 9);

console.log(produit1.info());



const produit = new Chimique("Acide", 10, 5);
const cargaison = new Maritime(produit1, 1000); // Distance de 1000 km par exemple

console.log("Frais pour produit :", cargaison.calculerFrais("chimique", 10));

let a = new Chimique("Soude", 5, 2)
console.log(a.info());
cargaison.ajouterProduit(a);

let b = new Alimentaire("thiep", 50);
console.log(b.info());
cargaison.ajouterProduit(b);

console.log("Total de la cargaison:", cargaison.sommeTotale());


