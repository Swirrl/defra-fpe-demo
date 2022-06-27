import * as React from "react";
import mapboxgl from "mapbox-gl";
import { Map, Source, Layer, NavigationControl } from "react-map-gl";

// Needed for production build:
// https://github.com/visgl/react-map-gl/issues/1266#issuecomment-753686953
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass =
  require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const measureScaleArea = require("./geojson/measure-scale-area.json");
const measures = require("./geojson/measures.json");

function App() {
  return (
    <>
      <Map
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -2.6,
          latitude: 53,
          zoom: 5.1,
        }}
        style={{ height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        <Source id="measureScale" type="geojson" data={measureScaleArea}>
          <Layer
            id="measureScaleBorders"
            source="measureScale"
            type="line"
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-width": 3,
              "line-dasharray": [0.1, 2],
            }}
          />
        </Source>
        <Source id="measures" type="geojson" data={measures}>
          <Layer
            id="measures"
            source="measuresBorders"
            type="line"
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-width": 4,
            }}
          />
        </Source>
        <NavigationControl />
      </Map>
    </>
  );
}

export default App;