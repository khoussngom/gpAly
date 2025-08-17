"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./styles.css");
const AppManager_1 = require("./ui/AppManager");
const DetailsManager_1 = require("./ui/DetailsManager");
document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');
    if (appElement) {
        const app = new AppManager_1.AppManager();
        const detailsManager = new DetailsManager_1.DetailsManager();
        window.appManager = app;
        window.detailsManager = detailsManager;
        app.init();
    }
    else {
        console.error('Élément #app introuvable');
    }
});
