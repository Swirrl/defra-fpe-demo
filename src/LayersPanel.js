import * as React from "react";
import { titleCase } from "./utils";

export default function LayersPanel({ layerVisibilities, setVisibilities }) {
  const toggleLayer = (event) => {
    const layer = event.target.id;
    const visibility = event.target.checked ? "visible" : "none";
    setVisibilities({ ...layerVisibilities, [layer]: visibility });
  };

  return (
    <div
      className="layers-panel col-lg-5 col-xl-4">
      {Object.keys(layerVisibilities).map((layer) => (
        <div key={layer} className="legend d-flex justify-content-between align-items-center" >
          <span className={"legend-" + layer + "-color"} />
          <label>{titleCase(layer)}</label>
          <input
            type="checkbox"
            id={layer}
            checked={layerVisibilities[layer] === "visible"}
            onChange={toggleLayer}/>
        </div>
      ))}
    </div>
  );
}
