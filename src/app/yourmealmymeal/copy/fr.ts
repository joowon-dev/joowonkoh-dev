import type { Copy } from "./types";

const fr: Copy = {
  appName: "네밥내밥",
  quote: ["« ", " »"],
  store: { download: "Télécharger" },

  landing: {
    meta: {
      title: "네밥내밥",
      description:
        "Remplis ton plateau case par case avec des photos du petit-déj, du déjeuner et du dîner, et prenez soin les uns des autres en famille ou entre amis. Page de présentation et d’assistance de 네밥내밥, l’appli iOS et Android.",
      ogTitle: "네밥내밥 — au lieu de demander « T’as mangé ? »",
      ogDescription:
        "Remplis ton plateau case par case avec des photos du petit-déj, du déjeuner et du dîner, et prenez soin les uns des autres en famille ou entre amis.",
      ogAlt: "Image de présentation de 네밥내밥 : un plateau blanc sur fond jaune d’œuf, seule la case du déjeuner est remplie en rouge tomate",
    },
    trayTitle: "Plateau 네밥내밥",
    greetings: [
      "T’as mangé quoi aujourd’hui ?",
      "Tu manges bien, au moins ?",
      "C’était bon, ce midi ?",
      "Ce soir, on dîne ensemble, en pensée",
    ],
    tagline: "Une photo de ton repas, et ton plateau du jour se partage avec ta famille et tes amis.",
    together: {
      title: "Une même tablée",
      lead: "Les plateaux de 2 à 6 personnes réunies par un code d’invitation sont posés sur une même table. Tu vois qui n’a pas encore mangé sans avoir à demander.",
    },
    featuresTitle: "Ce qu’on peut faire",
    features: [
      { title: "Une case à la fois", tail: "Photo ou album, hop, dans la case" },
      { title: "Tu cadres toi-même", tail: "Déplace et zoome pour ne rien couper" },
      { title: "Coucou aux cases vides", tail: "Pas encore mangé ? Un petit signe" },
      { title: "Un seul plateau", tail: "Publié une fois, visible dans tous tes groupes" },
      { title: "Réactions · commentaires", tail: "Un « Ça a l’air bon » suffit" },
      { title: "Ta journée en une image", tail: "Enregistre le plateau du jour dans tes photos" },
    ],
    statement: { before: "Au lieu de « T’as mangé ? », c’est la ", em: "case vide", after: " qui parle en premier." },
    story: [
      "Quand on vit seul, les repas sont la première chose qu’on bâcle. Le seul moyen de vérifier, c’est d’appeler pour demander, et la réponse est presque toujours « Oui, j’ai mangé ».",
      "Alors au lieu de demander, on a rendu ça visible. Ce n’est pas une appli qui automatise les reproches, c’est une appli qui t’épargne l’effort de prendre des nouvelles. C’est pour ça qu’elle ne gronde jamais une case vide. Il y a trois repas, et le goûter, c’est du bonus.",
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      {
        q: "Qui peut voir mes photos ?",
        a: "Seulement les personnes qui sont dans le même groupe que toi. Cette restriction est appliquée dans la base de données elle-même, pas seulement dans l’appli : même avec une appli modifiée, impossible de récupérer les repas des autres. Le stockage des photos est privé et les liens ne restent valides que peu de temps.",
      },
      {
        q: "Je peux être à la fois dans un groupe famille et un groupe amis ?",
        a: "Oui. Chacun n’a qu’un seul plateau : si tu publies ton petit-déj une fois, il apparaît dans tous les groupes dont tu fais partie. Pas besoin de publier séparément pour chaque groupe.",
      },
      {
        q: "Combien de Coucou je peux envoyer ?",
        a: "Pour éviter une avalanche de notifications, le serveur compte combien tu en envoies par jour. Quand tu n’en as plus, tu peux regarder une courte pub pour en obtenir quelques-uns de plus, avec là aussi une limite quotidienne. La case goûter est un bonus, donc on ne peut pas y envoyer de Coucou.",
      },
      {
        q: "Est-ce qu’il y a des pubs ?",
        a: "Il y a des pubs plein écran qui s’affichent de temps en temps après avoir fermé une photo ou terminé une publication, et des pubs avec récompense que tu regardes seulement si tu veux plus de Coucou. Il n’y a pas de bannière affichée en permanence. On collecte aussi des statistiques d’utilisation pour améliorer l’appli. Tous les détails sont dans la politique de confidentialité.",
      },
      {
        q: "Que se passe-t-il si je supprime mon compte ?",
        a: "Tu peux le supprimer directement dans l’appli. Toutes tes photos et tous tes repas sont effacés, sans retour possible. Les groupes que tu as créés passent au membre restant le plus ancien, et s’il ne reste personne, le groupe est supprimé lui aussi.",
      },
    ],
    closing: {
      title: "Ce soir, on dîne ensemble, en pensée",
      body: "Une idée de fonctionnalité ou une question ? Écris-nous par e-mail quand tu veux.",
      privacy: "Politique de confidentialité",
      deleteAccount: "Supprimer son compte",
    },
  },

  join: {
    meta: {
      title: "T’as mangé ? · 네밥내밥",
      description:
        "On t’invite à table. Note sur ton plateau ce que tu as mangé aujourd’hui. Copie le code d’invitation et saisis-le dans l’appli pour rejoindre le groupe.",
      ogTitle: "T’as mangé ?",
      ogDescription: "On t’invite à table · Note sur ton plateau ce que tu as mangé aujourd’hui",
      ogAlt: "Image d’invitation : un plateau blanc aux quatre cases vides au centre d’un fond jaune d’œuf clair, avec une cuillère rouge tomate et une fourchette vert menthe de chaque côté",
    },
    trayTitle: "Un plateau vide, encore rien dedans",
    title: "T’as mangé ?",
    sub: "Note ce que tu as mangé aujourd’hui !",
    pill: "On t’attend à table · À remplir ensemble",
    step1: "Copie le code d’invitation",
    copyAria: "Copier le code d’invitation {code}",
    noCodeAria: "Aucun code d’invitation",
    copied: "Copié !",
    missing: ["Le code d’invitation manque ou est coupé dans le lien.", "Redemande le code à la personne qui t’a invité."],
    step2: "Installe l’appli et saisis-le",
    hint: { before: "Dans l’appli, onglet ", tab: "Groupes", after: "", add: "Ajouter un groupe", join: "Rejoindre avec un code" },
    openInApp: "Déjà l’appli ? · Ouvrir dans l’appli",
    limit: "Jusqu’à 6 par groupe. Complet ? On ne peut plus entrer.",
    about: "À propos",
    privacy: "Confidentialité",
  },

  shell: {
    homeAria: "Accueil 네밥내밥",
    about: "À propos",
    privacy: "Confidentialité",
    deleteAccount: "Supprimer le compte",
    language: "Langue",
  },

  legal: {
    badge: "네밥내밥 · Legal",
    updated: "Dernière mise à jour",
    koreanPrevails: "Ceci est une traduction. En cas de divergence avec la version coréenne, la version coréenne prévaut.",
    koreanLink: "Voir la version coréenne",
  },

  privacy: {
    title: "네밥내밥 Politique de confidentialité",
    description:
      "Les informations traitées par 네밥내밥, l’appli iOS et Android, qui peut voir tes photos et tes repas, et comment supprimer ton compte.",
    updatedAt: "16 octobre 2026",
    sections: [
      {
        h: "1. Présentation",
        blocks: [
          {
            p: "네밥내밥 (ci-après « l’Application ») est une application iOS et Android qui permet d’enregistrer en photo les repas de la journée et de les partager avec les personnes du même groupe. La présente politique explique quelles informations l’Application traite, dans quel but, et quels choix vous avez.",
          },
          { p: "En résumé :" },
          {
            ul: [
              "Vos photos et vos repas ne sont visibles **que par les personnes du même groupe que vous**.",
              "L’Application affiche des **publicités plein écran et des publicités avec récompense Google AdMob**. Les publicités plein écran s’affichent de temps en temps sur tout l’écran après la fermeture d’une photo ou la fin d’une publication ; les publicités avec récompense ne sont regardées que si vous le choisissez, une fois vos Coucou épuisés. Il n’y a pas de bannière publicitaire affichée en permanence. Nous utilisons Google Analytics for Firebase pour les statistiques d’utilisation. Votre nom, votre e-mail, vos photos et vos repas ne sont pas transmis à ces services.",
              "Sur iOS, après la connexion, nous vous **demandons d’abord si vous autorisez le suivi publicitaire**, et vous pouvez utiliser toutes les fonctionnalités de l’Application même si vous refusez.",
              "Vous pouvez supprimer votre compte **directement dans l’Application**, et vos photos et vos repas sont supprimés avec lui.",
            ],
          },
          { p: "Pour toute question, contactez-nous à [contact@joowonkoh.com](contact)." },
        ],
      },
      {
        h: "2. Informations collectées",
        blocks: [
          {
            ul: [
              "**Adresse e-mail** — Reçue via la connexion avec Apple ou Google. Elle sert uniquement à identifier la personne connectée.",
              "**Nom affiché** — Le nom visible par les membres de vos groupes. Vous le choisissez vous-même et pouvez le modifier à tout moment.",
              "**Photos de repas** — Les photos que vous prenez ou choisissez dans votre album. Elles sont la raison d’être de l’Application.",
              "**Date et moment du repas** — Nécessaires pour savoir de quel repas de quel jour il s’agit.",
              "**Jeton push de l’appareil** — Enregistré pour savoir où envoyer les notifications.",
              "**Commentaires** — Les messages laissés sur les repas des personnes du même groupe. Visibles uniquement par les membres de ce groupe.",
              "**Photo de profil** — Une photo que vous ajoutez vous-même. Visible uniquement par les personnes du même groupe que vous.",
              "**Signalements et blocages** — Qui a signalé quoi et pourquoi, et qui vous avez bloqué. Utilisés uniquement pour traiter les contenus inappropriés.",
              "**Identifiant de compte** — Une chaîne aléatoire créée automatiquement à l’inscription. Il sert uniquement à relier les photos et les repas à leur propriétaire et, contrairement au nom ou à l’e-mail, il n’apparaît jamais à l’écran.",
            ],
          },
          { p: "Les informations suivantes sont traitées pour la publicité et les statistiques d’utilisation." },
          {
            ul: [
              "**Données d’utilisation de l’Application** — Écrans consultés et fonctionnalités utilisées, ID d’instance de l’application, type d’appareil et système d’exploitation, région approximative. Elles servent à savoir quelles fonctionnalités sont utilisées et à améliorer l’Application, et sont traitées par Google Analytics for Firebase.",
              "**Identifiant publicitaire et données publicitaires** — L’IDFA sur iOS ou l’identifiant publicitaire sur Android, ainsi que les données d’affichage et de clic des publicités. Ils servent à afficher des publicités et à mesurer leurs performances, et sont traités par Google AdMob. Sur iOS, si vous refusez « Autoriser les demandes de suivi des apps », l’IDFA n’est pas utilisé et des publicités non personnalisées sont affichées.",
            ],
          },
          { p: "L’Application n’accède pas à votre position précise, à vos contacts, à votre historique d’appels, à vos données de santé ni à vos informations de paiement." },
        ],
      },
      {
        h: "3. Qui peut voir quoi",
        blocks: [
          {
            p: "Les photos et les repas ne sont visibles que par les personnes du même groupe. Cette restriction est **appliquée dans la base de données elle-même** (Row Level Security), et pas seulement dans l’interface de l’Application : même en modifiant l’Application ou en imitant ses requêtes réseau, il est impossible de récupérer les repas d’autrui.",
          },
          { p: "Le stockage des photos est privé, et les liens permettant de voir les photos ne sont valides que pour une courte durée." },
          {
            p: "Les jetons push sont conservés dans une table distincte que vous seul pouvez lire. Ils ne sont pas visibles, même par les personnes du même groupe, car connaître un jeton permettrait d’envoyer n’importe quelle notification à cet appareil.",
          },
          {
            p: "Les commentaires et les réactions ne sont visibles **qu’au sein du groupe où ils ont été laissés**. Même sur la même photo, les membres d’autres groupes ne les voient pas. Les contenus que vous signalez ou bloquez cessent de vous être visibles dès cet instant.",
          },
        ],
      },
      {
        h: "4. Services tiers",
        blocks: [
          {
            p: "L’Application ne vend pas de données personnelles. Votre nom, votre e-mail, vos photos et vos repas ne sont pas fournis à des tiers à des fins publicitaires ou d’analyse. L’Application utilise les services suivants.",
          },
          {
            ul: [
              "**Supabase** — Connexion et stockage des données. Les serveurs sont situés en Corée du Sud (Séoul).",
              "**Cloudflare R2** — Stockage des photos de repas et des photos de profil. Elles sont conservées de façon privée dans la région Asie-Pacifique et ne sont servies, après vérification du droit d’accès, que via des adresses valides pendant une heure.",
              "**Expo** — Envoi des notifications, via Apple APNs sur iOS et Google FCM sur Android. Le texte de la notification et le jeton de l’appareil sont transmis.",
              "**Apple / Google** — Connexion. Nous recevons votre adresse e-mail.",
              "**Google AdMob** — Publicités plein écran et publicités avec récompense. L’identifiant publicitaire, les données d’affichage et de clic des publicités et les informations sur l’appareil sont transmis.",
              "**Google Analytics for Firebase** — Statistiques d’utilisation. Les données d’utilisation de l’Application, l’ID d’instance de l’application et les informations sur l’appareil sont transmis.",
            ],
          },
          { p: "Vous pouvez consulter la façon dont Google traite ces informations sur la page [Comment Google utilise les informations des sites ou applications qui utilisent ses services](google)." },
        ],
      },
      {
        h: "5. Durée de conservation",
        blocks: [
          {
            p: "Nous conservons vos informations tant que votre compte existe et les supprimons lorsque vous supprimez votre compte. Nous ne conservons aucune copie séparée. Les statistiques d’utilisation ne sont pas liées à votre compte et sont supprimées au bout de 2 mois, selon le paramètre par défaut de Google Analytics.",
          },
        ],
      },
      {
        h: "6. Suppression du compte",
        blocks: [
          { p: "Vous pouvez supprimer votre compte directement dans l’Application : **Moi > Supprimer le compte**." },
          {
            p: "La suppression efface définitivement votre profil et votre nom affiché, votre photo de profil, les fichiers photo publiés, vos repas, commentaires, réactions, signalements et blocages, vos adhésions aux groupes et vos jetons push. Elle est irréversible.",
          },
          {
            p: "Les groupes que vous avez créés passent au membre restant le plus ancien. S’il ne reste personne, le groupe est supprimé lui aussi. Le départ d’une personne ne fait jamais disparaître le groupe pour les autres.",
          },
        ],
      },
      {
        h: "7. Vos droits",
        blocks: [
          {
            ul: [
              "Vous pouvez modifier votre nom affiché à tout moment dans l’Application.",
              "Vous pouvez supprimer immédiatement votre compte et toutes vos données grâce à la méthode décrite au point 6 ci-dessus. Si vous avez déjà désinstallé l’Application, consultez la page [Suppression du compte](deleteAccount).",
              "Vous pouvez débloquer quelqu’un à tout moment dans Moi > Personnes bloquées.",
              "Vous pouvez désactiver les notifications à tout moment dans les réglages de votre appareil.",
              "Vous pouvez désactiver le suivi publicitaire ou supprimer votre identifiant publicitaire à tout moment : sur iOS dans Réglages > Confidentialité et sécurité > Suivi, et sur Android dans Paramètres > Google > Annonces.",
              "Pour toute autre demande d’accès, de rectification ou de suppression, contactez-nous à l’adresse e-mail indiquée ci-dessus.",
            ],
          },
        ],
      },
      {
        h: "8. Données des enfants",
        blocks: [
          {
            p: "L’Application ne s’adresse pas aux enfants de moins de 14 ans, et nous ne collectons pas sciemment d’informations auprès d’utilisateurs de cet âge.",
          },
        ],
      },
      {
        h: "9. Modifications de la politique",
        blocks: [
          {
            p: "La présente politique peut être modifiée pour tenir compte de l’évolution de la loi ou du service. Si les données traitées changent, nous mettrons à jour cette politique ainsi que sa date de « Dernière mise à jour » avant la publication de la version qui inclut la fonctionnalité concernée.",
          },
        ],
      },
    ],
  },

  deleteAccount: {
    title: "Supprimer son compte 네밥내밥",
    description:
      "Comment supprimer votre compte 네밥내밥 ainsi que les photos et les repas publiés. Vous pouvez le faire directement dans l’Application, ou en faire la demande par e-mail si vous ne l’avez plus.",
    updatedAt: "18 septembre 2026",
    mailSubject: "[네밥내밥] Demande de suppression de compte",
    sections: [
      {
        h: "Supprimer directement dans l’appli",
        blocks: [
          { p: "C’est la méthode la plus rapide. Pas de demande à attendre : la suppression est immédiate." },
          {
            ol: [
              "Ouvrez 네밥내밥 et touchez l’onglet **Moi** en bas de l’écran.",
              "Touchez **Supprimer le compte**.",
              "Saisissez **supprimer** pour confirmer : le bouton devient alors actif.",
            ],
          },
          {
            p: "L’onglet Moi est toujours visible, même si vous n’êtes dans aucun groupe. Vous pouvez supprimer votre compte même si vous venez d’ouvrir l’Application pour la première fois et que vous vous êtes seulement connecté.",
          },
        ],
      },
      {
        h: "Si vous n’avez plus l’appli",
        blocks: [
          {
            p: "Si vous avez changé d’appareil ou déjà désinstallé l’Application, faites votre demande par e-mail. Envoyez-la depuis l’adresse e-mail utilisée lors de l’inscription afin que nous puissions vérifier votre identité.",
          },
          { p: "Destinataire : [contact@joowonkoh.com](deleteMail)" },
          { p: "Nous traitons la demande sous 7 jours ouvrés et vous répondons avec le résultat." },
        ],
      },
      {
        h: "Ce qui est supprimé",
        blocks: [
          { p: "Les éléments suivants sont supprimés **immédiatement et de façon irréversible**." },
          {
            ul: [
              "Le compte et les informations de connexion (adresse e-mail, identifiant de compte)",
              "Le nom affiché",
              "Tous les fichiers photo de repas publiés",
              "Les repas enregistrés et leurs dates",
              "Les réactions laissées sur les repas des autres",
              "Les adhésions aux groupes",
              "Les jetons push de l’appareil enregistrés pour recevoir les notifications",
            ],
          },
          {
            p: "Les groupes que vous avez créés ne disparaissent pas. Ils passent au membre restant le plus ancien, et s’il ne reste personne, le groupe est supprimé lui aussi. Les données des autres ne sont jamais supprimées avec les vôtres.",
          },
        ],
      },
      {
        h: "Combien de temps restent les données",
        blocks: [
          {
            p: "Il n’y a pas de durée de conservation : les données sont supprimées au moment où vous touchez Supprimer. Les copies restant sur les supports de sauvegarde disparaissent elles aussi dans un délai maximal de 30 jours, selon le cycle de sauvegarde.",
          },
        ],
      },
      {
        h: "Voir aussi",
        blocks: [{ p: "Les informations que nous collectons et pourquoi sont décrites dans la [Politique de confidentialité](privacy)." }],
      },
    ],
  },
};

export default fr;
