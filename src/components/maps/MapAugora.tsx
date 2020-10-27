import React, { useState, useContext, useEffect, useRef } from "react"
import { navigate } from "gatsby"
import InteractiveMap, {
  NavigationControl,
  FullscreenControl,
  Source,
  Layer,
  LayerProps,
  InteractiveMapProps,
} from "react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import {
  Code,
  Cont,
  France,
  GEOJsonReg,
  OMGEOJsonDpt,
  metroFranceFeature,
  OMFeature,
  flyToBounds,
  getContinent,
  getChildFeatures,
  getZoneCode,
  getMouseEventFeature,
  getFeature,
  getGhostZones,
  getDeputies,
} from "components/maps/maps-utils"
import CustomControl from "components/maps/CustomControl"
import MapTooltip from "components/maps/MapTooltip"
import MapBreadcrumb from "components/maps/MapBreadcrumb"
import MapButton from "components/maps/MapButton"
import MapPins from "components/maps/MapPins"
import MapMiniFilter from "components/maps/MapMiniFilter"
import IconFrance from "images/logos/projet/augora-logo.svg"
import IconArrow from "images/ui-kit/icon-arrow.svg"
import IconClose from "images/ui-kit/icon-close.svg"
import Filters from "components/deputies-list/filters/Filters"
import { DeputiesListContext } from "context/deputies-filters/deputiesFiltersContext"

export interface ICurrentView {
  GEOJson: AugoraMap.FeatureCollection
  zoneCode: Code
  zoneData: AugoraMap.Feature
  continentId: Cont
}

interface IHoverInfo {
  lngLat: [number, number]
  zoneData: AugoraMap.Feature
  source: string
  id: string
}

interface IMapAugora {
  setPageTitle?: React.Dispatch<React.SetStateAction<string>>
  codeCont?: number
  codeReg?: number | string
  codeDpt?: number | string
}

const fillLayerProps: LayerProps = {
  id: "zone-fill",
  type: "fill",
  paint: {
    "fill-color": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      "#14ccae",
      "#00bbcc",
    ],
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      0.4,
      0.1,
    ],
  },
}

const lineLayerProps: LayerProps = {
  id: "zone-line",
  type: "line",
  paint: {
    "line-color": "#00bbcc",
    "line-width": 2,
  },
}

const fillGhostLayerProps: LayerProps = {
  id: "zone-ghost-fill",
  type: "fill",
  paint: {
    "fill-color": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      "#14ccae",
      "#00bbcc",
    ],
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      0.4,
      0.04,
    ],
  },
}

const lineGhostLayerProps: LayerProps = {
  id: "zone-ghost-line",
  type: "line",
  paint: {
    "line-color": "#00bbcc",
    "line-width": 2,
    // "line-dasharray": [2, 2],
    "line-opacity": 0.2,
  },
}

/**
 * Renvoie la map augora, ne peut recevoir qu'un seul code d'affichage. Si plusieurs sont fournis, ils seront pris en compte dans l'ordre continent > region > département
 * @param {React.Dispatch<React.SetStateAction<string>>} [setPageTitle] setState callback pour changer le titre de la page
 * @param {number} codeCont Code de continent à afficher
 * @param {number | string} codeReg Code de région à afficher
 * @param {number | string} codeDpt Code de département à afficher
 */
