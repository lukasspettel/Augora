import React from "react"
import shuffle from "lodash/shuffle"

import SEO, { PageType } from "../components/seo/seo"
import { getDeputes, getGroupes } from "../lib/deputes/Wrapper"
import DeputiesList from "../components/deputies-list/DeputiesList"
import dayjs from "dayjs"

export default function IndexPage({ formatedDate }) {
  return (
    <>
      <SEO pageType={PageType.Accueil} />
      <span>Date regenerated: {formatedDate}</span>
      <div className="page page__deputies">
        <DeputiesList />
      </div>
    </>
  )
}

export async function getStaticProps() {
  const [deputes, groupes] = await Promise.all([getDeputes(), getGroupes()])
  const now = dayjs()
  const formatedDate = dayjs(now).toISOString()

  return {
    props: {
      deputes: shuffle(deputes),
      groupes,
      title: "Liste des députés",
      formatedDate,
    },
  }
}
