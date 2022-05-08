import React, { useState, useRef, useEffect, useCallback } from "react"
import { isMobile } from "react-device-detect"
import Map, {
  NavigationControl,
  FullscreenControl,
  GeolocateControl,
  Source,
  Layer,
  LayerProps,
  ViewState,
  MapRef,
  MapboxGeoJSONFeature,
} from "react-map-gl"
import {
  Code,
  flyToBounds,
  getZoneCode,
  getMouseEventFeature,
  getParentFeature,
  compareFeatures,
  getLayerPaint,
  getDeputies,
  flyToCoords,
  getContinent,
  Cont,
} from "components/maps/maps-utils"
import MapBreadcrumb from "components/maps/MapBreadcrumb"
import MapPins from "components/maps/MapPins"
import MapPin from "components/maps/MapPin"
import MapFilters from "components/maps/MapFilters"
import "mapbox-gl/dist/mapbox-gl.css"

interface IMapAugora {
  /** Objet view contenant les données d'affichage */
  mapView: AugoraMap.MapView
  /** Viewport state object */
  viewport: ViewState
  /** Viewport setstate function */
  setViewport(newViewport: ViewState): void
  /** Callback quand une zone de la map est cliquée */
  onZoneClick?<T extends GeoJSON.Feature>(feature: T): void
  /** Le mode de vue sur les zones, par défaut zoomé */
  overview?: boolean
  /** Liste de députés que la map va fouiller. Inutile si on désactive les overlay */
  deputies?: Deputy.DeputiesList
  /** Si les overlays doivent être affichés */
  overlay?: boolean
  /** Délai optionel de la fonction flytobounds */
  delay?: number
  /** S'il faut afficher les infos légales mapbox en bas à droite (légalement obligatoire) */
  attribution?: boolean
  /** S'il faut afficher les frontières */
  borders?: boolean
  children?: React.ReactNode
}

const fillLayerProps: LayerProps = {
  id: "zone-fill",
  type: "fill",
  beforeId: "road-label",
  paint: getLayerPaint().fill,
}

const lineLayerProps: LayerProps = {
  id: "zone-line",
  type: "line",
  beforeId: "road-label",
  paint: getLayerPaint().line,
}

const fillGhostLayerProps: LayerProps = {
  id: "zone-ghost-fill",
  type: "fill",
  beforeId: "road-label",
  paint: getLayerPaint(null, true).fill,
}

const lineGhostLayerProps: LayerProps = {
  id: "zone-ghost-line",
  type: "line",
  beforeId: "road-label",
  paint: {
    ...getLayerPaint().line,
    "line-opacity": 0.2,
  },
}

const localeFR = {
  "AttributionControl.ToggleAttribution": "Toggle attribution",
  "AttributionControl.MapFeedback": "Retours sur la map",
  "FullscreenControl.Enter": "Entrer en plein écran",
  "FullscreenControl.Exit": "Sortir du plein écran",
  "GeolocateControl.FindMyLocation": "Me géolocaliser",
  "GeolocateControl.LocationNotAvailable": "Géolocalisation indisponible",
  "LogoControl.Title": "Logo Mapbox ",
  // "NavigationControl.ResetBearing": "Reset bearing to north",
  "NavigationControl.ZoomIn": "Zoomer",
  "NavigationControl.ZoomOut": "Dézoomer",
  "ScaleControl.Feet": "pieds",
  "ScaleControl.Meters": "m",
  "ScaleControl.Kilometers": "km",
  "ScaleControl.Miles": "miles",
  "ScaleControl.NauticalMiles": "nm",
  "ScrollZoomBlocker.CtrlMessage": "Utilisez control + molette pour zoomer la carte",
  "ScrollZoomBlocker.CmdMessage": "Utilisez ⌘ + molette pour zoomer la carte",
  "TouchPanBlocker.Message": "Utilisez deux doigts pour bouger la carte",
}

