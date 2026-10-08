const TRANSPORT_ICONS = {
    walk: "directions_walk",
    bus: "directions_bus",
    train: "train",
    car: "directions_car",
    ferry: "directions_boat",
    voilier: "sailing",
    avion: "flight",
    autostop: "thumb_up",
    moto: "motorcycle"
};

// Translations for UI elements
const UI_TRANSLATIONS = {
    fr: {
        totalDistance: "Distance Totale",
        moreDetails: "Plus de détails..",
        transport: {
            walk: "À pied",
            bus: "Bus",
            train: "Train",
            car: "Voiture",
            ferry: "Ferry",
            voilier: "Voilier",
            avion: "Avion",
            autostop: "Autostop",
            moto: "Moto"
        }
    },
    en: {
        totalDistance: "Total Distance",
        moreDetails: "More details..",
        transport: {
            walk: "Walking",
            bus: "Bus",
            train: "Train",
            car: "Car",
            ferry: "Ferry",
            voilier: "Sailboat",
            avion: "Flight",
            autostop: "Hitchhiking",
            moto: "Motorcycle"
        }
    },
    es: {
        totalDistance: "Distancia Total",
        moreDetails: "Más detalles..",
        transport: {
            walk: "A pie",
            bus: "Autobús",
            train: "Tren",
            car: "Coche",
            ferry: "Ferry",
            voilier: "Velero",
            avion: "Avión",
            autostop: "Autostop",
            moto: "Moto"
        }
    }
};

/**
 * Helper to safely extract text based on selected language
 */
function getLangText(field, lang = 'fr') {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
        return field[lang] || field['fr'] || Object.values(field)[0] || '';
    }
    return '';
}

