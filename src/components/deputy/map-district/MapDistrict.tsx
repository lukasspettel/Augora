import React from "react"
import MapAugora from "components/maps/MapAugora"
import { buildURLFromCodes } from "components/maps/maps-utils"
import Block from "components/deputy/_block/_Block"
import Link from "next/link"

export default function MapDistrict(props: Bloc.Map) {
  const { NomCirconscription, NumeroCirconscription, NumeroDepartement } = props.deputy
  const mapCodes = {
    code_circ: NumeroCirconscription,
    code_dpt: NumeroDepartement,
  }

  return (
    <Block
      title="Circonscription"
      type="map"
      color={props.color}
      size={props.size}
      circ={{
        region: NomCirconscription,
        circNb: NumeroCirconscription,
      }}
    >
      <div className="map__container">
        <MapAugora deputies={[props.deputy]} codes={mapCodes} overlay={false} forceCenter={true} />
        <Link href={buildURLFromCodes(mapCodes)}>
          <div className="map__redirect"></div>
        </Link>
      </div>
    </Block>
  )
}
