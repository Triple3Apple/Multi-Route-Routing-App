import { useEffect, useRef, useState } from 'react';
import './App.css';
import * as tt from '@tomtom-international/web-sdk-maps'



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

  useEffect(() => {

    // https://developer.tomtom.com/blog/build-different/tilt-and-rotation-tomtom-javascript-maps-sdk-web-v6
    let map = tt.map({
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

      const element = document.createElement('div');
      element.className = 'marker';

      const marker = new tt.Marker({
        draggable: true,
        element: element,
      })
        .setLngLat({ lat: latitude, lng: longitude })
        .addTo(map);

    }
    addMarker()

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
