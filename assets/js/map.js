export class BackgroundMap {
    constructor(divId, center = [25, -20], zoom = 2) {

        this.map = L.map(divId, {
            maxBoundsViscosity: 1.0,
            worldCopyJump: false,
        }).setView(center, zoom);

        this.initLayers();
    }

    initLayers() {

        this.map.setView([18.121997, -41.225524], 3);

        L.tileLayer('https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg', {
            attribution: '© Stamen Design, © OpenStreetMap',
        }).addTo(this.map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
            attribution: '© CartoDB',
            pane: 'shadowPane',
        }).addTo(this.map);
    }

}


