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
      className="layers-panel"
      style={{
        position: "absolute",
        top: "0.5rem",
        left: "52%",
        padding: "0.5rem",
        boxShadow: "initial",
        backgroundColor: "#fff",
      }}
    >
      {Object.keys(layerVisibilities).map((layer) => (
        <div key={layer} className="input d-flex justify-content-between" >
          <label>{titleCase(layer)}</label>
          <input
            type="checkbox"
            id={layer}
            checked={layerVisibilities[layer] === "visible"}
            onChange={toggleLayer}
            style={{marginLeft: '1rem'}}
          ></input>
        </div>
      ))}
    </div>
  );
}
