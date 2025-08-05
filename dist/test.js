"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Chimique_1 = require("./models/Chimique");
const Alimentaire_1 = require("./models/Alimentaire");
const Maritime_1 = require("./models/Maritime");
const produit1 = new Chimique_1.Chimique("Acide chlorhydrique", 3.5, 9);
console.log(produit1.info());
const produit = new Chimique_1.Chimique("Acide", 10, 5);
const cargaison = new Maritime_1.Maritime(produit1, 1000); // Distance de 1000 km par exemple
console.log("Frais pour produit :", cargaison.calculerFrais("chimique", 10));
let a = new Chimique_1.Chimique("Soude", 5, 2);
console.log(a.info());
cargaison.ajouterProduit(a);
let b = new Alimentaire_1.Alimentaire("thiep", 50);
console.log(b.info());
cargaison.ajouterProduit(b);
console.log("Total de la cargaison:", cargaison.sommeTotale());
