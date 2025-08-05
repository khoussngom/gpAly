import './styles.css';
import { AppManager } from './ui/AppManager';

// Point d'entrée de l'application
document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');
    if (appElement) {
        const app = new AppManager(appElement);
        app.init();
    } else {
        console.error('Élément #app introuvable');
    }
});
