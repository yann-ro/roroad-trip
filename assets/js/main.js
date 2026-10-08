import { JourneyManager } from './journey.js';
import { BackgroundMap } from './map.js';
import { POIManager } from './point_of_interest.js';
import { GpxManager } from './gpx.js';

const myMap = new BackgroundMap("map");

const poiManager = new POIManager(myMap.map);
poiManager.load([
    "assets/json/point_of_interest/transat-aller.json",
    "assets/json/point_of_interest/mexique.json",
    "assets/json/point_of_interest/guatemala.json",
    "assets/json/point_of_interest/salvador.json",
    "assets/json/point_of_interest/nicaragua.json",
    "assets/json/point_of_interest/costa-rica.json",
    "assets/json/point_of_interest/panama.json",
    "assets/json/point_of_interest/colombie.json",
    "assets/json/point_of_interest/equateur.json",
    "assets/json/point_of_interest/peru.json",
]);

const journey = new JourneyManager(myMap.map);
journey.load([
    "assets/json/journey/transat-aller.json",
    "assets/json/journey/mexique.json",
    "assets/json/journey/guatemala.json",
    "assets/json/journey/salvador.json",
    "assets/json/journey/nicaragua.json",
    "assets/json/journey/costa-rica.json",
    "assets/json/journey/panama.json",
    "assets/json/journey/colombie.json",
    "assets/json/journey/equateur.json",
    "assets/json/journey/peru.json",
]);

const myTrek = new GpxManager(myMap.map);
myTrek.load([
    'assets/gpx/trek/santa-maria.gpx',
    'assets/gpx/trek/mirador-santa-maria.gpx',
    'assets/gpx/trek/fuego.gpx',
    'assets/gpx/trek/telica.gpx',
    'assets/gpx/trek/cocuy.gpx',
    'assets/gpx/trek/nevados.gpx',
    'assets/gpx/trek/integral-pichincha.gpx',
    'assets/gpx/trek/imbabura.gpx',
    'assets/gpx/trek/angureal.gpx',
    'assets/gpx/trek/iliniza-norte.gpx',
    'assets/gpx/trek/cajeras.gpx',
],);

const myPara = new GpxManager(myMap.map);
myPara.load(
    [
        'assets/gpx/para/bucaramanga.gpx',
        'assets/gpx/para/chicamocha.gpx',
    ],
    {
        color: '#f029df',
        weight: 4
    },
);

const myKite = new GpxManager(myMap.map);
myKite.load(
    [
        'assets/gpx/kite/isla-blanca.gpx',
        'assets/gpx/kite/ikarus.gpx',
        'assets/gpx/kite/mancora.gpx',
        'assets/gpx/kite/mancora-upwind.gpx',
    ],
    {
        color: '#29dff0',
        weight: 4
    },
);


document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    const currentFlag = document.getElementById('current-flag');

    const flags = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸' };

    // Toggle menu
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        langDropdown.classList.remove('show');
    });

    // Sélection de langue
    langDropdown.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', () => {
            const selectedLang = item.getAttribute('data-lang');

            // 1. Mettre à jour le drapeau
            currentFlag.textContent = flags[selectedLang];

            // 2. Sauvegarder dans le localStorage
            localStorage.setItem('user-lang', selectedLang);

            // 3. ÉMETTRE L'ÉVÉNEMENT POUR AVERTIR LE JOURNEY MANAGER
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { lang: selectedLang }
            }));

            langDropdown.classList.remove('show');
        });
    });
});