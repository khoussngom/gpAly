import './styles.css';
import { AppManager } from './ui/AppManager';

// Rendre AppManager accessible globalement
declare global {
    interface Window {
        appManager: AppManager;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');
    if (appElement) {
        const app = new AppManager();
        window.appManager = app; // Rendre accessible globalement
        app.init();
    } else {
        console.error('Élément #app introuvable');
    }
});
