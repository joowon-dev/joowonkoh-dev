import type { Copy } from "./types";

const de: Copy = {
  appName: "Dein Essen, mein Essen",
  quote: ["„", "“"],
  store: { download: "Herunterladen" },

  landing: {
    meta: {
      title: "Dein Essen, mein Essen",
      description:
        "Füll Frühstück, Mittag- und Abendessen Fach für Fach mit Fotos auf deinem Tablett und achtet in Familie oder Freundeskreis aufeinander. Info- und Supportseite der iOS- und Android-App „Dein Essen, mein Essen“.",
      ogTitle: "Dein Essen, mein Essen – statt zu fragen „Hast du gegessen?“",
      ogDescription:
        "Füll Frühstück, Mittag- und Abendessen Fach für Fach mit Fotos auf deinem Tablett und achtet in Familie oder Freundeskreis aufeinander.",
      ogAlt: "Infobild von „Dein Essen, mein Essen“: ein weißes Tablett auf eigelbem Hintergrund, nur das Mittagsfach ist tomatenrot gefüllt",
    },
    trayTitle: "Tablett von „Dein Essen, mein Essen“",
    greetings: [
      "Was hast du heute gegessen?",
      "Isst du auch genug?",
      "War das Mittagessen lecker?",
      "Heute Abend essen wir in Gedanken zusammen",
    ],
    tagline: "Ein Foto pro Mahlzeit – teil dein Tablett von heute mit Familie und Freunden.",
    together: {
      title: "Ein gemeinsamer Tisch",
      lead: "Die Tabletts von 2–12 Leuten, die per Einladungscode zusammengekommen sind, stehen auf einem Tisch. Wer noch nicht gegessen hat, siehst du, ohne zu fragen.",
    },
    featuresTitle: "Das kann die App",
    features: [
      { title: "Fach für Fach", tail: "Knipsen oder aus dem Album wählen – rein ins Fach" },
      { title: "Ausschnitt selbst wählen", tail: "Schieben und zoomen, damit nichts abgeschnitten wird" },
      { title: "Leere Fächer anstupsen", tail: "Noch nichts gegessen? Ein sanfter Stupser" },
      { title: "Ein Tablett", tail: "Einmal posten, in allen Gruppen sichtbar" },
      { title: "Reaktionen · Kommentare", tail: "Ein „Sieht lecker aus“ reicht völlig" },
      { title: "Der Tag auf einem Bild", tail: "Das Tablett des Tages in deinen Fotos speichern" },
    ],
    statement: { before: "Statt „Hast du gegessen?“ spricht zuerst das ", em: "leere Fach", after: "." },
    story: [
      "Wer allein lebt, lässt beim Essen als Erstes nach. Nachprüfen kann man das nur, indem man anruft und fragt – und die Antwort lautet meistens „Ja, hab gegessen“.",
      "Also haben wir es sichtbar gemacht, statt zu fragen. Das ist keine App, die das Nörgeln automatisiert, sondern eine, die dir die Mühe des Nachfragens abnimmt. Deshalb tadelt sie leere Fächer nie. Es gibt drei Mahlzeiten, Snacks sind eine Zugabe.",
    ],
    faqTitle: "Häufige Fragen",
    faq: [
      {
        q: "Wer kann meine Fotos sehen?",
        a: "Nur Leute, die in derselben Gruppe sind wie du. Diese Beschränkung steckt in der Datenbank selbst, nicht nur in der App-Oberfläche – selbst mit einer manipulierten App kommt niemand an die Mahlzeiten anderer. Der Fotospeicher ist privat, und Fotolinks gelten nur kurz.",
      },
      {
        q: "Kann ich gleichzeitig in einer Familien- und einer Freundesgruppe sein?",
        a: "Ja. Jede Person hat nur ein Tablett. Postest du dein Frühstück einmal, erscheint es in allen Gruppen, in denen du bist. Du musst nicht für jede Gruppe extra posten.",
      },
      {
        q: "Wie oft kann ich anstupsen?",
        a: "Damit daraus keine Benachrichtigungsflut wird, zählt der Server die Stupser pro Tag. Sind sie aufgebraucht, kannst du dir mit einer kurzen Werbung ein paar weitere holen – auch dafür gibt es ein Tageslimit. Das Snackfach ist eine Zugabe und kann nicht angestupst werden.",
      },
      {
        q: "Gibt es Werbung?",
        a: "Es gibt Vollbildwerbung, die gelegentlich erscheint, nachdem du ein Foto geschlossen oder einen Upload abgeschlossen hast, und Werbung mit Belohnung, die du nur ansiehst, wenn du mehr Stupser möchtest. Dauerhaft eingeblendete Banner gibt es nicht. Außerdem erfassen wir Nutzungsstatistiken, um die App zu verbessern. Die Details stehen in der Datenschutzerklärung.",
      },
      {
        q: "Was passiert, wenn ich mein Konto lösche?",
        a: "Du kannst es direkt in der App löschen. Alle deine Fotos und Einträge verschwinden und lassen sich nicht wiederherstellen. Gruppen, die du erstellt hast, gehen an das Mitglied, das am längsten dabei ist. Ist niemand mehr da, wird auch die Gruppe gelöscht.",
      },
    ],
    closing: {
      title: "Heute Abend essen wir in Gedanken zusammen",
      body: "Ideen für neue Funktionen oder Fragen? Schreib uns jederzeit eine E-Mail.",
      privacy: "Datenschutzerklärung",
      deleteAccount: "Konto löschen – so geht’s",
    },
  },

  join: {
    meta: {
      title: "Schon gegessen? · Dein Essen, mein Essen",
      description:
        "Du bist an den Tisch eingeladen. Halte fest, was du heute gegessen hast. Kopier den Einladungscode und gib ihn in der App ein, um der Gruppe beizutreten.",
      ogTitle: "Schon gegessen?",
      ogDescription: "Du bist an den Tisch eingeladen · Halte fest, was du heute gegessen hast",
      ogAlt: "Einladungsbild: ein weißes Tablett mit vier leeren Fächern in der Mitte eines hell-eigelben Hintergrunds, daneben ein tomatenroter Löffel und eine mintgrüne Gabel",
    },
    trayTitle: "Ein leeres Tablett, auf dem noch nichts liegt",
    title: "Schon gegessen?",
    sub: "Halte fest, was du heute gegessen hast!",
    pill: "Du bist eingeladen · Gemeinsam füllen",
    step1: "Einladungscode kopieren",
    copyAria: "Einladungscode {code} kopieren",
    noCodeAria: "Kein Einladungscode",
    copied: "Kopiert!",
    missing: ["Im Link fehlt der Einladungscode oder er ist abgeschnitten.", "Bitte lass dir den Code noch einmal schicken."],
    step2: "App installieren und eingeben",
    hint: { before: "In der App: Tab ", tab: "Gruppen", after: "", add: "Gruppe hinzufügen", join: "Mit Einladungscode beitreten" },
    openInApp: "App schon da? · In der App öffnen",
    limit: "Max. 12 Personen pro Gruppe. Ist sie voll, ist kein Beitritt möglich.",
    about: "Über Dein Essen, mein Essen",
    privacy: "Datenschutz",
  },

  shell: {
    homeAria: "Startseite von Dein Essen, mein Essen",
    about: "Über die App",
    privacy: "Datenschutz",
    deleteAccount: "Konto löschen",
    language: "Sprache",
  },

  legal: {
    badge: "Dein Essen, mein Essen · Legal",
    updated: "Zuletzt aktualisiert",
    koreanPrevails: "Dies ist eine Übersetzung. Bei Abweichungen von der koreanischen Fassung ist die koreanische Fassung maßgeblich.",
    koreanLink: "Koreanische Fassung ansehen",
  },

  privacy: {
    title: "Datenschutzerklärung – Dein Essen, mein Essen",
    description:
      "Welche Daten die iOS- und Android-App „Dein Essen, mein Essen“ verarbeitet, wer deine Fotos und Mahlzeiteneinträge sehen kann und wie du dein Konto löschst.",
    updatedAt: "16. Oktober 2026",
    sections: [
      {
        h: "1. Überblick",
        blocks: [
          {
            p: "„Dein Essen, mein Essen“ (네밥내밥, im Folgenden „die App“) ist eine iOS- und Android-Anwendung, mit der du deine täglichen Mahlzeiten mit Fotos festhältst und mit den Personen in derselben Gruppe teilst. Diese Erklärung beschreibt, welche Daten die App verarbeitet, zu welchem Zweck und welche Wahlmöglichkeiten du hast.",
          },
          { p: "Kurz zusammengefasst:" },
          {
            ul: [
              "Fotos und Mahlzeiteneinträge sind **nur für Personen in derselben Gruppe wie du** sichtbar.",
              "Die App zeigt **Vollbildwerbung und Werbung mit Belohnung von Google AdMob**. Vollbildwerbung erscheint gelegentlich bildschirmfüllend, nachdem du ein Foto geschlossen oder einen Upload abgeschlossen hast. Werbung mit Belohnung siehst du nur, wenn du sie selbst auswählst, nachdem deine Stupser aufgebraucht sind. Dauerhaft eingeblendete Bannerwerbung gibt es nicht. Für Nutzungsstatistiken verwenden wir Google Analytics for Firebase. Name, E-Mail-Adresse, Fotos und Mahlzeiteneinträge werden nicht an diese Dienste weitergegeben.",
              "Unter iOS **fragen wir nach der Anmeldung zuerst**, ob du Werbe-Tracking erlaubst. Auch wenn du ablehnst, kannst du alle Funktionen der App uneingeschränkt nutzen.",
              "Du kannst dein Konto **direkt in der App** löschen. Dabei werden auch deine Fotos und Einträge gelöscht.",
            ],
          },
          { p: "Bei Fragen wende dich bitte an [contact@joowonkoh.com](contact)." },
        ],
      },
      {
        h: "2. Welche Daten wir erheben",
        blocks: [
          {
            ul: [
              "**E-Mail-Adresse** – erhalten wir über die Anmeldung mit Apple oder Google. Sie dient nur dazu, festzustellen, wer angemeldet ist.",
              "**Anzeigename** – der Name, den die Personen in deinen Gruppen sehen. Du legst ihn selbst fest und kannst ihn jederzeit ändern.",
              "**Mahlzeitenfotos** – Fotos, die du selbst aufnimmst oder aus deinem Album auswählst. Sie sind der eigentliche Zweck der App.",
              "**Datum und Tageszeit der Mahlzeit** – nötig, um zuzuordnen, welche Mahlzeit an welchem Tag gemeint ist.",
              "**Push-Token des Geräts** – wird gespeichert, damit wir wissen, wohin Benachrichtigungen gesendet werden.",
              "**Kommentare** – Texte, die du bei Mahlzeiten von Personen aus derselben Gruppe hinterlässt. Nur für Personen in dieser Gruppe sichtbar.",
              "**Profilfoto** – ein Foto, das du selbst hochlädst. Nur für Personen in derselben Gruppe wie du sichtbar.",
              "**Meldungs- und Blockierdaten** – wer was aus welchem Grund gemeldet hat und wen du blockiert hast. Werden nur zur Bearbeitung unangemessener Inhalte verwendet.",
              "**Kontokennung** – eine zufällige Zeichenfolge, die bei der Registrierung automatisch erstellt wird. Sie dient nur dazu, Fotos und Einträge ihrer Besitzerin oder ihrem Besitzer zuzuordnen, und wird anders als Name oder E-Mail-Adresse nie angezeigt.",
            ],
          },
          { p: "Für Werbung und Nutzungsstatistiken werden folgende Daten verarbeitet." },
          {
            ul: [
              "**App-Nutzungsdaten** – aufgerufene Bildschirme und genutzte Funktionen, App-Instanz-ID, Gerätetyp und Betriebssystem sowie ungefähre Region. Sie dienen dazu, zu verstehen, welche Funktionen genutzt werden, und die App zu verbessern. Verarbeitet werden sie von Google Analytics for Firebase.",
              "**Werbe-ID und Werbedaten** – die IDFA unter iOS bzw. die Werbe-ID unter Android sowie Daten zu Werbeeinblendungen und -klicks. Sie dienen dazu, Werbung anzuzeigen und ihren Erfolg zu messen. Verarbeitet werden sie von Google AdMob. Lehnst du unter iOS „Apps erlauben, Tracking anzufordern“ ab, wird die IDFA nicht verwendet und es wird nicht personalisierte Werbung angezeigt.",
            ],
          },
          { p: "Die App greift nicht auf genaue Standortdaten, Kontakte, Anrufliste, Gesundheitsdaten oder Zahlungsdaten zu." },
        ],
      },
      {
        h: "3. Wer was sehen kann",
        blocks: [
          {
            p: "Fotos und Mahlzeiteneinträge sind nur für Personen in derselben Gruppe sichtbar. Diese Beschränkung ist **in der Datenbank selbst verankert** (Row Level Security) und nicht nur in der App-Oberfläche. Selbst wer die App verändert oder ihre Netzwerkanfragen nachahmt, kann die Mahlzeiten anderer nicht abrufen.",
          },
          { p: "Der Fotospeicher ist privat, und Links zum Ansehen von Fotos gelten nur für kurze Zeit." },
          {
            p: "Push-Tokens liegen in einer separaten Tabelle, die nur du selbst lesen kannst. Auch Personen in derselben Gruppe sehen sie nicht, denn wer einen Token kennt, könnte beliebige Benachrichtigungen an dieses Gerät senden.",
          },
          {
            p: "Kommentare und Reaktionen sind **nur in der Gruppe sichtbar, in der sie hinterlassen wurden**. Selbst beim selben Foto sehen Personen aus anderen Gruppen sie nicht. Inhalte, die du meldest oder blockierst, sind ab diesem Moment für dich nicht mehr sichtbar.",
          },
        ],
      },
      {
        h: "4. Dienste Dritter",
        blocks: [
          {
            p: "Die App verkauft keine personenbezogenen Daten. Name, E-Mail-Adresse, Fotos und Mahlzeiteneinträge werden nicht zu Werbe- oder Analysezwecken an Dritte weitergegeben. Die App nutzt folgende Dienste.",
          },
          {
            ul: [
              "**Supabase** – Anmeldung und Datenspeicherung. Die Server stehen in Südkorea (Seoul).",
              "**Cloudflare R2** – Speicherung von Mahlzeiten- und Profilfotos. Die Fotos werden privat in der Region Asien-Pazifik gespeichert und erst nach Prüfung der Berechtigung über Adressen ausgeliefert, die nur eine Stunde gültig sind.",
              "**Expo** – Zustellung von Benachrichtigungen, unter iOS über Apple APNs, unter Android über Google FCM. Übermittelt werden der Benachrichtigungstext und der Geräte-Token.",
              "**Apple / Google** – Anmeldung. Wir erhalten deine E-Mail-Adresse.",
              "**Google AdMob** – Vollbildwerbung und Werbung mit Belohnung. Übermittelt werden Werbe-ID, Daten zu Werbeeinblendungen und -klicks sowie Gerätedaten.",
              "**Google Analytics for Firebase** – Nutzungsstatistiken. Übermittelt werden App-Nutzungsdaten, App-Instanz-ID und Gerätedaten.",
            ],
          },
          { p: "Wie Google diese Daten verarbeitet, erfährst du unter [Wie Google Daten von Websites und Apps verwendet, auf denen Google-Dienste genutzt werden](google)." },
        ],
      },
      {
        h: "5. Speicherdauer",
        blocks: [
          {
            p: "Wir speichern die Daten, solange dein Konto besteht, und löschen sie, wenn du dein Konto löschst. Separate Kopien bewahren wir nicht auf. Nutzungsstatistiken sind nicht an dein Konto gebunden und werden gemäß der Standardeinstellung von Google Analytics nach 2 Monaten gelöscht.",
          },
        ],
      },
      {
        h: "6. Konto löschen",
        blocks: [
          { p: "Du kannst dein Konto direkt in der App löschen: **Ich > Konto löschen**." },
          {
            p: "Dabei werden Profil und Anzeigename, Profilfoto, hochgeladene Fotodateien, Mahlzeiteneinträge, Kommentare, Reaktionen, Meldungs- und Blockierdaten, Gruppenmitgliedschaften und Push-Tokens vollständig gelöscht. Das lässt sich nicht rückgängig machen.",
          },
          {
            p: "Gruppen, die du erstellt hast, gehen an das verbleibende Mitglied, das am längsten dabei ist. Ist niemand mehr übrig, wird auch die Gruppe gelöscht. Wenn eine Person geht, verschwindet die Gruppe für die anderen nicht.",
          },
        ],
      },
      {
        h: "7. Deine Rechte",
        blocks: [
          {
            ul: [
              "Deinen Anzeigenamen kannst du jederzeit in der App ändern.",
              "Dein Konto und alle Einträge kannst du mit dem Weg aus Abschnitt 6 sofort löschen. Hast du die App bereits entfernt, sieh dir bitte [Konto löschen](deleteAccount) an.",
              "Blockierungen kannst du jederzeit unter Ich > Blockierte Personen aufheben.",
              "Benachrichtigungen kannst du jederzeit in den Geräteeinstellungen ausschalten.",
              "Werbe-Tracking kannst du jederzeit ausschalten oder deine Werbe-ID löschen – unter iOS in Einstellungen > Datenschutz & Sicherheit > Tracking, unter Android in Einstellungen > Google > Anzeigen.",
              "Für sonstige Anfragen zu Auskunft, Berichtigung oder Löschung wende dich bitte an die oben genannte E-Mail-Adresse.",
            ],
          },
        ],
      },
      {
        h: "8. Daten von Kindern",
        blocks: [
          {
            p: "Die App richtet sich nicht an Kinder unter 14 Jahren, und wir erheben nicht wissentlich Daten von Nutzerinnen und Nutzern in diesem Alter.",
          },
        ],
      },
      {
        h: "9. Änderungen dieser Erklärung",
        blocks: [
          {
            p: "Diese Erklärung kann geändert werden, um Gesetzesänderungen oder Änderungen am Dienst zu berücksichtigen. Ändert sich, welche Daten verarbeitet werden, aktualisieren wir diese Erklärung samt dem Datum „Zuletzt aktualisiert“, bevor die Version mit der betreffenden Funktion veröffentlicht wird.",
          },
        ],
      },
    ],
  },

  deleteAccount: {
    title: "Konto löschen – Dein Essen, mein Essen",
    description:
      "So löschst du dein Konto bei „Dein Essen, mein Essen“ und die hochgeladenen Fotos und Mahlzeiteneinträge. Du kannst es direkt in der App löschen oder ohne App per E-Mail die Löschung beantragen.",
    updatedAt: "18. September 2026",
    mailSubject: "[네밥내밥] Antrag auf Kontolöschung",
    sections: [
      {
        h: "Direkt in der App löschen",
        blocks: [
          { p: "Das ist der schnellste Weg. Du musst auf keine Bearbeitung warten – das Konto wird sofort gelöscht." },
          {
            ol: [
              "Öffne „Dein Essen, mein Essen“ und tippe unten auf den Tab **Ich**.",
              "Tippe auf **Konto löschen**.",
              "Gib zur Bestätigung **löschen** ein, dann wird die Schaltfläche aktiv.",
            ],
          },
          {
            p: "Der Tab „Ich“ ist immer sichtbar, auch wenn du in keiner Gruppe bist. Du kannst dein Konto auch löschen, wenn du die App gerade erst geöffnet und dich nur angemeldet hast.",
          },
        ],
      },
      {
        h: "Wenn du die App nicht mehr hast",
        blocks: [
          {
            p: "Wenn du dein Gerät gewechselt oder die App schon entfernt hast, beantrage die Löschung bitte per E-Mail. Schick sie bitte von der E-Mail-Adresse, mit der du dich registriert hast, damit wir dich identifizieren können.",
          },
          { p: "An: [contact@joowonkoh.com](deleteMail)" },
          { p: "Wir bearbeiten den Antrag innerhalb von 7 Werktagen und melden uns mit dem Ergebnis." },
        ],
      },
      {
        h: "Was gelöscht wird",
        blocks: [
          { p: "Folgendes wird **sofort und unwiderruflich** gelöscht." },
          {
            ul: [
              "Konto und Anmeldedaten (E-Mail-Adresse, Kontokennung)",
              "Anzeigename",
              "Alle hochgeladenen Mahlzeitenfotos",
              "Mahlzeiteneinträge und Daten",
              "Reaktionen auf Mahlzeiten anderer",
              "Gruppenmitgliedschaften",
              "Für Benachrichtigungen gespeicherte Push-Tokens des Geräts",
            ],
          },
          {
            p: "Gruppen, die du erstellt hast, verschwinden nicht. Sie gehen an das verbleibende Mitglied, das am längsten dabei ist. Ist niemand mehr übrig, wird auch die Gruppe gelöscht. Einträge anderer werden dabei nie mitgelöscht.",
          },
        ],
      },
      {
        h: "Wie lange etwas bleibt",
        blocks: [
          {
            p: "Eine Aufbewahrungsfrist gibt es nicht. Die Daten werden in dem Moment gelöscht, in dem du auf Löschen tippst. Kopien auf Sicherungsmedien verschwinden je nach Sicherungszyklus spätestens innerhalb von 30 Tagen.",
          },
        ],
      },
      {
        h: "Siehe auch",
        blocks: [{ p: "Welche Daten wir warum erheben, steht in der [Datenschutzerklärung](privacy)." }],
      },
    ],
  },
};

export default de;
