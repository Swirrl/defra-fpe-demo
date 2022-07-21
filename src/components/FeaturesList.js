import { useCallback } from "react";

const LinkOrLabel = ({ feature }) => {
  if (feature.properties['feature-url']) {
    return (
      <a id={feature.properties.uri} href={"https://environment.data.gov.uk" + feature.properties['feature-url']} >
        {feature.properties.label}
      </a>
    )
  } else {
    return (
      feature.properties.label
    )
  }
}

export default function FeaturesList({ clickedFeatures, hoveredFeatures, setHoveredListFeature, unsetFns }) {

  const onHover = useCallback((event) => {
    const selectedFeature = { uri: event.target.getAttribute("id") }
    setHoveredListFeature([{ properties: selectedFeature }])
  }, [setHoveredListFeature])

  const onLeave = useCallback(() => {
    setHoveredListFeature(null)
  }, [setHoveredListFeature])

  const onClose = useCallback(() => {
    unsetFns.forEach(fn => fn(null))
  }, [])

  const features = clickedFeatures || hoveredFeatures

  return (
    <div className="features-list">
      {clickedFeatures ?
        <>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          <h6 className="features-list-title">Select a measure below to view the full measure page</h6>
        </> : ""}
      <ul>
        {features.map((feature) => (
          <li className="features-list-item" id={feature.properties.uri} onMouseMove={onHover} onMouseLeave={onLeave}>
            <LinkOrLabel feature={feature} />
          </li>
        ))}
      </ul>
    </div>
  )
}