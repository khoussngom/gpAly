import './styles.css';
import { AppManager } from './ui/AppManager';


document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');
    if (appElement) {
        const app = new AppManager(appElement);
        app.init();
    } else {
        console.error('Élément #app introuvable');
    }
});
