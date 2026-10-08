import { generatePolaroidHTML } from './journey.js';

export class POIManager {
    constructor(map) {
        this.map = map;
        this.layer = L.layerGroup().addTo(this.map);
    }

    async load(urls) {
        try {
            const urlList = Array.isArray(urls) ? urls : [urls];

            const responses = await Promise.all(urlList.map(url => fetch(url)));
            const dataArrays = await Promise.all(responses.map(res => res.json()));

            const pois = dataArrays.flat();

            this.render(pois);
        } catch (error) {
            console.error("Erreur chargement POI:", error);
        }
    }

    render(pois) {
        this.layer.clearLayers();
        pois.forEach(poi => {
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

        const imageHtml = poi.image
            ? `<img src="${poi.image}" class="poi-popup-image" />`
            : '';

        const poiTitle = `
            <span class="material-icons" style="font-size: 16px; color: #2d3436; margin-right: 4px;">
                ${poi.icon || 'place'}
            </span>
            ${poi.name}
        `;

        const popupContent = generatePolaroidHTML(
            poi.image,
            poiTitle,
            poi.description,
            '',
            poi.link
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