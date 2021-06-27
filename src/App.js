

import './App.css';
// The css below makes the marker appear correctly.
import '@tomtom-international/web-sdk-maps/dist/maps.css';

import { useEffect, useRef, useState } from 'react';
import * as ttm from '@tomtom-international/web-sdk-maps';
import * as tts from '@tomtom-international/web-sdk-services';



const App = () => {
  const mapElement = useRef();
  const [map, setMap] = useState({});
  const [longitude, setLongitude] = useState(-0.112869);
  const [latitude, setLatitude] = useState(51.504);

  // Hard coded for now
  // 33.42153444499368, -111.93985876629507

  // const latitude = 33.42153444499368;
  // const longitude = -111.93985876629507;

  // const latitude = 33.42153444499368;
  // const longitude = -111.93985876629507;

  // Function that gets lngLat and converts to points.
  const convertToPoints = (lngLat) => {
    return {
      point: {
        latitude: lngLat.lat,
        longitude: lngLat.lng,
      }
    }
  }

  const drawRoute = (geoJson, map) => {
    if (map.getLayer('route')) {
      map.removeLayer('route');
      map.removeSource('route');
    }
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geoJson,
      },
      paint: {
        'line-color': 'red',
        'line-width': 6,
      }
    })
  }

  const addDeliveryMarker = (lngLat, map) => {
    const element = document.createElement('div');
    element.className = 'marker-delivery';
    new ttm.Marker({
      element: element
    })
      .setLngLat(lngLat)
      .addTo(map)
  }

  useEffect(() => {

    const origin = {
      lat: latitude,
      lng: longitude,
    }

    const destinations = [];

    // https://developer.tomtom.com/blog/build-different/tilt-and-rotation-tomtom-javascript-maps-sdk-web-v6
    let map = ttm.map({
      // REMEMBER!!!! for React, env variables need to have the REACT_APP prefix!!!!!
      key: process.env.REACT_APP_TOM_TOM_KEY,
      container: mapElement.current,
      stylesVisibility: {
        trafficIncidents: true,
        trafficFlow: true,
      },
      center: { lat: latitude, lng: longitude },
      zoom: 13,
    });

    setMap(map);

    const addMarker = () => {

      // Where the popup is placed relative to the marker
      const popupOffset = {
        bottom: [0, -30]
      }

      const popup = new ttm.Popup({ offset: popupOffset }).setHTML('This is you!');

      const element = document.createElement('div');
      element.className = 'marker';

      const marker = new ttm.Marker({
        draggable: true,
        element: element,
      })
        .setLngLat({ lat: latitude, lng: longitude })
        .addTo(map);


      // Runs when marker has stopped being dragged.
      marker.on('dragend', () => {
        // Get new longitude and latitude.
        const lngLat = marker.getLngLat();
        setLatitude(lngLat.lat);
        setLongitude(lngLat.lng);
      })

      marker.setPopup(popup).togglePopup();

    }
    addMarker()

    const sortDestinations = (locations) => {
      const pointsForDestinations = locations.map((destination) => {
        return convertToPoints(destination)
      })

      const callParameters = {
        key: process.env.REACT_APP_TOM_TOM_KEY,
        destinations: pointsForDestinations,
        origins: [convertToPoints(origin)],
      }

      return new Promise((resolve, reject) => {
        tts.services
          .matrixRouting(callParameters)
          .then((matrixAPIResults) => {
            const results = matrixAPIResults.matrix[0]
            const resultsArray = results.map((result, index) => {
              return {
                location: locations[index],
                drivingtime: result.response.routeSummary.travelTimeInSeconds,
              }
            });

            resultsArray.sort((a, b) => {
              return a.drivingtime - b.drivingtime;
            });

            const sortedLocations = resultsArray.map((result) => {
              return result.location;
            });

            resolve(sortedLocations);

          });
      });
    }

    const recalculateRoutes = () => {
      sortDestinations(destinations).then((sorted) => {
        sorted.unshift(origin);

        tts.services
          .calculateRoute({
            key: process.env.REACT_APP_TOM_TOM_KEY,
            locations: sorted,
          })
          .then((routeData) => {
            const geoJson = routeData.toGeoJson();
            drawRoute(geoJson, map);
          });
      });
    }

    map.on('click', (e) => {
      destinations.push(e.lngLat);
      addDeliveryMarker(e.lngLat, map);
      recalculateRoutes();
    })

    return () => map.remove();

  }, [latitude, longitude]);

  // html code below
  // TODO: Fix problem with entering negative values (maybe add button that submits the 
  // result, or some sort of verification?).
  return (
    <>
      {map && <div className="app">
        <div ref={mapElement} className='map'></div>
        <div className="search-bar">
          <h1>Where to?</h1>
          <input
            type="text"
            name=""
            id="latitude"
            placeholder="Put in Latitude"
            onChange={(e) => { setLatitude(e.target.value) }}
          />
          <input
            type="text"
            name=""
            id="longitude"
            placeholder="Put in Longitude"
            onChange={(e) => { setLongitude(e.target.value) }}
          />
        </div>
      </div>}
    </>
  );
}

export default App;