/**
 * Renvoie la map augora, il lui faut impérativement des données d'affichage, un viewport, et un setViewport, le reste est optionnel
 * @param {AugoraMap.MapView} mapView Object contenant les données d'affichage : geoJSON (zones affichées), feature (zone parente), ghostGeoJSON (zones voisines), paint (comment les zones sont dessinées)
 * @param {Function} [onZoneClick] Callback au click d'une zone, fournie la feature cliquée en paramètre
 * @param {Deputy.DeputiesList} [deputies] Liste des députés à afficher sur la map, inutile si les overlays sont désactivés
 * @param {boolean} [overlay] S'il faut afficher les overlay ou pas, default true
 * @param {boolean} [small] S'il faut afficher une map plus petite, default false
 * @param {boolean} [attribution] Si on veut afficher le logo MapBox, default true
 * @param {number} [delay] Si on veut retarder l'effet de zoom, default 0
 */
export default function MapAugora(props: IMapAugora) {
  /** Default props */
  const {
    mapView: { geoJSON, ghostGeoJSON, feature: zoneFeature, paint },
    overlay = true,
    deputies = [],
    overview = false,
    attribution = true,
    delay = 0,
    borders = false,
  } = props

  /** useStates */
  const [hover, setHover] = useState<MapboxGeoJSONFeature>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [cursor, setCursor] = useState<string>("grab")

  /** useEffects */
  useEffect(() => {
    if (isMapLoaded) {
      if (!overview) flyToFeature(zoneFeature)
      else flyToPin(zoneFeature)
    }
  }, [zoneFeature, overview, isMapLoaded])

  /** useRefs */
  const mapRef = useRef<MapRef>()

  /** Transitionne le viewport sur une feature */
  const flyToFeature = <T extends GeoJSON.Feature>(feature: T) => {
    setTimeout(() => {
      flyToBounds(feature, mapRef.current, isMobile)
    }, delay)
  }

  /** Transitionne le viewport sur un pin en mode overview */
  const flyToPin = <T extends GeoJSON.Feature>(feature: T) => {
    const contId = getContinent(feature)
    const code = getZoneCode(feature)
    const zoom = contId === Cont.World ? -1 : contId === Cont.OM ? 2 : code !== Code.Cont ? 3.5 : 0

    // flyToCoords(zoneFeature.properties.center, props.viewport, props.setViewport, zoom)
  }

  /** Change la zone affichée et transitionne */
  const goToZone = <T extends GeoJSON.Feature>(feature: T) => {
    const zoneCode = getZoneCode(feature)
    if (feature) {
      if (!compareFeatures(feature, zoneFeature)) {
        if (props.onZoneClick) props.onZoneClick(feature)
        renderHover()
      } else if (zoneCode === Code.Circ) {
        if (props.onZoneClick) props.onZoneClick(feature)
      } else flyToFeature(feature)
    }
  }

  /** Renvoie la feature mapbox actuellement affichée correspondant à la feature fournie, undefined si elle n'est pas rendered */
  const getRenderedFeature = (feature: AugoraMap.Feature): MapboxGeoJSONFeature => {
    const zoneCode = getZoneCode(feature)

    return mapRef.current.queryRenderedFeatures(null, { layers: ["zone-fill"] }).find((feat) => {
      return zoneCode !== Code.Circ
        ? feat.properties[zoneCode] === feature.properties[zoneCode]
        : feat.properties[zoneCode] === feature.properties[zoneCode] && feat.properties[Code.Dpt] === feature.properties[Code.Dpt]
    })
  }

  /** Active le hover de la feature si elle est actuellement affichée sur la map */
  const simulateHover = (feature: AugoraMap.Feature) => {
    if (!compareFeatures(hover, feature)) {
      const renderedFeature = getRenderedFeature(feature)
      renderHover(renderedFeature)
    }
  }

  /**
   * Crée un effet de hover sur la rendered feature mapbox fournie
   * @param {MapboxGeoJSONFeature} [renderedFeature] Si ce paramètre est manquant ou incorrect, la fonction reset le hover
   */
  const renderHover = (renderedFeature?: MapboxGeoJSONFeature) => {
    if (hover && !compareFeatures(hover, renderedFeature)) {
      mapRef.current.setFeatureState({ source: hover.source, id: hover.id }, { hover: false })
      setHover(null)
    }
    if (renderedFeature) {
      mapRef.current.setFeatureState({ source: renderedFeature.source, id: renderedFeature.id }, { hover: true })
      setHover(renderedFeature)
    }
  }

  const handleHover = (e) => {
    if (isMapLoaded && e.originalEvent.target.className !== "pins__btn") {
      if (e.features) {
        renderHover(e.features[0])
      } else renderHover()
    }
  }

  const handleClick = (e) => {
    const feature = getMouseEventFeature(e)
    if (feature) goToZone(feature)
  }

  const handleBack = () => {
    goToZone(getParentFeature(zoneFeature))
  }

  const handleResize = () => {
    if (isMapLoaded) flyToFeature(zoneFeature)
  }

  const handleLoad = () => {
    if (!isMapLoaded) setIsMapLoaded(true)
  }

  return (
    <Map
      mapboxAccessToken="pk.eyJ1IjoiYXVnb3JhIiwiYSI6ImNraDNoMXVwdjA2aDgyeG55MjN0cWhvdWkifQ.pNUguYV6VedR4PY0urld8w"
      mapStyle={`mapbox://styles/augora/${borders ? "cktufpwer194q18pmh09ut4e5" : "ckh3h62oh2nma19qt1fgb0kq7"}?optimize=true`}
      locale={localeFR}
      ref={mapRef}
      style={{ width: "100%", height: "100%" }}
      initialViewState={props.viewport}
      minZoom={0}
      dragRotate={false}
      doubleClickZoom={false}
      interactiveLayerIds={isMapLoaded ? (ghostGeoJSON ? ["zone-fill", "zone-ghost-fill"] : ["zone-fill"]) : []}
      cursor={cursor}
      onResize={handleResize}
      onLoad={handleLoad}
      onMove={(e) => props.setViewport(e.viewState)}
      onClick={handleClick}
      onContextMenu={handleBack}
      onMouseEnter={() => setCursor("pointer")}
      onMouseMove={handleHover}
      onMouseLeave={() => {
        renderHover()
        setCursor("grab")
      }}
      reuseMaps={true}
      attributionControl={attribution}
    >
      {isMapLoaded && (
        <>
          <Source type="geojson" data={geoJSON} generateId={true}>
            <Layer {...lineLayerProps} paint={paint.line} />
            <Layer {...fillLayerProps} paint={paint.fill} />
          </Source>
          {ghostGeoJSON && (
            <Source type="geojson" data={ghostGeoJSON} generateId={true}>
              <Layer {...lineGhostLayerProps} />
              <Layer {...fillGhostLayerProps} />
            </Source>
          )}
          {overview && geoJSON.features.length === 1 && (
            <MapPin
              coords={[zoneFeature.properties.center[0], zoneFeature.properties.center[1]]}
              color={paint.line["line-color"] as string}
            />
          )}
          {overlay && (
            <>
              <MapPins
                features={geoJSON.features}
                ghostFeatures={ghostGeoJSON?.features}
                hoveredFeature={hover}
                deputies={deputies}
                handleClick={goToZone}
                handleHover={simulateHover}
              />
              <div className="map__navigation">
                <div className="navigation__right">
                  <NavigationControl showCompass={false} style={{ position: "relative" }} />
                  <FullscreenControl style={{ position: "relative" }} />
                  <GeolocateControl style={{ position: "relative" }} />
                </div>
                <div className="navigation__left">
                  <MapBreadcrumb feature={zoneFeature} handleClick={goToZone} />
                </div>
                <div className="navigation__bottom">
                  <MapFilters zoneDeputies={getDeputies(zoneFeature, deputies)} />
                </div>
              </div>
            </>
          )}
          {props.children}
        </>
      )}
    </Map>
  )
}
