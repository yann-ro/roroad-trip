import { JourneyManager } from './journey.js';
import { BackgroundMap } from './map.js';
import { POIManager } from './point_of_interest.js';

const myMap = new BackgroundMap("map");

const poiManager = new POIManager(myMap.map);
poiManager.load('assets/point_of_interest.json');

const journey = new JourneyManager(myMap.map);
journey.load('assets/journey.json');
