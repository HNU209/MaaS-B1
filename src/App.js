import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import axios, * as others from 'axios';
import Trip from './components/Trip';
import Splash from './components/Splash';
import './css/app.css';

const getData = dataName => {
  const res = axios.get(`https://raw.githubusercontent.com/HNU209/MaaS/main/src/data/${dataName}.json`);
  const result = res.then(r => r.data);
  return result;
}

const App = () => {
  const minTime = 420;
  const maxTime = 540;

  const [time, setTime] = useState(minTime);
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    async function getFetchData() {
      const resData = {
        'BRT': await getData('brt'),
        'BusStop': await getData('bus_stop'),
        'B1Trip': await getData('B1_trip'),
      };

      if (resData) {
        setData(resData);
        setLoaded(true);
      };
    };

    getFetchData();
  }, []);

  return (
    <div className='container'>
      {
        loaded ?
        <>
          <Trip
            data={data}
            minTime={minTime}
            maxTime={maxTime}
            time={time}
            setTime={setTime}
          >
          </Trip>
        </>
        :
        <Splash />
      }
    </div>
  );
};

export default App;