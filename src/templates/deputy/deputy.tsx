import React from "react"
import Helmet from "react-helmet"
import { colors } from "utils/variables"
import { graphql } from "gatsby"
import Coworkers from "components/deputy/coworkers/Coworkers"
import MapDistrict from "components/deputy/map-district/MapDistrict"
import { getGender } from "utils/augora-objects/deputy/gender"
import { getGeneralInformation } from "utils/augora-objects/deputy/information"
import { getMandate } from "utils/augora-objects/deputy/mandate"
import { getCoworkers } from "utils/augora-objects/deputy/coworker"
import GeneralInformation from "components/deputy/general-information/GeneralInformation"
import Mandate from "components/deputy/mandate/Mandate"
import Contact from "components/deputy/contact/Contact"
import Presence from "components/deputy/presence/Presence"

import { isEmpty } from "lodash"

import IconMail from "images/ui-kit/icon-mail.svg"
import IconWebsite from "images/ui-kit/icon-web.svg"
// import IconFacebook from 'images/ui-kit/icon-facebook.svg'
import IconTwitter from "images/ui-kit/icon-twitter.svg"
import SEO, { PageType } from "components/seo/seo"

const allColors = colors.map((color) => {
  return "--" + color.name + "-color :" + color.hex + ";\n"
})

function Deputy({ data }) {
  const deputy = data.faunadb.Depute
  const color = deputy.GroupeParlementaire.Couleur
  return (
    <>
      <SEO pageType={PageType.Depute} depute={deputy} />
      <Helmet>
        <style>{`:root { --groupe-color: ${color}; }`}</style>
      </Helmet>
      <div className="page page__deputy">
        <div className="deputy__header">
          <h1>
            {deputy.Prenom} {deputy.NomDeFamille}
          </h1>
          <div className="deputy__contact">
            {deputy.Emails.length > 0 ? (
              <a
                href={`mailto:${deputy.Emails[0]}`}
                className="btn btn--mail"
                title="Adresse e-mail"
              >
                <div className="deputy__icon">
                  <IconMail />
                </div>
              </a>
            ) : (
              <div
                className="deputy__icon deputy__icon--missing"
                title="Pas d'adresse e-mail renseignée"
              >
                <IconMail />
              </div>
            )}
            {deputy.SitesWeb.length > 0 ? (
              <a
                href={deputy.SitesWeb[0]}
                className="btn btn--website"
                target="_blank"
                title="Site Web"
              >
                <div className="deputy__icon" style={{ width: "30px" }}>
                  <IconWebsite />
                </div>
              </a>
            ) : (
              <div
                className="deputy__icon deputy__icon--missing"
                title="Pas de Site Web renseigné"
              >
                <IconWebsite />
              </div>
            )}
            {/* <a href="" className="btn btn--facebook">
            <div className="deputy__icon">
              <IconFacebook />
            </div>
          </a> */}
            {!isEmpty(deputy.Twitter) ? (
              <a
                href={`https://twitter.com/${deputy.Twitter}`}
                className="btn btn--twitter"
                target="_blank"
                title="Twitter"
              >
                <div className="deputy__icon">
                  <IconTwitter />
                </div>
              </a>
            ) : (
              <div
                className="deputy__icon deputy__icon--missing"
                title="Pas d'adresse Twitter renseignée"
              >
                <IconTwitter />
              </div>
            )}
          </div>
        </div>
        <div className="deputy__content">
          <GeneralInformation
            {...getGeneralInformation(deputy)}
            color={color}
            size="medium"
            dateBegin={deputy.DateDeNaissance}
          />
          <Mandate {...getMandate(deputy)} color={color} size="small" />
          <Coworkers {...getCoworkers(deputy)} color={color} size="small" />
          <MapDistrict
            nom={deputy.NomCirconscription}
            num={deputy.NumeroCirconscription}
            color={color}
            size="medium"
          />
          <Presence color={color} size="large" wip={true} />
          <Contact
            color={color}
            size="medium"
            adresses={deputy.AdressesDetails.data}
          />
        </div>
      </div>
    </>
  )
}

export default Deputy

export const query = graphql`
  query SingleDeputy($slug: String!) {
    faunadb {
      Depute(Slug: $slug) {
        Age
        LieuDeNaissance
        DebutDuMandat
        Emails
        GroupeParlementaire {
          NomComplet
          Couleur
          Sigle
        }
        URLPhotoAugora
        Nom
        NomCirconscription
        NomDeFamille
        NombreMandats
        NumeroCirconscription
        NumeroDepartement
        parti_ratt_financier
        PlaceEnHemicycle
        Prenom
        Profession
        Sexe
        SitesWeb
        Slug
        Twitter
        Collaborateurs
        DateDeNaissance
        NomDepartement
        AnciensMandats {
          data {
            DateDeDebut
            DateDeFin
            Intitule
          }
        }
        AutresMandats {
          data {
            Institution
            Localite
            Intitule
          }
        }
        AdressesDetails {
          data {
            Adresse
            CodePostal
            Telephone
          }
        }
      }
    }
  }
`
