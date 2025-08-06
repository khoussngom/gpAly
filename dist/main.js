"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./styles.css");
const AppManager_1 = require("./ui/AppManager");
document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');
    if (appElement) {
        const app = new AppManager_1.AppManager(appElement);
        app.init();
    }
    else {
        console.error('Élément #app introuvable');
    }
});
