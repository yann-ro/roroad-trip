export class GpxManager {
    constructor(map) {
        this.map = map;
        this.layerGroup = L.layerGroup().addTo(this.map);
    }

    /**
     * Charge un ou plusieurs fichiers GPX.
     * @param {string|string[]} gpxUrls - Un chemin unique ou un tableau de chemins vers les fichiers GPX.
     * @param {Object} options - Style du tracé Leaflet.
     */
    async load(gpxUrls, options = { color: '#ff7800', weight: 4 }) {
        const urls = Array.isArray(gpxUrls) ? gpxUrls : [gpxUrls];
        const polylines = [];

        for (const url of urls) {
            const polyline = await this.loadSingleGpx(url, options);
            if (polyline) polylines.push(polyline);
        }

        return polylines;
    }

    async loadSingleGpx(gpxUrl, options) {
        try {
            const response = await fetch(gpxUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const gpxText = await response.text();

            // Extrait un titre de secours basé sur le nom du fichier
            const fallbackTitle = gpxUrl.split('/').pop().replace(/\.gpx$/i, '');
            const { coordinates, stats, title } = this.parseGPX(gpxText, fallbackTitle);

            if (coordinates.length < 2) return null;

            const polyline = L.polyline(coordinates, options);

            // Recherche automatique de la vidéo du même nom (.mp4)
            const mp4Url = gpxUrl.replace(/\.gpx$/i, '.mp4');
            const hasVideo = await this.checkFileExists(mp4Url);

            // Info-bulle affichée au survol (hover)
            const tooltipContent = this.createTooltipContent(title, stats, hasVideo ? mp4Url : null);
            polyline.bindTooltip(tooltipContent, {
                sticky: true,
                className: 'trek-tooltip'
            });

            // Surbrillance au survol
            polyline.on('mouseover', () => polyline.setStyle({ weight: options.weight + 3 }));
            polyline.on('mouseout', () => polyline.setStyle({ weight: options.weight }));

            polyline.addTo(this.layerGroup);
            return polyline;
        } catch (error) {
            console.error(`Erreur lors du chargement du GPX (${gpxUrl}) :`, error);
            return null;
        }
    }

    parseGPX(xmlString, fallbackTitle) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");

        // Récupération du titre depuis la balise <name> du GPX
        const nameNode = xmlDoc.querySelector("trk > name, rte > name, gpx > name");
        const title = nameNode && nameNode.textContent.trim() ? nameNode.textContent.trim() : fallbackTitle;

        const points = xmlDoc.querySelectorAll("trkpt, rtept");

        const coordinates = [];
        let totalDistance = 0;
        let elevationGain = 0;
        let elevationLoss = 0;
        let previousPoint = null;
        let startTime = null;
        let endTime = null;

        points.forEach((pt, index) => {
            const lat = parseFloat(pt.getAttribute("lat"));
            const lon = parseFloat(pt.getAttribute("lon"));
            if (isNaN(lat) || isNaN(lon)) return;

            const eleNode = pt.querySelector("ele");
            const ele = eleNode ? parseFloat(eleNode.textContent) : null;

            const timeNode = pt.querySelector("time");
            const time = timeNode ? new Date(timeNode.textContent) : null;

            if (index === 0 && time) startTime = time;
            if (time) endTime = time;

            const currentPoint = { lat, lon, ele };

            if (previousPoint) {
                totalDistance += this.getDistance(previousPoint, currentPoint);

                if (previousPoint.ele !== null && currentPoint.ele !== null) {
                    const diff = currentPoint.ele - previousPoint.ele;
                    if (diff > 0) elevationGain += diff;
                    else if (diff < 0) {
                        elevationLoss += Math.abs(diff);
                    }
                }
            }

            coordinates.push([lat, lon]);
            previousPoint = currentPoint;
        });

        let duration = "Non disponible";
        if (startTime && endTime) {
            const diffMs = endTime - startTime;
            const hrs = Math.floor(diffMs / (1000 * 60 * 60));
            const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            duration = hrs > 0 ? `${hrs}h ${mins}min` : `${mins}min`;
        }

        return {
            title,
            coordinates,
            stats: {
                distanceKm: (totalDistance / 1000).toFixed(2),
                elevationGainM: Math.round(elevationGain),
                elevationLossM: Math.round(elevationLoss),
                duration
            }
        };
    }

    getDistance(pt1, pt2) {
        const R = 6371000;
        const dLat = (pt2.lat - pt1.lat) * Math.PI / 180;
        const dLon = (pt2.lon - pt1.lon) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(pt1.lat * Math.PI / 180) * Math.cos(pt2.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    async checkFileExists(url) {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            return res.ok;
        } catch {
            return false;
        }
    }

    createTooltipContent(title, stats, videoUrl) {
        const videoHtml = videoUrl ? `
            <div style="margin-top: 8px; opacity: 1;">
                <video src="${videoUrl}" width="100%" autoplay loop muted playsinline style="border-radius: 4px; display: block;"></video>
            </div>` : '';

        return `
            <div style="font-size: 13px; line-height: 1.4; width: 800px">
                <strong style="font-size: 14px; color: #2c3e50;">${title}</strong><br/>
                <hr style="margin: 4px 0; border: 0; border-top: 1px solid #ccc;"/>
                ${videoHtml}
                📏 Distance : <b>${stats.distanceKm} km</b><br/>
                📈 D+/D- : <b>+${stats.elevationGainM} m/-${stats.elevationLossM} m</b><br/>
                ⏱️ Durée : <b>${stats.duration}</b>
            </div>
        `;
    }

    clear() {
        this.layerGroup.clearLayers();
    }
}