import type { Privacy } from "./types";

const fr: Privacy = {
  meta: {
    title: "Mon Salaire – Politique de confidentialité",
    description:
      "Les informations traitées par l'app iOS et Android Mon Salaire, les services tiers utilisés pour la publicité, les statistiques d'utilisation et les rapports de plantage, et vos choix.",
  },
  badge: "Mon Salaire · Legal",
  title: "Mon Salaire – Politique de confidentialité",
  updated: "Dernière mise à jour : 22 octobre 2026",
  sections: [
    {
      h: "1. Présentation",
      body: [
        "Mon Salaire (l'« App ») est une application iOS et Android qui affiche en temps réel ce que vous avez gagné jusqu'ici, à partir du salaire que vous saisissez. Cette politique explique quelles informations l'App traite, dans quel but, et quels choix s'offrent à vous.",
        "En résumé :",
        [
          "**Le salaire, les réglages et les photos d'envies que vous saisissez ne quittent jamais votre appareil.** L'App n'a ni compte ni serveur qui reçoit vos données.",
          "L'App utilise toutefois des services Google pour **afficher de la publicité**, établir des **statistiques d'utilisation** et envoyer des **rapports de plantage** ; Google traite à cette occasion des informations telles que les caractéristiques de l'appareil.",
          "L'App **utilise un identifiant publicitaire pour la publicité personnalisée.** Sur iOS, l'identifiant publicitaire (IDFA) n'est utilisé que si vous l'autorisez dans la fenêtre de transparence du suivi des apps (ATT). Sur Android, l'identifiant publicitaire de l'appareil (AAID) est utilisé sans demande séparée, et vous pouvez le désactiver à tout moment dans les réglages de l'appareil. Dans tous les cas, toutes les fonctions marchent de la même façon.",
        ],
        "Pour toute question, écrivez à {email}.",
      ],
    },
    {
      h: "2. Informations que vous saisissez",
      body: [
        "Tout ce que vous saisissez dans l'App – salaire, horaires de travail, réglages d'affichage, personnes ajoutées pour comparer, envies (photo, nom et prix), sessions « Payé à glander » – est traité ainsi :",
        [
          "**Ces informations sont stockées uniquement sur votre appareil.** Sur iOS, l'App utilise un conteneur App Group pour que l'App et ses widgets affichent les mêmes valeurs ; sur Android, le stockage privé de l'App.",
          "Personne, pas même le développeur, ne peut les consulter, puisqu'elles ne sont envoyées nulle part. Votre salaire et vos photos ne servent ni à la publicité ni aux statistiques (voir la section 4 pour ce que les statistiques enregistrent).",
          "Si la sauvegarde est activée, les données de l'App peuvent être incluses dans la sauvegarde iCloud d'Apple ou la sauvegarde automatique Android de Google. C'est le fonctionnement normal du système d'exploitation, pas une demande de l'App.",
        ],
        "**Photos et appareil photo.** Lorsque vous ajoutez une envie ou personnalisez l'écran StandBy (iOS), l'App n'utilise que des photos que vous prenez ou choisissez vous-même. L'accès à l'appareil photo et à la photothèque est demandé au moment où vous utilisez ces fonctions ; si vous refusez, le reste de l'App fonctionne normalement. Le détourage des photos d'envies se fait sur votre appareil (Apple Vision sur iOS, Google ML Kit sur Android). Les photos sont stockées uniquement sur votre appareil et ne sont jamais envoyées.",
        "L'App n'accède ni à votre position, ni à vos contacts, ni à votre numéro de téléphone, ni à vos informations de paiement ou de santé.",
      ],
    },
    {
      h: "3. Publicité (Google AdMob)",
      body: [
        "L'App affiche de la publicité via Google AdMob : une bannière en bas de l'écran, des publicités avec récompense que vous choisissez de regarder (par exemple pour recharger les modifications de montant ou masquer la bannière un moment), et des publicités interstitielles qui apparaissent parfois lors de l'utilisation de certaines fonctions.",
        "L'identifiant utilisé pour la publicité personnalisée et la manière de recueillir le consentement **dépendent du système d'exploitation.**",
        [
          "**iOS** — Nous vous le demandons via la fenêtre de transparence du suivi des apps (ATT), et ne demandons des publicités adaptées à vos centres d'intérêt à l'aide de l'identifiant publicitaire (IDFA) **que si vous l'autorisez**. Sinon, seules des publicités non personnalisées sont demandées et l'IDFA n'est pas consulté.",
          "**Android** — Faute d'équivalent à l'ATT, l'App ne pose pas de question séparée et **demande par défaut des publicités personnalisées à l'aide de l'identifiant publicitaire de l'appareil (AAID).** Si vous supprimez cet identifiant dans les réglages de l'appareil, seules des publicités non personnalisées s'affichent ensuite (voir la section 8, Vos choix).",
        ],
        "Dans tous les cas, toutes les fonctions de l'App marchent de la même façon.",
        "Que la publicité soit personnalisée ou non, Google peut traiter les informations suivantes pour diffuser les annonces et prévenir les clics frauduleux :",
        [
          "l'adresse IP et la localisation approximative qui en est déduite (pays ou ville)",
          "les informations sur l'appareil, comme le type d'appareil, la version du système et la langue",
          "les interactions avec les annonces, comme les affichages et les clics",
          "uniquement en cas de publicité personnalisée, l'identifiant publicitaire (IDFA sur iOS ou identifiant publicitaire sur Android) et les centres d'intérêt qui en sont déduits",
        ],
        "Sur iOS, l'App prend également en charge SKAdNetwork d'Apple, une méthode fournie par Apple pour mesurer l'efficacité des annonces sans identifier les utilisateurs individuellement.",
      ],
    },
    {
      h: "4. Statistiques d'utilisation (Google Analytics for Firebase)",
      body: [
        "Pour savoir quelles fonctions sont réellement utilisées et améliorer l'App, nous utilisons Google Analytics for Firebase. Les éléments traités sont les suivants :",
        [
          "**Identifiant d'instance de l'App** — une valeur aléatoire créée par Firebase pour chaque installation. Elle n'est pas liée à votre identité (nom, e-mail…) et disparaît quand vous supprimez l'App.",
          "**Informations sur l'appareil et l'environnement** — type d'appareil, version du système, langue et pays.",
          "**Événements d'utilisation** — utilisation des fonctions, comme les écrans consultés, le changement d'unité de salaire, les comparaisons lancées, l'usage des widgets (iOS), des envies et de « Payé à glander ». Lorsque vous ajoutez une envie, son prix (le nombre seulement) est enregistré ; lorsqu'une envie est remplie, le temps de travail qu'il a fallu pour la gagner ; et à la fin d'une session « Payé à glander », sa durée en secondes.",
        ],
        "**Le montant de salaire que vous saisissez n'est jamais envoyé.** Seul le type de réglage est enregistré, par exemple l'unité choisie (annuel, mensuel, journalier ou horaire), jamais le montant lui-même. Les photos et les noms des envies ne sont pas envoyés non plus.",
      ],
    },
    {
      h: "5. Rapports de plantage (Firebase Crashlytics)",
      body: [
        "Si l'App plante, un rapport est envoyé à Firebase Crashlytics pour que nous puissions trouver et corriger la cause. Il contient l'endroit du code où l'erreur s'est produite (trace de pile), le type d'appareil, la version du système, l'état de la mémoire et du stockage, l'heure du plantage et un identifiant aléatoire que Crashlytics crée pour chaque installation.",
        "Les rapports de plantage ne contiennent ni votre salaire, ni vos photos, ni les noms de vos envies.",
      ],
    },
    {
      h: "6. Services tiers",
      body: [
        "Tous les services ci-dessus sont fournis par Google, et ces informations sont traitées selon les règles de Google.",
        [
          "**Google AdMob** — affichage des publicités et mesure de leur efficacité",
          "**Google Analytics for Firebase** — statistiques d'utilisation",
          "**Firebase Crashlytics** — rapports de plantage",
        ],
        "Pour en savoir plus, consultez la page de Google [Comment Google utilise les informations des sites ou applications qui utilisent ses services](https://policies.google.com/technologies/partner-sites). L'App ne vend pas vos informations à des tiers.",
      ],
    },
    {
      h: "7. Conservation et suppression",
      body: [
        "Votre salaire, vos réglages et vos photos n'existant que sur votre appareil, ils sont supprimés avec l'App et aucune copie n'est conservée ailleurs. Les informations traitées par Google pour la publicité, les statistiques et les rapports de plantage sont conservées selon les règles de Google.",
      ],
    },
    {
      h: "8. Vos choix",
      body: [
        [
          "**iOS** — Dans **Réglages > Confidentialité et sécurité > Suivi**, vous pouvez à tout moment modifier l'autorisation de suivi de l'App. Si vous la désactivez, seules des publicités non personnalisées s'affichent ensuite. Vous pouvez aussi limiter la publicité personnalisée dans **Publicité Apple**, dans le même menu.",
          "**Android** — Dans **Paramètres > Sécurité et confidentialité > Confidentialité > Annonces** (ou **Paramètres > Google > Tous les services > Annonces** selon l'appareil), choisissez **Supprimer l'identifiant publicitaire** : seules des publicités non personnalisées s'affichent ensuite.",
          "Vous pouvez désactiver à tout moment l'accès à l'appareil photo et aux photos dans les réglages de l'appareil.",
          "La suppression de l'App efface les données stockées sur l'appareil ainsi que l'identifiant d'instance de l'App.",
          "Pour toute autre question ou demande, écrivez à l'adresse e-mail ci-dessus.",
        ],
      ],
    },
    {
      h: "9. Protection des enfants",
      body: [
        "L'App ne s'adresse pas aux enfants de moins de 14 ans et ne collecte aucune information permettant d'identifier personnellement les utilisateurs, y compris leur âge.",
      ],
    },
    {
      h: "10. Modifications de cette politique",
      body: [
        "Cette politique peut être modifiée pour tenir compte d'évolutions légales ou de l'App. Si ce que l'App traite change, nous mettrons à jour cette politique et sa date de « Dernière mise à jour » avant de publier la version concernée.",
        "Cette politique est disponible en plusieurs langues. En cas de différence entre une traduction et la version coréenne, la version coréenne prévaut.",
      ],
    },
  ],
};

export default fr;