export class JourneyManager {
    constructor(map) {
        this.map = map;
        this.journeyData = [];
        this.currentLang = localStorage.getItem('user-lang') || 'fr';

        this.layers = {
            paths: L.layerGroup().addTo(this.map),
            markers: L.layerGroup().addTo(this.map),
            icons: L.layerGroup().addTo(this.map)
        };

        // Create custom Leaflet control at top right
        this.statsControl = L.control({ position: 'topright' });

        this.statsControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'journey-stats-card');
            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.disableScrollPropagation(div);
            return div;
        };

        this.statsControl.addTo(this.map);

        // Listen for language change events dispatched by the language selector
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

            this.journeyData = dataArrays.flat();

            this.render();
        } catch (error) {
            console.error("Error loading the journey data:", error);
        }
    }

    render() {
        this._clearLayers();
        this._drawPaths();
        this._drawStops();
        this._updateStatsCard();
    }

    _clearLayers() {
        Object.values(this.layers).forEach(layer => layer.clearLayers());
    }

    _drawPaths() {
        const styles = {
            done: { color: "white", opacity: 0.8, weight: 2, dashArray: "6,6" },
        };

        const doneCoords = this.journeyData.map(p => p.coords);
        if (doneCoords.length >= 2) {
            this._drawGeodesicTriple(doneCoords, styles.done);
        }
    }

    _drawGeodesicTriple(coords, style) {
        [0, 360, -360].forEach(offset => {
            const shiftedCoords = coords.map(c => [c[0], c[1] + offset]);

            L.geodesic(shiftedCoords, {
                weight: style.weight,
                color: style.color,
                opacity: style.opacity,
                dashArray: style.dashArray,
                lineCap: 'round',
                steps: 50,
                wrap: false
            }).addTo(this.layers.paths);
        });
    }

    _drawStops() {
        const donePoints = this.journeyData.filter(p => p.status === "done");
        const lastDonePoint = donePoints[donePoints.length - 1];

        this.journeyData.forEach((stop, index) => {
            const isLastDone = (stop === lastDonePoint);

            let markerOptions = {};

            if (isLastDone) {
                markerOptions.icon = L.divIcon({
                    className: 'last-stop-blink',
                    iconSize: null,
                    iconAnchor: null,
                    zIndexOffset: 99999,
                });
            } else {
                let extraClass = "";
                if (stop.subpage_path && stop.subpage_path.length > 0) {
                    extraClass = " has-subpages";
                } else if (stop.image) {
                    extraClass = " has-image";
                }

                markerOptions.icon = L.divIcon({
                    className: 'marker-done' + extraClass,
                    iconSize: null,
                    iconAnchor: null,
                    zIndexOffset: 99999
                });
            }

            this._addContinuousMarker(stop.coords, this._getPopupContentStop(stop, index + 1), markerOptions);

            if (index < this.journeyData.length - 1) {
                this._addTransportIcon(stop, this.journeyData[index + 1], this._getPopupContentTransport(stop));
            }
        });
    }

    _addContinuousMarker(coords, popupHtml, options = {}) {
        const offsets = [0, 360, -360];
        offsets.forEach(offset => {
            const adjustedCoords = [coords[0], coords[1] + offset];
            const marker = L.marker(adjustedCoords, options)
                .bindPopup(popupHtml)
                .addTo(this.layers.markers);

            marker.on('mouseover', function () {
                this.openPopup();
            });

            marker.on('click', function () {
                this.openPopup();
            });
        });
    }

    _addTransportIcon(currentStop, nextStop, popupHtml = "") {
        const iconName = TRANSPORT_ICONS[currentStop.transport];
        if (!iconName) return;

        try {
            const tempLine = L.geodesic([currentStop.coords, nextStop.coords], {
                steps: 50,
                wrap: false
            });

            let latlngs = tempLine.getLatLngs();

            if (Array.isArray(latlngs[0])) {
                latlngs = latlngs[0];
            }

            if (!latlngs || latlngs.length === 0) return;

            const midIndex = Math.floor(latlngs.length / 2);
            const midPoint = latlngs[midIndex];

            const icon = L.divIcon({
                className: "transport-icons",
                html: `<span class="material-icons" style="color: white; text-shadow: 0 0 2px black;">${iconName}</span>`,
                iconSize: null,
                iconAnchor: null,
                zIndexOffset: 0,
            });

            [0, 360, -360].forEach(offset => {
                const marker = L.marker([midPoint.lat, midPoint.lng + offset], {
                    icon: icon,
                    zIndexOffset: 1000
                }).bindPopup(popupHtml).addTo(this.layers.icons);

                marker.on('mouseover', function () {
                    this.openPopup();
                });

                marker.on('click', function () {
                    this.openPopup();
                });
            });
        } catch (e) {
            console.warn("Erreur lors du placement de l'icône de transport:", e);
        }
    }

    _getPopupContentStop(stop, stepNumber) {
        const title = getLangText(stop.name, this.currentLang);
        const description = getLangText(stop.description, this.currentLang);

        return generatePolaroidHTML(
            stop.image,
            title,
            description,
            `${stepNumber}. `,
            stop.subpage_path,
            this.currentLang
        );
    }

    _getPopupContentTransport(stop) {
        const icon = TRANSPORT_ICONS[stop.transport] || 'place';
        const translatedTransport = UI_TRANSLATIONS[this.currentLang]?.transport[stop.transport] || stop.transport;

        const titleWithIcon = `
            <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 5px;">
                ${icon}
            </span> ${translatedTransport}`;

        const transportDescription = getLangText(stop.transport_description, this.currentLang);

        return generatePolaroidHTML(
            stop.transport_image,
            titleWithIcon,
            transportDescription,
            '',
            stop.transport_subpage_path,
            this.currentLang
        );
    }

    getTotalDistanceByTransport() {
        return this.journeyData.reduce((acc, stop) => {
            if (!stop.transport || typeof stop.distance !== 'number') {
                return acc;
            }
            const mode = stop.transport;
            acc[mode] = (acc[mode] || 0) + stop.distance;

            return acc;
        }, {});
    }

    _updateStatsCard() {
        const statsContainer = this.statsControl.getContainer();
        const distances = this.getTotalDistanceByTransport();

        if (Object.keys(distances).length === 0) {
            statsContainer.style.display = 'none';
            return;
        }

        statsContainer.style.display = 'block';

        const flagRegex = /\uD83C[\uDDE6-\uDDFF]\uD83C[\uDDE6-\uDDFF]/g;
        const flagsSet = new Set();

        this.journeyData.forEach(stop => {
            const stopName = getLangText(stop.name, this.currentLang);
            if (stopName) {
                const matches = stopName.match(flagRegex);
                if (matches) {
                    matches.forEach(flag => flagsSet.add(flag));
                }
            }
        });

        const flagsArray = Array.from(flagsSet);
        const flagsHTML = flagsArray.length > 0
            ? `<div class="stats-flags">${flagsArray.join('')}</div>`
            : '';

        const sortedDistances = Object.entries(distances).sort((a, b) => b[1] - a[1]);
        const totalDistance = sortedDistances.reduce((sum, [_, dist]) => sum + dist, 0);

        const langUI = UI_TRANSLATIONS[this.currentLang] || UI_TRANSLATIONS.fr;

        let rowsHTML = '';
        for (const [mode, dist] of sortedDistances) {
            const iconName = TRANSPORT_ICONS[mode] || 'place';
            const translatedMode = langUI.transport[mode] || mode;

            rowsHTML += `
            <div class="stats-row">
                <span class="material-icons stats-icon">${iconName}</span>
                <span class="stats-mode">${translatedMode}</span>
                <span class="stats-dist">${dist.toLocaleString()} km</span>
            </div>
        `;
        }

        statsContainer.innerHTML = `
        <div class="stats-title">${langUI.totalDistance}</div>
        <div class="stats-total">${totalDistance.toLocaleString()} km</div>
        <div class="stats-list">
            ${rowsHTML}
        </div>
        ${flagsHTML ? `<hr class="stats-divider" />${flagsHTML}` : ''}
    `;
    }
}

export function generatePolaroidHTML(image, title, description, badge = '', linkPath = '', lang = 'fr') {
    const imageBlock = image ? `
        <div class="polaroid-image-wrapper">
            <img src="${image}" alt="${title}">
        </div>
    ` : '';

    const moreDetailsText = UI_TRANSLATIONS[lang]?.moreDetails || UI_TRANSLATIONS.fr.moreDetails;

    return `
        <div class="polaroid-card">
            ${imageBlock}

            <div class="polaroid-content">
                <strong class="polaroid-title">
                    ${badge}${title}
                </strong>
                
                ${description ? `
                    <p class="polaroid-description">${description}</p>
                ` : ''}

                ${linkPath ? `
                    <div class="polaroid-link-container">
                        <a href="${linkPath}.html" class="polaroid-link">${moreDetailsText}</a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}