import React, { useEffect, useRef, useState, useCallback } from "react"
import debounce from "lodash/debounce"
import IconSearch from "images/ui-kit/icon-loupe.svg"
import IconClose from "images/ui-kit/icon-close.svg"
import Tooltip from "components/tooltip/Tooltip"

interface IGeocoder {
  token: string
  handleClick: (args: AugoraMap.Coordinates) => any
}

async function fetchMapboxAPI(search, token): Promise<AugoraMap.MapboxAPIFeatureCollection> {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?language=fr&limit=10&proximity=2.2137,46.2276&access_token=${token}`
  )
  const data: AugoraMap.MapboxAPIFeatureCollection = await response.json()

  return data
}

/** A partir d'une string avec au moins une virgule, renvoie ["ce qui est avant la première virgule", "ce qui est après la première virgule"], si pas de virgule, renvoie ["string", ""] */
const splitAddress = (address: string): [string, string] => {
  const title = address.match(/^.*?(?=\,)/) // recupère tout ce qui est avant la première virgule
  const description = address.match(/(?<=\,\s).*$/) // recupère tout ce qui est après la première virgule

  return [title ? title[0] : address, description ? description[0] : ""]
}

export default function Geocoder(props: IGeocoder) {
  const [value, setValue] = useState<string>("")
  const [results, setResults] = useState<AugoraMap.MapboxAPIFeatureCollection>(null)

  const searchField = useRef<HTMLInputElement>()
  const node = useRef<HTMLDivElement>()

  useEffect(() => {
    document.addEventListener("mousedown", clickOutside)
    return () => {
      document.removeEventListener("mousedown", clickOutside)
    }
  }, [])

  const clickOutside = (e) => {
    if (node?.current) {
      if (!node.current.contains(e.target)) {
        setResults(null)
      }
    }
  }

  const handleSearch = debounce((search: string) => {
    fetchMapboxAPI(search, props.token).then(
      (result) => setResults(result),
      () => console.error("Erreur de la requête à l'API mapbox")
    )
  }, 500)

  const handleTextInput = useCallback((value?: string) => {
    if (value && value.length > 0) {
      setValue(value)
      handleSearch(value)
    } else resetForm()
  }, [])

  const resetForm = () => {
    setValue("")
    setResults(null)
    handleSearch.cancel()
    props.handleClick(null)
  }

  return (
    <div className="map__geocoder" ref={node}>
      <form className="geocoder__form" onSubmit={(e) => e.preventDefault()}>
        <div className="form__icon icon-wrapper">
          <IconSearch />
        </div>
        <input
          className="form__input"
          ref={searchField}
          type="text"
          placeholder="Trouver une circonscription..."
          value={value}
          onChange={(e) => handleTextInput(e.target.value)}
        />
        {value.length > 0 && (
          <div className={`form__clear ${value.length > 0 ? "form__clear--visible" : ""}`}>
            <input className="form__clear-btn" type="reset" value="" title="Effacer" onClick={() => resetForm()} />
            <div className="icon-wrapper">
              <IconClose />
            </div>
          </div>
        )}
      </form>
      {results && results.features.length > 0 && (
        <Tooltip className="geocoder__results">
          <ul>
            {results.features.map(
              (feature) =>
                feature.relevance === 1 && (
                  <li key={`${feature.text}-${feature.center[0]}-${feature.center[1]}`} className="results__element">
                    <a
                      className="results__link"
                      onClick={() => {
                        setResults(null)
                        setValue(feature.place_name)
                        props.handleClick(feature.center)
                      }}
                    >
                      <div className="link__title">{splitAddress(feature.place_name)[0]}</div>
                      <div className="link__description">{splitAddress(feature.place_name)[1]}</div>
                    </a>
                  </li>
                )
            )}
          </ul>
        </Tooltip>
      )}
    </div>
  )
}
