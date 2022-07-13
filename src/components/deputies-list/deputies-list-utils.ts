import GDR from "images/logos/groupes-parlementaires/gdr.svg"
import LFI from "images/logos/groupes-parlementaires/lfi.svg"
import ECO from "images/logos/groupes-parlementaires/eco.svg"
import LR from "images/logos/groupes-parlementaires/lr.svg"
import LIOT from "images/logos/groupes-parlementaires/lt.svg"
import MODEM from "images/logos/groupes-parlementaires/modem.svg"
import REN from "images/logos/groupes-parlementaires/ren.svg"
import HOR from "images/logos/groupes-parlementaires/hor.svg"
import NI from "images/logos/groupes-parlementaires/ni.svg"
import PS from "images/logos/groupes-parlementaires/ps.svg"
import RN from "images/logos/groupes-parlementaires/rn.svg"

/**
 * Renvoie le nombre de députés d'un groupe donné
 * @param {Deputy.DeputiesList} list La liste à analyser
 * @param {string} value Le sigle du groupe
 */
export const getNbDeputiesGroup = (list: Deputy.DeputiesList, value: string): number => {
  if (list.length > 0) {
    return list.filter((depute) => {
      return depute.GroupeParlementaire.Sigle === value ? true : false
    }).length
  } else return 0
}

/**
 * Renvoie le nombre de députés d'un sexe donné
 * @param {Deputy.DeputiesList} list La liste à analyser
 * @param {Filter.Gender} value Le sigle du sexe, "H", ou "F"
 */
export const getNbDeputiesGender = (list: Deputy.DeputiesList, value: Filter.Gender): number => {
  if (list.length > 0) {
    return list.filter((depute) => {
      return depute.Sexe === value ? true : false
    }).length
  } else return 0
}

/**
 * Renvoie un array de 2 chiffres, le plus petit et le plus grand âge des députés
 * @param {Deputy.DeputiesList} list
 */
export const getAgeDomain = (list: Deputy.DeputiesList): Filter.AgeDomain => {
  const listAge = list.map((depute) => depute.Age)
  return [Math.min(...listAge), Math.max(...listAge)]
}

export const getAgeDomainGraph = (range: string): Filter.AgeDomain => {
  const type = typeof range
  const rangeSplitted = type === "string" ? range.split("-") : range
  const min = type === "string" ? Number(rangeSplitted[0]) : Number(range)
  const max = type === "string" ? Number(rangeSplitted[1]) : Number(range)
  return [min, max]
}

/**
 * Renvoie le plus grand nombre d'activité d'un député
 * @param {Deputy.Activite} list
 */
export const getNbActivitesMax = (list: Deputy.Activite[]): number => {
  if (list.length > 0) {
    return list.reduce((a, b) => {
      const max = Math.max(
        b.ParticipationEnHemicycle + b.ParticipationsEnCommission,
        b.PresenceEnHemicycle + b.PresencesEnCommission,
        b.Question
      )
      return max > a ? max : a
    }, 0)
  } else return 0
}

/**
 * Renvoie un object avec tous les groupes en clé et un boolean de s'ils sont actifs sur les filtres
 * @param sigles Array des sigles
 * @param value Valeur à set, true par défaut
 */
export const getGroupValue = (sigles: string[], value = true): Filter.GroupValue => {
  return sigles.reduce((a, b) => ((a[b] = value), a), {})
}

/**
 * Filtre la liste de députés selon le state des filtres
 * @param {Deputy.DeputiesList} list
 * @param state
 */
export const filterList = (
  list: Deputy.DeputiesList,
  state: {
    AgeDomain: Filter.AgeDomain
    GroupeValue: Filter.GroupValue
    SexValue: Filter.SelectedGenders
  }
): Deputy.DeputiesList => {
  return list
    .filter((depute) => {
      return state.GroupeValue[depute.GroupeParlementaire.Sigle] ? true : false
    })
    .filter((depute) => {
      return state.SexValue[depute.Sexe] ? true : false
    })
    .filter((depute) => {
      return depute.Age >= state.AgeDomain[0] && depute.Age <= state.AgeDomain[1]
    })
}

/**
 * Renvoie le SVG d'un groupe
 * @param {string} groupe Le sigle du groupe
 */
export function getGroupLogo(groupe: string) {
  switch (groupe) {
    case "ECO":
      return ECO
    case "GDR":
      return GDR
    case "LFI":
      return LFI
    case "SOC":
      return PS
    case "LIOT":
      return LIOT
    case "REN":
      return REN
    case "MODEM":
      return MODEM
    case "HOR":
      return HOR
    case "LR":
      return LR
    case "RN":
      return RN
    case "NI":
      return NI
    default:
      return NI
  }
}
