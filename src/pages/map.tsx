import React, { useState } from "react"
import ReactMapGL, {
  NavigationControl,
  FullscreenControl,
  Source,
  Layer,
  Marker,
} from "react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import {
  ZoneCode,
  franceBox,
  GEOJsonReg,
  flyToBounds,
  getBoundingBoxFromPolygon,
  filterNewGEOJSonFeatureCollection,
  getZonePolygon,
  getZoneCodeFromFeatureProperties,
  getGEOJsonFile,
} from "../components/maps/maps-utils"
import ResetControl from "../components/maps/ResetControl"
import Tooltip from "../components/tooltip/Tooltip"

const fillLayerLayout = {
  type: "fill",
  paint: {
    "fill-color": "#fff",
    "fill-opacity": 0.3,
  },
}

const lineLayerLayout = {
  type: "line",
  paint: {
    "line-color": "#4d4d4d",
    "line-width": 1,
    // "line-dasharray": [4, 2],
  },
}

const hoverLayerLayout = {
  type: "fill",
  paint: {
    "fill-color": "#14ccae",
    "fill-opacity": 0.5,
  },
}

/**
 * Returns the zone id of a mouseevent
 */
const getMouseEventZoneId = (e): number => {
  if (e.features) {
    const currentZoneCode = getZoneCodeFromFeatureProperties(
      e.features[0]?.properties
    )
    if (currentZoneCode) {
      const zoneId = e.features[0].properties[currentZoneCode] as number
      return zoneId
    } else return null
  } else return null
}

export default function MapPage() {
  const [viewport, setViewport] = useState({})
  const [currentGEOJson, setCurrentGEOJson] = useState(GEOJsonReg)
  const [hoverInfo, setHoverInfo] = useState({
    filter: ["==", ["get", ""], 0],
    lngLat: undefined,
    zoneName: undefined,
  })

  const resetFilter = () => {
    setHoverInfo({
      filter: ["==", ["get", ""], 0],
      lngLat: undefined,
      zoneName: undefined,
    })
  }

  /**
   * Affiche une nouvelle vue
   * @param {ZoneCode} zonesToDisplayCode Le code du groupe de zones à afficher
   * @param {number} zonesToDisplayCommonId L'id qu'ils ont en commun (si ce sont des départements, leur région id, si ce sont des circonscriptions, leur département id)
   */
  const displayNewZone = (
    zonesToDisplayCode: ZoneCode,
    zonesToDisplayCommonId: number
  ) => {
    const parentZoneCode =
      zonesToDisplayCode === ZoneCode.Circonscriptions
        ? ZoneCode.Departements
        : ZoneCode.Regions

    const newZoneGEOJson = filterNewGEOJSonFeatureCollection(
      getGEOJsonFile(zonesToDisplayCode),
      parentZoneCode,
      zonesToDisplayCommonId
    )

    const newZonePolygon = getZonePolygon(
      getGEOJsonFile(parentZoneCode),
      parentZoneCode,
      zonesToDisplayCommonId
    )

    setCurrentGEOJson(newZoneGEOJson)
    flyToBounds(
      getBoundingBoxFromPolygon(newZonePolygon),
      viewport,
      setViewport
    )
    resetFilter()
  }

  const handleHover = (e) => {
    const hoveredZoneId = getMouseEventZoneId(e)
    if (hoveredZoneId) {
      const featureProps = e.features[0].properties
      setHoverInfo({
        filter: [
          "==",
          [
            "get",
            getZoneCodeFromFeatureProperties(
              currentGEOJson.features[0].properties
            ),
          ],
          hoveredZoneId,
        ],
        lngLat: e.lngLat,
        zoneName: featureProps.nom
          ? featureProps.nom
          : `Circonscription n°${featureProps.num_circ}`,
      })
    } else if (hoverInfo.filter !== ["==", ["get", ""], 0]) {
      resetFilter()
    }
  }

  const handleClick = (e) => {
    const clickedZoneId = getMouseEventZoneId(e)
    if (clickedZoneId) {
      const currentZoneCode = getZoneCodeFromFeatureProperties(
        currentGEOJson.features[0].properties
      )
      //ne rien faire si on est en vue circ (pour l'instant en tout cas)
      if (currentZoneCode === ZoneCode.Regions) {
        displayNewZone(ZoneCode.Departements, clickedZoneId)
      } else if (currentZoneCode === ZoneCode.Departements) {
        displayNewZone(ZoneCode.Circonscriptions, clickedZoneId)
      }
    }
  }

  const handleBack = () => {
    const currentZoneCode = getZoneCodeFromFeatureProperties(
      currentGEOJson.features[0].properties
    )

    if (currentZoneCode === ZoneCode.Circonscriptions) {
      const regionId = currentGEOJson.features[0].properties[
        ZoneCode.Regions
      ] as number
      displayNewZone(ZoneCode.Departements, regionId)
    } else if (currentZoneCode === ZoneCode.Departements) {
      handleReset()
    }
  }

  const handleReset = () => {
    setCurrentGEOJson(GEOJsonReg)
    flyToBounds(franceBox, viewport, setViewport)
  }

  return (
    <>
      <div className="page page__map">
        <div className="map__container">
          <ReactMapGL
            mapboxApiAccessToken="pk.eyJ1Ijoia29iYXJ1IiwiYSI6ImNrMXBhdnV6YjBwcWkzbnJ5NDd5NXpja2sifQ.vvykENe0q1tLZ7G476OC2A"
            mapStyle="mapbox://styles/mapbox/streets-v11?optimize=true"
            {...viewport}
            width="100%"
            height="100%"
            minZoom={2}
            dragRotate={false}
            doubleClickZoom={false}
            touchRotate={false}
            interactiveLayerIds={["zone-fill", "zone-line"]}
            onLoad={() => {
              setViewport({
                zoom: 2,
              })
              flyToBounds(franceBox, viewport, setViewport)
            }}
            onViewportChange={(change) => setViewport(change)}
            onHover={handleHover}
            onClick={handleClick}
          >
            <Source type="geojson" data={currentGEOJson}>
              <Layer
                id="zone-fill-hovered"
                {...hoverLayerLayout}
                filter={hoverInfo.filter}
              />
              <Layer id="zone-fill" {...fillLayerLayout} />
              <Layer id="zone-line" {...lineLayerLayout} />
            </Source>
            {hoverInfo.zoneName ? (
              <Marker
                longitude={hoverInfo.lngLat[0]}
                latitude={hoverInfo.lngLat[1]}
                offsetTop={40}
              >
                <Tooltip
                  title={hoverInfo.zoneName}
                  nbDeputes={0}
                  totalDeputes={0}
                />
              </Marker>
            ) : null}
            <div className="map__navigation">
              <NavigationControl
                showCompass={false}
                zoomInLabel="Zoomer"
                zoomOutLabel="Dézoomer"
              />
              <FullscreenControl />
              <ResetControl
                onReset={handleReset}
                className={`map__navigation-reset visible`}
                title="Revenir à la position initiale"
              />
            </div>
            <button
              style={{
                position: "absolute",
                left: "10px",
                top: "10px",
                minHeight: "30px",
              }}
              onClick={handleBack}
            >
              Précedent
            </button>
          </ReactMapGL>
        </div>
      </div>
    </>
  )
}
