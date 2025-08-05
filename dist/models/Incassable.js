"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Incassable = void 0;
const Materiel_1 = require("./Materiel");
class Incassable extends Materiel_1.Materiel {
    constructor(libelle, poids) {
        super(libelle, poids);
        this.type = 'incassable';
    }
}
exports.Incassable = Incassable;
