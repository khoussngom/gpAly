import './styles.css';
import { AppManager } from './ui/AppManager';
import { DetailsManager } from './ui/DetailsManager';

declare global {
    interface Window {
        appManager: AppManager;
        detailsManager: DetailsManager;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');
    if (appElement) {
        const app = new AppManager();
        const detailsManager = new DetailsManager();
        window.appManager = app;
        window.detailsManager = detailsManager;
        app.init();
    } else {
        console.error('Élément #app introuvable');
    }
});
