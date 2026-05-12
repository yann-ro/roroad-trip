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

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '',
        }).addTo(this.map);

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            pane: 'shadowPane',
            opacity: 0.3,
            transparent: true
        }).addTo(this.map);
    }


}


