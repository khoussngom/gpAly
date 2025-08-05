"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fragile = void 0;
const Materiel_1 = require("./Materiel");
class Fragile extends Materiel_1.Materiel {
    constructor(libelle, poids) {
        super(libelle, poids);
        this.type = 'fragile';
    }
}
exports.Fragile = Fragile;
