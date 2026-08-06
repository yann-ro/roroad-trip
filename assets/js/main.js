import { JourneyManager } from './journey.js';
import { BackgroundMap } from './map.js';
import { POIManager } from './point_of_interest.js';
import { GpxManager } from './gpx.js';

const myMap = new BackgroundMap("map");

const poiManager = new POIManager(myMap.map);
poiManager.load('assets/point_of_interest.json');

const journey = new JourneyManager(myMap.map);
journey.load('assets/journey.json');

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
    ],
    {
        color: '#29dff0',
        weight: 4
    },
);