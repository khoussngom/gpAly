import './styles.css';
import { AppManager } from './ui/AppManager';

declare global {
    interface Window {
        appManager: AppManager;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');
    if (appElement) {
        const app = new AppManager();
        window.appManager = app;
        app.init();
    } else {
        console.error('Élément #app introuvable');
    }
});
