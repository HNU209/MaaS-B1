import React, { useState, useEffect } from 'react';
import { Map } from 'react-map-gl';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import { TripsLayer } from '@deck.gl/geo-layers';
import { PathLayer, ScatterplotLayer, IconLayer, PolygonLayer } from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';
import '../css/trip.css';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});
  
const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight});

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
};

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect]
};

const INITIAL_VIEW_STATE = {
  longitude: 127.4,
  latitude: 36.45,
  zoom: 10,
  minZoom: 5,
  maxZoom: 14,
  pitch: 0,
  bearing: 0
};

const mapStyle = 'mapbox://styles/spear5306/ckzcz5m8w002814o2coz02sjc';
const MAPBOX_TOKEN = `pk.eyJ1Ijoic3BlYXI1MzA2IiwiYSI6ImNremN5Z2FrOTI0ZGgycm45Mzh3dDV6OWQifQ.kXGWHPRjnVAEHgVgLzXn2g`; // eslint-disable-line

const currData = (data, time) => {
  const arr = [];
  data.forEach(v => {
    const [start, end] = v.timestamp;
    if ((start <= time) & (time <= end)) {
      arr.push(v.trip);
    };
  });
  return arr;
}

const getColor = (data, type) => {
  if (type === 'B1') {
    return [255, 0, 0];
  } else if (type === 'TAXI') {
    if (data.vendor === 1) {
      return [253, 128, 93];
    } else if (data.vendor === 0) {
      return [23, 184, 190];
    }
  } else if (type === 'BIKE') {
    return [255, 255, 0]; // 노란색
  } else if (type === 'WALK') {
    return [0, 102, 255]; // 파란색
  }
};

const getBusStopWaiting = (bus_stop, data, time) => {
  const res = {};
  bus_stop.forEach(v => {
    const [x, y] = v.pos;
    res[`${x}_${y}`] = 0
  });

  data.forEach(v => {
    const [x, y] = v.trip
    const [start, end] = v.timestamp;

    if ((time >= start) && (time <= end)) {
      res[`${x}_${y}`] += 1
    }
  });

  const total = [];
  Object.entries(res).forEach(([k, v]) => {
    const arr = k.split('_').map(v => parseFloat(v));
    arr.push(v);
    total.push(arr);
  })
  return total;
}

const ICON_MAPPING = {
  marker1: {x: 0, y: 0, width: 128, height: 128, mask: true},
  marker2: {x: 0, y: 0, width: 128, height: 128, mask: false}
};

const Trip = (props) => {
  const animationSpeed = 2;
  const time = props.time;
  const minTime = props.minTime;
  const maxTime = props.maxTime;

  const BRT = props.data.BRT;
  const BusStop = props.data.BusStop;
  // console.log(BusStop)
  const B1Trip = props.data.B1Trip;
  
  const [animationFrame, setAnimationFrame] = useState('');

  const animate = () => {
    props.setTime(time => {
      if (time > maxTime) {
        return minTime;
      } else {
        return time + (0.01) * animationSpeed;
      };
    });
    const af = window.requestAnimationFrame(animate);
    setAnimationFrame(af);
  };

  useEffect(() => {
    animate();
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const layers = [
    new PathLayer({
      id: 'brt',
      data: BRT,
      pickable: true,
      widthScale: 1,
      widthMinPixels: 2,
      getPath: d => d.path,
      getColor: d => [255, 255, 255], // 흰색
      getWidth: d => 1
    }),
    new TripsLayer({
      id: 'B1-trip',
      data: B1Trip,
      getPath: d => d.trip,
      getTimestamps: d => d.timestamp,
      getColor: d => getColor(d, 'B1'),
      opacity: 1,
      widthMinPixels: 5,
      trailLength: 1,
      rounded: true,
      currentTime: time,
      shadowEnabled: false,
    }),
    new IconLayer({
      id: 'bus-stop',
      data: BusStop,
      pickable: false,
      iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
      iconMapping: ICON_MAPPING,
      sizeMinPixels: 10,
      sizeMaxPixels: 20,
      sizeScale: 3,
      getIcon: d => 'marker1',
      getPosition: d => d.pos,
      getSize: d => 3,
      getColor: d => [255, 0, 0]
    }),
  ];

  return (
    <div className='trip-container' style={{position: 'relative'}}>
      <DeckGL
        effects={DEFAULT_THEME.effects}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map
          mapStyle={mapStyle}
          mapboxAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
      <h1 className='time'>
        TIME : {(String(parseInt(Math.round(time) / 60) % 24).length === 2) ? parseInt(Math.round(time) / 60) % 24 : '0'+String(parseInt(Math.round(time) / 60) % 24)} : {(String(Math.round(time) % 60).length === 2) ? Math.round(time) % 60 : '0'+String(Math.round(time) % 60)}
      </h1>
    </div>
  );
}

export default Trip;