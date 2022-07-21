import { useState, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { Map, Source, Layer, NavigationControl } from "react-map-gl";
import LayersPanel from "./LayersPanel";
import MeasureList from "./components/MeasuresList";
import { debounce } from "./utils";
import FeaturesList from "./components/FeaturesList";

// Needed for production build:
// https://github.com/visgl/react-map-gl/issues/1266#issuecomment-753686953
// prettier-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const measureScaleArea = require("./geojson/measure-scale-area.json");
const measures = require("./geojson/measures.json");
const outOfBounds = require("./geojson/suffolk.json")

function App() {
  const [layerVisibilities, setLayerVisibilities] = useState({
    localAuthority: "visible",
    measures: "visible",
  });
  const [cursor, setCursor] = useState('grab');
  const [hoveredFeatures, setHoveredFeatures] = useState(null);
  const [clickedFeatures, setClickedFeatures] = useState(null);
  const [hoveredListFeature, setHoveredListFeature] = useState(null);

  const areFeaturesOutOfBounds = (features) => (
    features.find(feature => feature.source === 'outOfBounds')
  )

  const onMouseEnter = useCallback((event) => {
    if (areFeaturesOutOfBounds(event.features)) {
      setCursor('not-allowed')
    } else {
      setCursor('pointer')
    }
  }, []
  );
  const onMouseLeave = useCallback(() => setCursor('grab'), []);
  
  const debouncedOnHover = useCallback(debounce(
    (features) => {
      if (features.length > 0 && !areFeaturesOutOfBounds(features)) {
        setHoveredFeatures(features);
      } else {
        setHoveredFeatures(null)
      }
    }
  ), [])

  const onClick = useCallback((features) => {
    if (features.length > 0 && !areFeaturesOutOfBounds(features)) {
      setClickedFeatures(features)
    } else {
      setClickedFeatures(null)
    }
  }, [])

  const filter = useMemo(() => {
    const selectedFeatures = hoveredListFeature || clickedFeatures || hoveredFeatures || []
    return ['in', ['get', 'uri'], ['literal', selectedFeatures.map(feature => (feature.properties.uri) || '')]]
  }, [hoveredListFeature, clickedFeatures, hoveredFeatures])

  const isMapFeatureSelected = clickedFeatures?.length > 0 || hoveredFeatures?.length > 0

  return (
    <div className="row">
      <div className="measures-list col">
        <MeasureList />
      </div>
      <div className="map col">
        <Map
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          initialViewState={{
            longitude: 0.5,
            latitude: 52,
            zoom: 7.5,
          }}
          mapStyle="mapbox://styles/mapbox/outdoors-v11"
          interactiveLayerIds={["measureScaleBlank", "measuresBlank", "measuresPoints", "outOfBounds"]}
          height="200px"
          onMouseMove={event => debouncedOnHover(event.features)}
          onClick={event => onClick(event.features)}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          cursor={cursor}
        >
          <Source id="measureScale" type="geojson" data={measureScaleArea} generateId={true}>
            <Layer
              id="measureScaleBorders"
              source="measureScale"
              type="line"
              layout={{
                "line-cap": "round",
                "line-join": "round",
                visibility: layerVisibilities.localAuthority,
              }}
              paint={{
                "line-width": 3,
                "line-dasharray": [0.1, 2],
                "line-color": "red"
              }}
            />
            <Layer
              id="measureScaleBlank"
              source="measureScale"
              type="fill"
              layout={{ visibility: layerVisibilities.localAuthority }}
              paint={{
                "fill-color": "red",
                "fill-opacity": 0.3
              }}
            />
            <Layer
              id="measureScaleFills"
              source="measureScale"
              type="fill"
              layout={{ visibility: layerVisibilities.localAuthority }}
              paint={{
                "fill-color": "red",
                "fill-opacity": 0.35
              }}
              filter={filter}
            />
          </Source>
          <Source id="measures" type="geojson" data={measures} generateId={true}>
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
                "line-width": 2,
                "line-color": "#2E2E2E"
              }}
            />
            <Layer
              id="measuresBlank"
              source="measures"
              type="fill"
              layout={{ visibility: layerVisibilities.measures }}
              paint={{
                "fill-opacity": 0
              }}
              filter={['==', ['geometry-type'], 'Polygon']}
            />
            <Layer
              id="measuresFills"
              source="measures"
              type="fill"
              layout={{ visibility: layerVisibilities.measures }}
              paint={{
                "fill-color": "#2E2E2E",
                "fill-opacity": 0.25
              }}
              filter={filter}
            />
            <Layer
              id="measuresPoints"
              source="measures"
              type="circle"
              layout={{ visibility: layerVisibilities.measures }}
              paint={{
                "circle-radius": 4,
                "circle-color": "white",
                "circle-stroke-color": "black",
                "circle-stroke-width": 2,

              }}
              filter={['==', ['geometry-type'], 'Point']}
            />
          </Source>
          <Source id="outOfBounds" type="geojson" data={outOfBounds} generateId={true}>
            <Layer
              id="outOfBounds"
              source="outOfBounds"
              type="fill"
              paint={{
                "fill-color": "grey",
                "fill-opacity": 0.7
              }}
            />
          </Source>
          <div className="container">
            <div className="map-row row">
              <LayersPanel layerVisibilities={layerVisibilities} setVisibilities={setLayerVisibilities} />
              <div className="map-help-text col-lg-6 col-xl-7">
                1) Hover over an area to see a list of measures and / or measure scale area under your cursor.
                <br/>
                2) Click on the area you are interested in to make the list stick so you can select the measure you are interested in.
              </div>
              <NavigationControl showCompass={false} />
            </div>
          </div>
          {isMapFeatureSelected && <FeaturesList clickedFeatures={clickedFeatures} hoveredFeatures={hoveredFeatures} setHoveredListFeature={setHoveredListFeature} unsetFns={[setHoveredFeatures, setClickedFeatures]}/>}
        </Map>
      </div>
    </div>
  );
}

export default App;
