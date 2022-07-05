import * as React from "react";
import { useState } from "react";
import mapboxgl from "mapbox-gl";
import { Map, Source, Layer, NavigationControl } from "react-map-gl";
import LayersPanel from "./LayersPanel";
import MeasureList from "./MeasuresList";

// Needed for production build:
// https://github.com/visgl/react-map-gl/issues/1266#issuecomment-753686953
// prettier-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const measureScaleArea = require("./geojson/measure-scale-area.json");
const measures = require("./geojson/measures.json");

function App() {
  const [layerVisibilities, setLayerVisibilities] = useState({
    measureScaleArea: "visible",
    measures: "visible",
  });

  return (
    <div className="row">
      <div className="measures-list col">
        <MeasureList />
      </div>
      <div className="map col" style={{height: '100vh'}} >
      <Map
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        initialViewState={{
            longitude: 0.13,
            latitude: 51.53,
            zoom: 8,
        }}
        style={{ height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        <Source id="measureScale" type="geojson" data={measureScaleArea}>
          <Layer
            id="measureScaleBorders"
            source="measureScale"
            type="line"
            layout={{
              "line-cap": "round",
              "line-join": "round",
              visibility: layerVisibilities.measureScaleArea,
            }}
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
            layout={{
              "line-cap": "round",
              "line-join": "round",
              visibility: layerVisibilities.measures,
            }}
            paint={{
              "line-width": 4,
            }}
          />
        </Source>
        <NavigationControl />
      </Map>
      <LayersPanel
        layerVisibilities={layerVisibilities}
        setVisibilities={setLayerVisibilities}
      />
      </div>
    </div>
  );
}

export default App;
