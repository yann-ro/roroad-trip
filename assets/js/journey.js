const TRANSPORT_ICONS = {
    walk: "directions_walk",
    bus: "directions_bus",
    train: "train",
    car: "directions_car",
    ferry: "directions_boat",
    sailing: "sailing",
    plane: "flight",
};

export class JourneyManager {
    constructor(map) {
        this.map = map;
        this.journeyData = [];
        this.layers = {
            paths: L.layerGroup().addTo(this.map),
            markers: L.layerGroup().addTo(this.map),
            icons: L.layerGroup().addTo(this.map)
        };
    }

    async load(url) {
        try {
            const response = await fetch(url);
            this.journeyData = await response.json();
            this.render();
        } catch (error) {
            console.error("Error loading the journey data:", error);
        }
    }

    render() {
        this._clearLayers();
        this._drawPaths();
        this._drawStops();
    }

    _clearLayers() {
        Object.values(this.layers).forEach(layer => layer.clearLayers());
    }

    _drawPaths() {
        const donePoints = this.journeyData.filter(p => p.status === "done");
        const nextPoints = this.journeyData.filter(p => p.status === "next");

        const styles = {
            done: { color: "white", opacity: 0.8, weight: 2, dashArray: "6,6" },
            next: { color: "white", opacity: 0.8, weight: 2, dashArray: "1,12" }
        };

        // 1. TRACÉ DONE (Strictement les points terminés)
        const doneCoords = donePoints.map(p => p.coords);
        if (doneCoords.length >= 2) {
            this._drawGeodesicTriple(doneCoords, styles.done);
        }

        // 2. TRACÉ NEXT + CONNEXION
        // On prend le dernier point 'done' s'il existe, et on lui ajoute tous les points 'next'
        let nextPathCoords = nextPoints.map(p => p.coords);

        if (donePoints.length > 0) {
            const lastDoneCoord = donePoints[donePoints.length - 1].coords;
            nextPathCoords.unshift(lastDoneCoord); // On ajoute le point de départ au début du tableau
        }

        if (nextPathCoords.length >= 2) {
            this._drawGeodesicTriple(nextPathCoords, styles.next);
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
                    iconSize: [12, 12],
                    iconAnchor: [6, 6],
                    zIndexOffset: 99999,
                });
            } else if (stop.status === "next") {
                markerOptions.icon = L.divIcon({
                    className: 'marker-next',
                    iconSize: [6, 6],
                    iconAnchor: [3, 3],
                    zIndexOffset: 0,
                });
            } else {
                let extraClass = "";
                if (stop.subpage_path && stop.subpage_path.length > 0) {
                    extraClass = " has-subpages";
                }

                markerOptions.icon = L.divIcon({
                    className: 'marker-done' + extraClass, // Deviendra 'marker-done has-subpages'
                    iconSize: [12, 12],
                    iconAnchor: [6, 6],
                    html: `<span class="marker-label">${stop.name}</span>`,
                    zIndexOffset: 1000
                });
            }

            this._addContinuousMarker(stop.coords, this._getPopupContentStop(stop, index + 1), markerOptions);

            if (index < this.journeyData.length - 1) {
                this._addTransportIcon(stop, this.journeyData[index + 1], this._getPopupContentTransport(stop));
            }
        });
    }

    /**
     * Ajoute des marqueurs sur le monde principal et les copies adjacentes
     */
    _addContinuousMarker(coords, popupHtml, options = {}) {
        const offsets = [0, 360, -360];
        offsets.forEach(offset => {
            const adjustedCoords = [coords[0], coords[1] + offset];
            L.marker(adjustedCoords, options)
                .bindPopup(popupHtml)
                .addTo(this.layers.markers);
        });
    }


    _addTransportIcon(currentStop, nextStop, popupHtml = "") {
        const iconName = TRANSPORT_ICONS[currentStop.transport];
        if (!iconName) return;

        try {
            // 1. Création de la ligne géodésique temporaire
            const tempLine = L.geodesic([currentStop.coords, nextStop.coords], {
                steps: 50,
                wrap: false
            });

            // 2. Récupération sécurisée des points
            let latlngs = tempLine.getLatLngs();

            // Leaflet.Geodesic peut renvoyer [ [latlng, latlng...] ] au lieu de [latlng, latlng...]
            if (Array.isArray(latlngs[0])) {
                latlngs = latlngs[0];
            }

            if (!latlngs || latlngs.length === 0) return;

            // 3. Calcul du point milieu
            const midIndex = Math.floor(latlngs.length / 2);
            const midPoint = latlngs[midIndex];

            // 4. Création de l'icône
            const icon = L.divIcon({
                className: "transport-icons",
                html: `<span class="material-icons" style="font-size: 14px; color: white; text-shadow: 0 0 2px black;">${iconName}</span>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
                zIndexOffset: 0,
            });

            // 5. Ajout sur les 3 mondes
            [0, 360, -360].forEach(offset => {
                L.marker([midPoint.lat, midPoint.lng + offset], {
                    icon: icon,
                    zIndexOffset: 1000
                }).bindPopup(popupHtml).addTo(this.layers.icons);
            });
        } catch (e) {
            console.warn("Erreur lors du placement de l'icône de transport:", e);
        }
    }

    _getPopupContentStop(stop, stepNumber) {
        return generatePolaroidHTML(
            stop.image,
            stop.name,
            stop.description,
            `${stepNumber}. `,
            stop.subpage_path
        );
    }

    _getPopupContentTransport(stop) {
        const icon = TRANSPORT_ICONS[stop.transport] || 'place';
        const titleWithIcon = `
            <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 5px;">
                ${icon}
            </span> ${stop.transport}`;

        return generatePolaroidHTML(
            stop.transport_image,
            titleWithIcon,
            stop.transport_description,
            '',
            stop.transport_subpage_path
        );
    }
};

export function generatePolaroidHTML(image, title, description, badge = '', linkPath = '') {
    const imageBlock = image ? `
        <div style="width: 100%; height: 270px; overflow: hidden; border: 1px solid #ddd; background: #f0f0f0; margin-bottom: 15px;">
            <img src="${image}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
        </div>
    ` : '';

    return `
        <div style="
            background: white;
            width: 300px;
            padding: 10px 10px 20px 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            border-radius: 5px;
            display: flex;
            flex-direction: column;
            align-items: center;
        ">
            ${imageBlock}

            <div style="
                text-align: center;
                color: #444; 
                width: 100%;
            ">
                <strong style="display: block; font-size: 1rem; line-height: 1.1; font-family: 'Permanent Marker', cursive; ">
                    ${badge}${title}
                </strong>
                
                ${description ? `
                    <p style="font-size: 1rem; margin: 8px 0; line-height: 1.2; color: #555; font-family: 'Life Savers', serif; font-weight: 400;">
                        ${description}
                    </p>` : ''}

                ${linkPath ? `
                    <div style="margin-top: 10px;">
                        <a href="${linkPath}.html" style="
                            font-size: 1rem; 
                            font-family: 'Life Savers', serif;
                            font-weight: 400;
                            color: #3e30d6; 
                            text-decoration: none; 
                        ">Plus de détails..</a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}