import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { Map, Source, Layer, NavigationControl } from "react-map-gl";
import LayersPanel from "./LayersPanel";
import MeasureList from "./components/MeasuresList";

// Needed for production build:
// https://github.com/visgl/react-map-gl/issues/1266#issuecomment-753686953
// prettier-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const measureScaleArea = require("./geojson/measure-scale-area.json");
const measures = require("./geojson/measures.json");

const LinkOrLabel = ({ feature }) => {
  if (feature.properties['feature-url']) {
    return (<a id={feature.properties.uri} href={"https://environment.data.gov.uk" + feature.properties['feature-url']} >
      {feature.properties.label}
    </a>)
  } else {
    return (
      feature.properties.label
    )
  }
}

function App() {
  const [hoverInfo, setHoverInfo] = useState(null);
  const [clickInfo, setClickInfo] = useState(null);
  const [hoverListInfo, setHoverListInfo] = useState(null);
  const [layerVisibilities, setLayerVisibilities] = useState({
    localAuthority: "visible",
    measures: "visible",
  });

  function debounce(cb, delay = 100) {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        cb(...args)
      }, delay)
    }
  }

  const debouncedOnHover = useCallback(debounce(
    (features) => {
      if (features.length > 0) {
        setHoverInfo({ features });
      } else {
        setHoverInfo(null)
      }
    }
  ), [])

  const onClick = useCallback((event) => {
    if (event.features.length > 0) {
      setClickInfo({ features: event.features })
    } else {
      setClickInfo(null)
    }
  }, [])

  const hoverList = useCallback((event) => {
    const selectedFeature = { uri: event.target.getAttribute("id") }
    setHoverListInfo([{ properties: selectedFeature }])
  })

  const hoverLeave = useCallback(() => {
    setHoverListInfo(null)
  }, [])

  const filter = useMemo(() => {
    const selectedFeatures = hoverListInfo || (clickInfo && clickInfo.features) || (hoverInfo && hoverInfo.features) || []
    return ['in', ['get', 'uri'], ['literal', selectedFeatures.map(feature => (feature.properties.uri) || '')]
    ]
  }, [hoverListInfo, clickInfo, hoverInfo])

  return (
    <div className="row">
      <div className="measures-list col">
        <MeasureList />
      </div>
      <div className="map col" style={{ height: '100vh' }} >
        <Map
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          initialViewState={{
            longitude: 0.13,
            latitude: 51.53,
            zoom: 8,
          }}
          mapStyle="mapbox://styles/mapbox/outdoors-v11"
          interactiveLayerIds={["measureScaleBlank", "measuresBlank"]}
          onMouseMove={event => debouncedOnHover(event.features)}
          height="200px"
          onClick={onClick}
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
            />
            <Layer
              id="measuresFills"
              source="measures"
              type="fill"
              layout={{ visibility: layerVisibilities.measures }}
              paint={{
                "fill-color": "#2E2E2E",
                "fill-opacity": 0.2
              }}
              filter={filter}
            />
          </Source>
          <NavigationControl />
          {((clickInfo && clickInfo.features.length > 0) || (hoverInfo && hoverInfo.features.length > 0)) && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                height: "30%",
                width: "100%",
                overflow: 'auto',
                background: "#fff",
                fontSize: '1rem',
                paddingBottom: '1rem'
              }}
            >
              <ul style={{ padding: '0.5rem' }}>
                {(clickInfo || hoverInfo).features.map((feature) => (
                  <li className="hover-list" style={{ listStyle: 'none', paddingBottom: '0.5rem' }} id={feature.properties.uri} onMouseMove={hoverList} onMouseLeave={hoverLeave}>
                    <LinkOrLabel feature={feature} />
                  </li>
                ))}
              </ul>
            </div>
          )}
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
