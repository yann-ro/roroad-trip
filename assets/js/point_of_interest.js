import { generatePolaroidHTML } from './journey.js';

function getLangText(field, lang = 'fr') {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
        return field[lang] || field['fr'] || Object.values(field)[0] || '';
    }
    return '';
}

export class POIManager {
    constructor(map) {
        this.map = map;
        this.poisData = [];
        this.currentLang = localStorage.getItem('user-lang') || 'fr';
        this.layer = L.layerGroup().addTo(this.map);

        window.addEventListener('languageChanged', (e) => {
            this.setLanguage(e.detail?.lang || localStorage.getItem('user-lang') || 'fr');
        });
    }

    setLanguage(lang) {
        this.currentLang = lang;
        this.render();
    }

    async load(urls) {
        try {
            const urlList = Array.isArray(urls) ? urls : [urls];

            const responses = await Promise.all(urlList.map(url => fetch(url)));
            const dataArrays = await Promise.all(responses.map(res => res.json()));

            this.poisData = dataArrays.flat();

            this.render();
        } catch (error) {
            console.error("Erreur chargement POI:", error);
        }
    }

    render() {
        this.layer.clearLayers();
        this.poisData.forEach(poi => {
            this._addContinuousPOI(poi);
        });
    }

    _addContinuousPOI(poi) {
        const icon = L.divIcon({
            className: 'poi-custom-icon',
            html: `<span class="material-icons" style="color: green; font-size: 10px;">${poi.icon || 'place'}</span>`,
            iconSize: null,
            iconAnchor: null,
            zIndexOffset: 0,
        });

        const translatedName = getLangText(poi.name, this.currentLang);
        const translatedDescription = getLangText(poi.description, this.currentLang);

        const poiTitle = `
            <span class="material-icons" style="font-size: 16px; color: #2d3436; margin-right: 4px;">
                ${poi.icon || 'place'}
            </span>
            ${translatedName}
        `;

        const popupContent = generatePolaroidHTML(
            poi.image,
            poiTitle,
            translatedDescription,
            '',
            poi.link,
            this.currentLang
        );

        [0, 360, -360].forEach(offset => {
            const marker = L.marker([poi.coords[0], poi.coords[1] + offset], { icon })
                .bindPopup(popupContent, {
                    maxWidth: 250,
                    className: 'custom-poi-popup',
                })
                .addTo(this.layer);

            marker.on('mouseover', function () {
                this.openPopup();
            });

            marker.on('click', function () {
                this.openPopup();
            });
        });
    }
}