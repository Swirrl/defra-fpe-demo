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

export default function FeaturesList({ features, setSelectedFeature }) {

  const onHover = useCallback((event) => {
    const selectedFeature = { uri: event.target.getAttribute("id") }
    setSelectedFeature([{ properties: selectedFeature }])
  }, [setSelectedFeature])

  const onLeave = useCallback(() => {
    setSelectedFeature(null)
  }, [setSelectedFeature])

  return (
    <div className="features-list">
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