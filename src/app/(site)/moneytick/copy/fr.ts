import type { Landing } from "./types";

const fr: Landing = {
  meta: {
    title: "Mon Salaire : paie en direct",
    description:
      "Une app iPhone et Android qui montre l'argent que tu gagnes en ce moment, seconde par seconde. Widgets, écran verrouillé, StandBy et une course contre le salaire de qui tu veux.",
  },
  appName: "Mon Salaire",
  tagline: "Ton salaire à la seconde",
  iconAlt: "Icône de l'app Mon Salaire",
  languageLabel: "Langue",
  hero: {
    appStore: "Télécharger sur l'App Store",
    play: "Disponible sur Google Play",
    requirements: "iOS 17 · Android 7.0 ou plus · Gratuit",
  },
  money: { locale: "fr-FR", prefix: "€", suffix: "" },
  salary: { me: 40_000, boss: 100_000 },
  eyebrow: {
    features: "Fonctions",
    race: "Course comparée",
    faq: "Questions fréquentes",
    support: "Contact et assistance",
  },
  ticker: {
    units: { year: "Annuel", month: "Mensuel", day: "Journalier" },
    unitNames: { year: "Salaire annuel", month: "Salaire mensuel", day: "Salaire journalier" },
    since: "Depuis minuit",
    perSecond: (a) => `${a} par seconde`,
  },
  features: [
    { title: "Ce que vaut une seconde", tail: "Annuel, mensuel, journalier ou horaire" },
    { title: "En continu · Heures de travail", tail: "Même la nuit, ou seulement au travail" },
    { title: "Planning · Travail posté", tail: "Une pause par jour, nuits comprises" },
    { title: "Envies", tail: "Remplis ce que tu veux avec ce que tu gagnes" },
    { title: "Payé à glander", tail: "Ce que ta boîte t'a payé pendant la pause café" },
    { title: "Course comparée", tail: "D'un café à une voiture neuve" },
    { title: "Widgets · Écran verrouillé · StandBy", tail: "Sans ouvrir l'app" },
    { title: "20 devises · 12 langues", tail: "Dans l'app et les widgets" },
  ],
  race: {
    me: "Moi",
    boss: "Le patron",
    goal: 25,
    goalTitle: (a) => `Une pizza · jusqu'à ${a}`,
    speed: "×1000",
    arrived: "Arrivé",
    summary: (t, a) =>
      `Pendant les ${t} qu'il faut au patron pour gagner une pizza, j'arrive à ${a}.`,
    duration: (h, m) => `${h} h ${m} min`,
  },
  stay: {
    since: (s) => `Depuis que tu as ouvert cette page : ${s}`,
    spent: (m, s) => (m > 0 ? `${m} min ${s} s` : `${s} s`),
    footnote: "Pour un salaire annuel de €40 000. L'app compte avec le tien.",
  },
  statement: {
    headline: "Quand une réunion s'éternise, regarde l'écran : tu verras ce qu'elle coûte.",
    body: "J'ai fait cette app pour voir chaque jour le chiffre qu'on ne ressent que le jour de paie. Le salaire que tu saisis ne quitte jamais cet appareil.",
  },
  faq: [
    {
      q: "Le widget n'avance pas chaque seconde",
      a: "iOS dessine les widgets à partir d'une chronologie préparée à l'avance. L'app en prépare 30 minutes à la fois, puis passe à la suite. À chaque mise à jour, le calcul est refait pour l'instant précis : le montant affiché est toujours juste.",
    },
    {
      q: "Puis-je voir mon salaire net ?",
      a: "Pas encore. Impôts et cotisations dépendent de trop de facteurs, alors plutôt qu'une formule non vérifiée, rien pour l'instant. Tous les montants sont bruts.",
    },
    {
      q: "D'où viennent les salaires à comparer ?",
      a: "Tu les saisis toi-même. L'app ne propose aucune personne prédéfinie.",
    },
    {
      q: "Les montants sont-ils convertis dans une autre devise ?",
      a: "Non. Seule l'écriture change. Aux États-Unis, un café coûte juste $5.",
    },
    {
      q: "Mon salaire est-il envoyé quelque part ?",
      a: "Non. Pas d'inscription : ton salaire, tes réglages et les photos de tes envies restent sur cet appareil. L'app contient toutefois de la publicité (AdMob) et des statistiques d'utilisation (Firebase), donc Google traite certaines informations sur l'appareil. Sur iPhone, le suivi pour la publicité personnalisée t'est demandé au premier lancement, et tout fonctionne même si tu refuses.",
    },
    {
      q: "Puis-je retirer la publicité ?",
      a: "Regarde une pub depuis les réglages et la bannière du bas disparaît pendant 12 heures. Il n'y a rien à acheter.",
    },
  ],
  support: { privacy: "Politique de confidentialité" },
};

export default fr;