export default function MapAugora(props: IMapAugora) {
  const {
    state: { FilteredList },
  } = useContext(DeputiesListContext)

  useEffect(() => {
    if (props.codeCont !== undefined) {
      displayNewZone(getFeature(props.codeCont, Code.Cont))
    } else if (props.codeReg) {
      displayNewZone(getFeature(props.codeReg, Code.Reg))
    } else if (props.codeDpt) {
      displayNewZone(getFeature(props.codeDpt, Code.Dpt))
    }
  }, [props.codeCont, props.codeReg, props.codeDpt])

  const [viewport, setViewport] = useState<InteractiveMapProps>({
    width: "100%",
    height: "100%",
    zoom: 5,
    longitude: France.center.lng,
    latitude: France.center.lat,
  })
  const [currentView, setCurrentView] = useState<ICurrentView>({
    GEOJson: GEOJsonReg,
    zoneCode: Code.Reg,
    zoneData: metroFranceFeature,
    continentId: Cont.France,
  })
  const [hoverInfo, setHoverInfo] = useState<IHoverInfo>({
    lngLat: null,
    zoneData: null,
    source: null,
    id: null,
  })
  const [filterDisplayed, setFilterDisplayed] = useState(false)

  const mapRef = useRef<mapboxgl.Map>()

  /**
   * Change le titre de la page, si un callback à cet effet a été fourni
   * @param {string} zoneName Le titre sera [zoneName] | Augora
   */
  const changePageTitle = (zoneName: string) => {
    if (props.setPageTitle) props.setPageTitle(zoneName)
  }

  /**
   * A appeler dorénavant pour changer de zone à la place de displayNewZone
   * @param {AugoraMap.Feature} feature La feature de la nouvelle zone
   */
  const changeZone = (feature: AugoraMap.Feature) => {
    if (feature !== currentView.zoneData) {
      const zoneCode = getZoneCode(feature)
      switch (zoneCode) {
        case Code.Cont:
          navigate(`/map?codeCont=${feature.properties[Code.Cont]}`)
          return
        case Code.Reg:
          navigate(`/map?codeReg=${feature.properties[Code.Reg]}`)
          return
        case Code.Dpt:
        case Code.Circ:
          navigate(`/map?codeDpt=${feature.properties[Code.Dpt]}`)
          return
        default:
          return
      }
    } else flyToBounds(feature, viewport, setViewport)
  }

  /**
   * Affiche la france métropolitaine
   */
  const displayFrance = () => {
    setCurrentView({
      GEOJson: GEOJsonReg,
      zoneCode: Code.Reg,
      zoneData: metroFranceFeature,
      continentId: Cont.France,
    })

    changePageTitle(metroFranceFeature.properties.nom)

    if (mapRef.current.loaded())
      flyToBounds(metroFranceFeature, viewport, setViewport)

    resetHover()
  }

  /**
   * Affiche l'outre-mer
   */
  const displayOM = () => {
    setCurrentView({
      GEOJson: OMGEOJsonDpt,
      zoneCode: Code.Dpt,
      zoneData: OMFeature,
      continentId: Cont.OM,
    })

    changePageTitle(OMFeature.properties.nom)

    if (mapRef.current.loaded()) flyToBounds(OMFeature, viewport, setViewport)

    resetHover()
  }

  /**
   * Affiche une nouvelle vue, sans changer l'url, ne pas utiliser
   * @param {AugoraMap.Feature} feature La feature de la zone à afficher
   */
  const displayNewZone = (feature: AugoraMap.Feature): void => {
    const zoneCode = getZoneCode(feature)
    let newFeature = feature

    switch (zoneCode) {
      case Code.Circ:
        newFeature = getFeature(feature.properties[Code.Dpt], Code.Dpt)
      case Code.Dpt:
      case Code.Reg:
        const childrenZonesCode = zoneCode === Code.Reg ? Code.Dpt : Code.Circ

        const contId = getContinent(newFeature)

        const newZoneGEOJson = getChildFeatures(newFeature)

        setCurrentView({
          GEOJson: newZoneGEOJson,
          zoneCode: childrenZonesCode,
          zoneData: newFeature,
          continentId: contId,
        })

        changePageTitle(newFeature.properties.nom)

        if (mapRef.current.loaded())
          flyToBounds(newFeature, viewport, setViewport)
        break
      case Code.Cont:
        newFeature.properties[zoneCode] === Cont.OM
          ? displayOM()
          : displayFrance()
        break
      default:
        console.error("Zone à afficher non trouvée")
        break
    }
    resetHover()
  }

  /**
   * Reset les data de hover
   */
  const resetHover = () => {
    if (hoverInfo.source !== null) {
      mapRef.current.setFeatureState(
        { source: hoverInfo.source, id: hoverInfo.id },
        { hover: false }
      )
      setHoverInfo({
        lngLat: null,
        zoneData: null,
        source: null,
        id: null,
      })
    }
  }

  const handleHover = (e) => {
    const feature = getMouseEventFeature(e)
    if (feature && viewport.zoom < 13) {
      const eventFeature = e.features[0]
      if (
        hoverInfo.id !== eventFeature.id ||
        hoverInfo.source !== eventFeature.source
      ) {
        if (hoverInfo.id !== null)
          mapRef.current.setFeatureState(
            { source: hoverInfo.source, id: hoverInfo.id },
            { hover: false }
          )
        mapRef.current.setFeatureState(
          { source: eventFeature.source, id: eventFeature.id },
          { hover: true }
        )
      }
      setHoverInfo({
        lngLat: e.lngLat,
        zoneData: feature,
        source: eventFeature.source,
        id: eventFeature.id,
      })
    } else {
      resetHover()
    }
  }

  const handleClick = (e) => {
    if (e.leftButton) {
      const feature = getMouseEventFeature(e)
      if (feature) {
        const zoneCode = getZoneCode(feature)
        if (zoneCode === Code.Circ) {
          const deputy = getDeputies(feature, FilteredList)[0]
          if (deputy) navigate(`/depute/${deputy.Slug}`)
        } else {
          changeZone(feature)
        }
      }
      resetHover()
    } else if (e.rightButton) handleBack()
  }

  const handleBack = () => {
    if (currentView.continentId === Cont.France) {
      if (currentView.zoneCode === Code.Circ) {
        const regionFeature = getFeature(
          currentView.GEOJson.features[0].properties[Code.Reg],
          Code.Reg
        )
        changeZone(regionFeature)
      } else changeZone(metroFranceFeature)
    } else if (currentView.continentId === Cont.OM) {
      changeZone(OMFeature)
    }
  }

  const handleLoad = () => {
    //Enlève les frontières
    mapRef.current.removeLayer("admin-0-boundary") //Les frontières des pays
    mapRef.current.removeLayer("admin-0-boundary-bg")
    mapRef.current.removeLayer("admin-1-boundary") //Les frontières des régions
    mapRef.current.removeLayer("admin-1-boundary-bg")
    mapRef.current.removeLayer("admin-0-boundary-disputed") //Les frontières contestées

    flyToBounds(currentView.zoneData, viewport, setViewport)
  }

  return (
    <InteractiveMap
      mapboxApiAccessToken="pk.eyJ1Ijoia29iYXJ1IiwiYSI6ImNrMXBhdnV6YjBwcWkzbnJ5NDd5NXpja2sifQ.vvykENe0q1tLZ7G476OC2A"
      mapStyle="mapbox://styles/mapbox/light-v10?optimize=true"
      ref={(ref) => (mapRef.current = ref && ref.getMap())}
      {...viewport}
      width="100%"
      height="100%"
      minZoom={2}
      dragRotate={false}
      doubleClickZoom={false}
      touchRotate={false}
      interactiveLayerIds={["zone-fill", "zone-ghost-fill"]}
      onLoad={handleLoad}
      onViewportChange={(change) => setViewport(change)}
      onClick={handleClick}
      onHover={handleHover}
      reuseMaps={true}
    >
      <Source type="geojson" data={currentView.GEOJson} generateId={true}>
        <Layer {...lineLayerProps} />
        <Layer {...fillLayerProps} />
      </Source>
      <Source
        type="geojson"
        data={getGhostZones(currentView.zoneData)}
        generateId={true}
      >
        <Layer {...lineGhostLayerProps} />
        <Layer {...fillGhostLayerProps} />
      </Source>
      {hoverInfo.zoneData && viewport.zoom < 13 ? (
        <MapTooltip
          lngLat={hoverInfo.lngLat}
          zoneFeature={hoverInfo.zoneData}
          deputiesList={FilteredList}
        />
      ) : null}
      <MapPins viewData={currentView} deputiesList={FilteredList} />
      <div className="map__navigation map__navigation-right">
        <NavigationControl
          showCompass={false}
          zoomInLabel="Zoomer"
          zoomOutLabel="Dézoomer"
        />
        <FullscreenControl />
        <MapButton
          className="visible"
          title="Revenir sur la France métropolitaine"
          onClick={() => changeZone(metroFranceFeature)}
        >
          <IconFrance />
        </MapButton>
      </div>
      <div className="map__navigation map__navigation-left">
        <MapBreadcrumb
          feature={currentView.zoneData}
          handleClick={changeZone}
        />
        <MapButton
          className={
            currentView.zoneData.properties[Code.Cont] === undefined
              ? "visible"
              : ""
          }
          title="Revenir à la vue précédente"
          onClick={handleBack}
        >
          <IconArrow
            style={{
              transform: "rotate(90deg)",
            }}
          />
        </MapButton>
      </div>
      <div
        className={`map__navigation map__navigation-bottom ${
          filterDisplayed ? "" : "visible"
        }`}
      >
        <MapMiniFilter
          onClick={() => setFilterDisplayed(true)}
          zoneList={getDeputies(currentView.zoneData, FilteredList)}
        />
      </div>
      <div className={`map__filters ${filterDisplayed ? "visible" : ""}`}>
        <CustomControl>
          <Filters />
          <button
            className="map__filters-close"
            onClick={() => setFilterDisplayed(false)}
            title="Cacher les filtres"
          >
            <div className="icon-wrapper">
              <IconClose />
            </div>
          </button>
        </CustomControl>
      </div>
    </InteractiveMap>
  )
}
