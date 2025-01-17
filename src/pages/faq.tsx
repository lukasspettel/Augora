import React, { useEffect, useState } from "react"
import SEO, { PageType } from "../components/seo/seo"
import { useRouter } from "next/router"
import Question from "components/faq/Question"
import { slugify } from "utils/utils"

type IContent = {
  title: string
  description: React.ReactNode
}[]

// Content
const contentAbout: IContent = [
  {
    title: "Qui sommes-nous ?",
    description: (
      <p>
        Nous sommes une association à but non lucratif qui a pour vocation de mettre à disposition des outils d'informations
        statistiques sur les députés via <strong>Augora.fr</strong>.
      </p>
    ),
  },
  {
    title: "Comment nous soutenir ?",
    description: (
      <p>
        Nous avons ouvert une page{" "}
        <a href="https://utip.io/augora" target="_blank" rel="noreferrer">
          uTip
        </a>{" "}
        afin de recueillir des dons. Comme nous sommes bénévoles et que nous mettons à jour le site sur notre temps libre, vos
        dons nous permettront de couvrir nos frais de fonctionnement, tel que l'hébergement du site.
      </p>
    ),
  },
  {
    title: "Qu’est-ce qu’un groupe parlementaire ?",
    description: (
      <>
        <p>
          L'Assemblée Nationale fonctionne avec des{" "}
          <a href="https://fr.wikipedia.org/wiki/Groupe_parlementaire" target="_blank" rel="noreferrer">
            groupes parlementaires
          </a>
          , composés de minimum 15 députés. Les députés d'un groupe parlementaire peuvent faire partie d'un même{" "}
          <a href="https://fr.wikipedia.org/wiki/Parti_politique" target="_blank" rel="noreferrer">
            parti politique
          </a>{" "}
          ou de partis différents (alliance de plusieurs partis politiques). Lorsqu'un député fait partie d'un groupe de moins de
          15 députés, il est assigné au groupe des non-inscrits.
        </p>
        <p>
          Le temps de parole est distribué en fonction de l'effectif des groupes. Plus un groupe a de membres, plus il aura de
          temps de parole. Pour plus d'informations, vous pouvez vous référer à la{" "}
          <a
            href="http://www2.assemblee-nationale.fr/decouvrir-l-assemblee/role-et-pouvoirs-de-l-assemblee-nationale/les-organes-de-l-assemblee-nationale/les-groupes-politiques"
            target="_blank"
            rel="noreferrer"
          >
            fiche de synthèse de l'Assemblée Nationale
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: "Qu’est-ce qu’un assistant parlementaire ?",
    description: (
      <>
        <p>
          Un assistant parlementaire aide un député durant son mandat. L'assistant est lié par un contrat de droit privé au
          député.
        </p>
        <p>Ci-dessous un liste non exhaustive des tâches qu'ils peuvent accomplir pour aider leur député : </p>
        <ul>
          <li>
            Gérer des dossiers administratifs (préparer l'agenda, répondre aux courriers, adresser des courriers à des organismes,
            assurer la permanence téléphonique, etc.)
          </li>
          <li>Apporter leur expertise sur des textes (projets ou propositions de lois, amendements, etc.)</li>
          <li>Aider à la rédaction de propositions de lois ou d'amendements</li>
        </ul>
        Pour plus d'informations, se référer à la page des{" "}
        <a
          href="https://www2.assemblee-nationale.fr/decouvrir-l-assemblee/role-et-pouvoirs-de-l-assemblee-nationale/les-autres-structures-de-soutien-a-l-activite-parlementaire/les-collaborateurs-de-deputes"
          target="_blank"
          rel="noreferrer"
        >
          collaborateurs de députés
        </a>{" "}
        sur le site de l'Assemblée Nationale.
      </>
    ),
  },
  {
    title: "Qu'est-ce qu'un rattachement financier ?",
    description: (
      <>
        <p>Pour financer leurs dépenses, les partis politiques ont deux sources de revenus principales :</p>
        <ul>
          <li>Un financement privé</li>
          <li>Un financement public</li>
        </ul>
        <p>
          Chaque année, les députés doivent déclarer leur rattachement à un parti politique. Le but de cette déclaration est
          d'attribuer une partie de leur financement public au parti choisit.
        </p>
        Pour plus d'informations, se référer à la page des{" "}
        <a
          href="https://www2.assemblee-nationale.fr/decouvrir-l-assemblee/role-et-pouvoirs-de-l-assemblee-nationale/le-depute/le-financement-de-la-vie-politique-partis-et-campagnes-electorales"
          target="_blank"
          rel="noreferrer"
        >
          financement de la vie politique
        </a>{" "}
        sur le site de l'Assemblée Nationale.
      </>
    ),
  },
  {
    title: "Qu'est-ce qu'un amendement ?",
    description: (
      <>
        <p></p>
        <p>
          L'amendement consiste en une modification d'une loi ou un projet de loi. Il peut s'agir d'une correction, d'une
          annulation ou d'un complément. L'amendement peut porter sur une partie ou l'ensemble de la-dite loi.
        </p>
      </>
    ),
  },
  {
    title: "Qu'est-ce qu'une commission parlementaire ?",
    description: (
      <>
        <p>
          Une commission est un groupe de députés spécialisé dans un domaine. Il peut s'agir d'une commission dite{" "}
          <a href="/faq#quest-ce-quune-commission-denquete">d'enquête</a> qui sera temporaire, ou d'une commission dite{" "}
          <strong>permanente</strong> (on en compte 8). Ci-dessous la liste des commissions permanentes :
        </p>
        <ul>
          <li>
            <a
              href="https://www2.assemblee-nationale.fr/15/commissions-permanentes/commission-des-affaires-culturelles"
              target="_blank"
              rel="noreferrer"
            >
              Affaires culturelles et éducation
            </a>
          </li>
          <li>
            <a
              href="https://www2.assemblee-nationale.fr/15/commissions-permanentes/commission-des-affaires-economiques"
              target="_blank"
              rel="noreferrer"
            >
              Affaires économiques
            </a>
          </li>
          <li>
            <a
              href="https://www2.assemblee-nationale.fr/15/commissions-permanentes/commission-des-affaires-etrangeres"
              target="_blank"
              rel="noreferrer"
            >
              Affaires étrangères
            </a>
          </li>
          <li>
            <a
              href="https://www2.assemblee-nationale.fr/15/commissions-permanentes/commission-des-affaires-sociales"
              target="_blank"
              rel="noreferrer"
            >
              Affaires sociales
            </a>
          </li>
          <li>
            <a
              href="https://www2.assemblee-nationale.fr/15/commissions-permanentes/commission-de-la-defense"
              target="_blank"
              rel="noreferrer"
            >
              Défense nationale et forces armées
            </a>
          </li>
          <li>
            <a
              href="https://www2.assemblee-nationale.fr/15/commissions-permanentes/commission-du-developpement-durable"
              target="_blank"
              rel="noreferrer"
            >
              Développement durable et aménagement du territoire
            </a>
          </li>
          <li>
            <a
              href="https://www2.assemblee-nationale.fr/15/commissions-permanentes/commission-des-finances"
              target="_blank"
              rel="noreferrer"
            >
              Finances
            </a>
          </li>
          <li>
            <a
              href="https://www2.assemblee-nationale.fr/15/commissions-permanentes/commission-des-lois"
              target="_blank"
              rel="noreferrer"
            >
              Lois
            </a>
          </li>
        </ul>
        <p>
          Tous les groupes parlementaires sont représentés dans chaque commission permanente de façon proportionnelle. Un député
          ne peut appartenir qu'à une seule commission permanente.
        </p>
        <p>
          Pour plus d'informations, se référer à la page des{" "}
          <a href="https://www.assemblee-nationale.fr/13/commissions/commissions-index.asp" target="_blank" rel="noreferrer">
            commissions
          </a>{" "}
          sur le site de l'Assemblée Nationale.
        </p>
      </>
    ),
  },
  {
    title: "Qu'est-ce qu'une commission d'enquête ?",
    description: (
      <>
        <p>
          Le but d'une commission d'enquête est de vérifier s’il n’y a pas de lacunes dans les politiques publiques sur un sujet
          précis. Chaque groupe parlementaire peut demander la création d’une commission d’enquête une fois par an.
        </p>
        <p>
          Celle-ci dure au maximum 6 mois, pendant lesquels les députés peuvent procéder à des auditions et demander des
          documents. Les séances en commissions sont filmées et les comptes-rendus publics. Il ne s'agit pas d'une procédure
          judiciaire.
        </p>
        <p>A l'issue de la commission d'enquête, un rapport est publié. Celui-ci peut permettre :</p>
        <ul>
          <li>d'influencer l’action du Gouvernement</li>
          <li>de déboucher sur une procédure judiciaire</li>
          <li>de préparer le terrain à une loi</li>
        </ul>
      </>
    ),
  },
  {
    title: "Qu'est-ce qu'une mission d'information ?",
    description: (
      <>
        <p>
          Une mission d'information est une commission d'enquête plus souple. En effet, elle comporte moins de contraintes : pas
          de limitation de durée et de nombre de membres. Il est également possible de travailler sur un sujet en rapport avec une
          enquête judiciaire, contrairement à la commission d'enquête.
        </p>
        <p>
          Dans certains cas, en plus d’aider à légiférer, les missions d'information permettent d’évaluer les politiques et
          contrôler l’exécutif. Chaque mission est libre de s’organiser comme elle le souhaite. Les rapports associés aux missions
          ne sont pas disponibles sur le site de l’assemblée nationale. Parfois, ils ne sont même pas sur la page personnelle d’un
          député.
        </p>
      </>
    ),
  },
  {
    title: "Qu'est-ce qu'un groupe d'étude ?",
    description: (
      <>
        <p>
          Les groupes d'études sont composés de députés. Ils ont un rôle de complément lors de la production des lois, du contrôle
          de l’exécutif et de l’évaluation des politiques publiques. A la différence des missions et des commissions d’enquêtes,
          il n’y a pas de rapport à restituer. On ne sait pas ce qui se déroule au sein de ces groupes d’études. Il n’y a pas de
          réel suivi, ni d’agenda, ni de personnel dédié pour ces groupes.
        </p>
        <p>
          Contrairement à d’autres structures, il n’y a pas de parité à respecter entre groupes parlementaires pour intégrer un
          groupe d’étude. C’est également une manière de faire du lobbying pour sa région. Par exemple, pour des députés de zones
          montagneuses, être inscrit dans le groupe d’études sur la montagne.
        </p>
      </>
    ),
  },
  {
    title: "Comment les députés sont-ils triés ?",
    description: (
      <p>
        Nous avons choisi un affichage aléatoire des députés pour éviter de mettre certains groupes en avant, dans un souci de
        transparence. Tous les jours, l'ordre des députés affichés changera.
      </p>
    ),
  },
  {
    title: "Quelles sont nos sources ?",
    description: (
      <>
        <p>
          Nous utilisons des données publiques (open-data) venant de :{" "}
          <a href="https://www.regardscitoyens.org" target="_blank" rel="noreferrer">
            https://www.regardscitoyens.org
          </a>
        </p>
        <p>
          Leurs données étant sous licence ODbl, nous redistribuons également publiquement les données que nous générons. Pour
          plus d'informations, voir notre{" "}
          <a
            href="https://github.com/Augora/Nucleus/blob/develop/Readme.md#acc%C3%A8s-aux-donn%C3%A9es"
            target="_blank"
            rel="noreferrer"
          >
            mode opératoire
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: "Quels sont nos outils ?",
    description: (
      <p>
        Nous utilisons plusieurs technologies dont : NextJS, React, Supabase, Github, Mapbox, Visx. <br />
      </p>
    ),
  },
  {
    title: "Quelles données collectons-nous sur les utilisateurs du site ?",
    description: (
      <p>
        Souhaitant établir une démarche de transparence avec nos utilisateurs, le site Augora ne souhaite collecter aucune donnée.
        <br />
        Pour plus d'informations, se référer à la page des mentions légales.
      </p>
    ),
  },
  {
    title: "Où récupérons-nous les données cartographiques ?",
    description: (
      <>
        <ul>
          <li>
            Pour les départements et régions, nous utilisons :{" "}
            <a href="https://github.com/gregoiredavid/france-geojson" target="_blank" rel="noreferrer">
              https://github.com/gregoiredavid/france-geojson
            </a>
          </li>
          <li>
            Pour les circonscriptions, nous utilisons :{" "}
            <a
              href="https://www.data.gouv.fr/en/datasets/contours-detailles-des-circonscriptions-des-legislatives/"
              target="_blank"
              rel="noreferrer"
            >
              https://www.data.gouv.fr/en/datasets/contours-detailles-des-circonscriptions-des-legislatives/
            </a>
          </li>
          <li>
            Enfin, pour les zones géographiques des députés des français établis hors de France, nous utilisons :{" "}
            <a href="https://github.com/datasets/geo-countries" target="_blank" rel="noreferrer">
              https://github.com/datasets/geo-countries
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Qu'est-ce que les DROM-COM ?",
    description: (
      <p>
        Ce nouveau sigle désigne les territoires "Départements, Régions d'Outre-Mer et Collectivités d'Outre-Mer". Avant,
        l'acronyme utilisé était "DOM-TOM".
      </p>
    ),
  },
  {
    title: "A quoi correspondent les Français établis hors de France ?",
    description: (
      <p>
        Les députés des "français établis hors de France" sont les représentants des français qui habitent plus de 6 mois dans un
        pays à l'étranger. Il faut qu'ils aient réalisé une{" "}
        <a href="https://www.service-public.fr/particuliers/vosdroits/F33307" target="_blank" rel="noreferrer">
          inscription consulaire
        </a>
        .
      </p>
    ),
  },
  {
    title: "Quels sont nos projets pour le futur ?",
    description: (
      <>
        <p>
          Nous avons l'ambition de créer des outils toujours plus accessibles et variés pour offrir à nos utilisateurs une
          expérience fluide et accessible sur différentes plateformes de diffusion.
        </p>
        <p>
          Nous souhaitons développer un ensemble d’outils autour de la visualisation de données (data-visualisation) en
          association avec des données publiques.
        </p>
      </>
    ),
  },
]

export default function FAQ() {
  const { asPath } = useRouter()
  const [hash, setHash] = useState("")

  useEffect(() => setHash(asPath.split("#")[1]), [asPath])

  return (
    <>
      <SEO pageType={PageType.FAQ} />
      <div className="page page__faq">
        {contentAbout.map((question, index) => (
          <Question key={`faq-question-${index}`} title={question.title} opened={hash === slugify(question.title)}>
            {question.description}
          </Question>
        ))}
      </div>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: "Foire aux Questions",
      PageType: PageType.FAQ,
    },
  }
}
