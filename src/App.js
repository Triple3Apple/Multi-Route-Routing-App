import { useEffect, useRef, useState } from 'react';
import './App.css';
import * as tt from '@tomtom-international/web-sdk-maps'

const App = () => {
  const mapElement = useRef();
  const [map, setMap] = useState({});

  // Hard coded for now
  // 33.42153444499368, -111.93985876629507

  // const latitude = 33.42153444499368;
  // const longitude = -111.93985876629507;

  const latitude = 33.42153444499368;
  const longitude = -111.93985876629507;

  useEffect(() => {

    // https://developer.tomtom.com/blog/build-different/tilt-and-rotation-tomtom-javascript-maps-sdk-web-v6
    let map = tt.map({
      // REMEMBER!!!! for React, env variables need to have the REACT_APP prefix!!!!!
      key: process.env.REACT_APP_TOM_TOM_KEY,
      container: mapElement.current,
      center: { lat: latitude, lng: longitude },
      zoom: 13,
    });

    setMap(map);

  }, []);

  return (
    <div className="App">
      <div ref={mapElement} className='map'></div>
    </div>
  );
}

export default App;
