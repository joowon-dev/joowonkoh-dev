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
        a: "Oben auf den Bildschirmen Kamera, Gruppen und Ich gibt es eine einzeilige Werbung, die passend zur App gestaltet ist. Dazu kommen Vollbildwerbung, die gelegentlich erscheint, nachdem du ein Foto geschlossen oder einen Upload abgeschlossen hast, und Werbung mit Belohnung, die du nur ansiehst, wenn du mehr Stupser möchtest. Außerdem erfassen wir Nutzungsstatistiken, um die App zu verbessern. Die Details stehen in der Datenschutzerklärung.",
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
    terms: "Nutzungsbedingungen",
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
    updatedAt: "6. November 2026",
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
              "Die App zeigt **native Werbung, Vollbildwerbung und Werbung mit Belohnung von Google AdMob**. Native Werbung erscheint als einzelne Zeile, passend zum Design der App, oben auf den Bildschirmen Kamera, Gruppen und Ich. Vollbildwerbung erscheint gelegentlich bildschirmfüllend, nachdem du ein Foto geschlossen oder einen Upload abgeschlossen hast. Werbung mit Belohnung siehst du nur, wenn du sie selbst auswählst, nachdem deine Stupser aufgebraucht sind. Für Nutzungsstatistiken verwenden wir Google Analytics for Firebase. Name, E-Mail-Adresse, Fotos und Mahlzeiteneinträge werden nicht an diese Dienste weitergegeben.",
              "Unter iOS **fragen wir nach der Anmeldung zuerst**, ob du Werbe-Tracking erlaubst. Auch wenn du ablehnst, kannst du alle Funktionen der App uneingeschränkt nutzen.",
              "Du kannst dein Konto **direkt in der App** löschen. Dabei werden auch deine Fotos und Einträge gelöscht.",
              "In der **Gemeinsamen Kantine** (einem Echtzeit-Raum, in dem man sich ohne Worte zusammensetzt und isst) sind dein Name, deine Figur und deine Bewegungen für Personen im selben Raum sichtbar. In der Solo-Kantine, die alle betreten können, werden deine Fotos **nur angezeigt, wenn du „Mein Essen zeigen“ einschaltest**.",
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
              "**Spitznamen** – Namen, die du Personen in deinen Gruppen gibst. Nur du siehst sie; die Person mit dem Spitznamen erfährt davon nichts.",
              "**Widget-Schlüssel und Widget-Push-Token** – werden pro Gerät gespeichert, wenn du das Widget auf dem Home-Bildschirm nutzt, damit das Widget die heutigen Tabletts der ausgewählten Personen abrufen und sich neu zeichnen kann, sobald eine neue Mahlzeit hochgeladen wird. Sie werden gelöscht, wenn du dich abmeldest oder dein Konto löschst.",
              "**Nutzungsdaten der Gemeinsamen Kantine** – die Kantine, die du betreten hast, dein Sitzplatz, wohin du gegangen bist, die angetippten Grüße (z. B. „Guten Appetit!“) sowie die Mahlzeiten auf deinem Tablett und die ausgewählten Fotos. Sie dienen nur dazu, sie Personen im selben Raum zu zeigen, solange du dort bist, und werden gelöscht, wenn du den Raum verlässt. Kommst du als Gast über einen Browser außerhalb der App, wird auf diesem Gerät eine zufällige Gastkennung gespeichert.",
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
          {
            p: "Das Widget auf dem Home-Bildschirm folgt denselben Regeln wie die App selbst. Da Widgets auch auf dem Sperrbildschirm erscheinen können, wird zusätzlich noch einmal eingeschränkt, sodass auch Fotos von Personen, die dich blockiert haben, nicht angezeigt werden.",
          },
          {
            p: "In der **Gemeinsamen Kantine** sehen Personen im selben Raum in Echtzeit deinen Anzeigenamen („Gast“ bei Besuchern von außerhalb der App), die Farbe deiner Figur, deinen Platz und deine Bewegungen sowie deine Grüße. Einen Chat gibt es nicht.",
          },
          {
            ul: [
              "Den **Gruppentisch** können nur Personen aus dieser Gruppe betreten. Der Server prüft Anmeldung und Gruppenmitgliedschaft. Gruppenmitglieder sehen die Fotos der heutigen Mahlzeiten, die jede Person ausgewählt hat.",
              "Die **Solo-Kantine** kann jeder betreten, deshalb sind Fotos **standardmäßig ausgeblendet** und erscheinen als Zeichnungen von Reis, Suppe und Beilagen. Nur wenn du „Mein Essen den Leuten in der Kantine zeigen“ einschaltest, werden die für dein Tablett ausgewählten Fotos über Adressen, die nur eine Stunde gültig sind, an die Personen in diesem Raum übermittelt. Du kannst das jederzeit ausschalten.",
              "Du kannst andere Personen mit „Ausblenden“ für dich unsichtbar machen.",
            ],
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
              "**Google AdMob** – Native Werbung, Vollbildwerbung und Werbung mit Belohnung. Übermittelt werden Werbe-ID, Daten zu Werbeeinblendungen und -klicks sowie Gerätedaten.",
              "**Google Analytics for Firebase** – Nutzungsstatistiken. Übermittelt werden App-Nutzungsdaten, App-Instanz-ID und Gerätedaten.",
              "**Cloudflare Workers und Durable Objects** – Bildschirm der Gemeinsamen Kantine und Echtzeitverbindung. Verarbeitet werden Anzeigename, Platz, Bewegungen und Grüße, solange du in einem Raum bist, sowie die Adressen der Fotos, die du zeigen möchtest; sie werden gelöscht, wenn du den Raum verlässt. Zur Fehlerbehebung wird ein Teil der Anfrageprotokolle einige Tage aufbewahrt.",
              "**Apple APNs (Widget)** – benachrichtigt das iOS-Widget über den Widget-Push-Token, damit es sich neu zeichnet, sobald eine neue Mahlzeit hochgeladen wird.",
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
          {
            p: "Platz, Bewegungen, Grüße und Fotoadressen in der Gemeinsamen Kantine werden gelöscht, wenn du den Raum verlässt. Gespeichert bleibt nur, wie viele Personen gerade in jeder Kantine sind.",
          },
        ],
      },
      {
        h: "6. Konto löschen",
        blocks: [
          { p: "Du kannst dein Konto direkt in der App löschen: **Ich > Konto löschen**." },
          {
            p: "Dabei werden Profil und Anzeigename, Profilfoto, hochgeladene Fotodateien, Mahlzeiteneinträge, Kommentare, Reaktionen, Meldungs- und Blockierdaten, Gruppenmitgliedschaften, Push-Tokens, Spitznamen (die du vergeben hast und die dir gegeben wurden) sowie Widget-Schlüssel und Widget-Push-Tokens vollständig gelöscht. Das lässt sich nicht rückgängig machen.",
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

  terms: {
    title: "Nutzungsbedingungen – Dein Essen, mein Essen",
    description:
      "Die Nutzungsbedingungen von „Dein Essen, mein Essen“, der App zum Teilen von Mahlzeitenfotos mit den Personen in deinen Gruppen, sowie der Umfang der Haftung und Angaben zum Betreiber.",
    updatedAt: "6. November 2026",
    sections: [
      {
        h: "Artikel 1 (Zweck)",
        blocks: [
          {
            p: "Diese Bedingungen regeln die Nutzung der iOS- und Android-App „Dein Essen, mein Essen“ (der „Dienst“), die von 바리바리스튜디오 (Baribari Studio; Inhaber: 고주원 (Joowon Koh); der „Betreiber“) angeboten wird, sowie die Rechte, Pflichten und Verantwortlichkeiten von Betreiber und Nutzern.",
          },
        ],
      },
      {
        h: "Artikel 2 (Inhalt des Dienstes)",
        blocks: [
          {
            ol: [
              "Mit dem Dienst können Nutzer Fotos ihrer Mahlzeiten festhalten und Fotos, Reaktionen und Kommentare mit Personen in derselben Gruppe teilen.",
              "Zum Dienst gehören Funktionen wie das Erstellen von Gruppen und Einladen von Personen, Benachrichtigungen und Stupser, der Mahlzeitenkalender und Collagen, Widgets für den Home-Bildschirm sowie die Gemeinsame Kantine (ein Echtzeit-Raum, in dem man sich zusammensetzt und isst).",
              "Der Dienst ist kostenlos; auf seinen Bildschirmen wird Werbung angezeigt.",
            ],
          },
        ],
      },
      {
        h: "Artikel 3 (Geltung und Änderung der Bedingungen)",
        blocks: [
          {
            ol: [
              "Diese Bedingungen werden mit ihrer Veröffentlichung auf dieser Seite wirksam. Mit der Anmeldung beim Dienst gelten sie als vom Nutzer akzeptiert.",
              "Der Betreiber kann die Bedingungen im Rahmen der geltenden Gesetze ändern. In diesem Fall gibt er das Datum des Inkrafttretens und den Grund mindestens 7 Tage vorher auf dieser Seite bekannt, bei Änderungen zum Nachteil der Nutzer mindestens 30 Tage vorher.",
              "Nutzer, die den geänderten Bedingungen nicht zustimmen, können die Nutzung beenden, indem sie ihr Konto löschen.",
            ],
          },
        ],
      },
      {
        h: "Artikel 4 (Konto)",
        blocks: [
          {
            ol: [
              "Nutzer melden sich mit einem Apple- oder Google-Konto beim Dienst an.",
              "Nutzer können ihr Konto jederzeit in der App löschen. Dabei werden die hochgeladenen Fotos und Einträge mitgelöscht; das lässt sich nicht rückgängig machen. Details stehen unter [Konto löschen](deleteAccount).",
              "Für die Verarbeitung personenbezogener Daten gilt die [Datenschutzerklärung](privacy).",
            ],
          },
        ],
      },
      {
        h: "Artikel 5 (Inhalte der Nutzer)",
        blocks: [
          {
            ol: [
              "Die Rechte an Inhalten, die Nutzer hochladen, etwa Fotos, Kommentare und Namen, liegen bei den Nutzern.",
              "Der Betreiber nutzt diese Inhalte nur in dem Umfang, der für den Dienst nötig ist (Speichern, Anzeigen für Personen in derselben Gruppe, Erstellen verkleinerter Fotos usw.).",
              "Inhalte sind nur für Personen in derselben Gruppe sichtbar. In der Gemeinsamen Kantine sind sie in dem Umfang, den der Nutzer zum Zeigen ausgewählt hat, für Personen im selben Raum sichtbar.",
            ],
          },
        ],
      },
      {
        h: "Artikel 6 (Pflichten der Nutzer)",
        blocks: [
          { p: "Nutzer dürfen die folgenden Inhalte nicht hochladen und die folgenden Handlungen nicht vornehmen." },
          {
            ul: [
              "Obszöne oder gewalttätige Inhalte sowie Inhalte, die zu Hass oder Diskriminierung aufstacheln",
              "Inhalte, die andere belästigen oder verleumden oder deren personenbezogene Daten oder Recht am eigenen Bild verletzen",
              "Inhalte, die Urheberrechte oder andere Rechte des geistigen Eigentums Dritter verletzen",
              "Handlungen, die den ordnungsgemäßen Betrieb des Dienstes stören, sowie das wiederholte Anklicken von Werbung mit unlauteren Mitteln",
            ],
          },
          {
            p: "Nutzer können unangemessene Inhalte oder Personen in der App melden oder blockieren. Der Betreiber prüft gemeldete Inhalte und kann sie bei einem Verstoß gegen diesen Artikel löschen oder die Nutzung durch den betreffenden Nutzer einschränken.",
          },
        ],
      },
      {
        h: "Artikel 7 (Werbung)",
        blocks: [
          {
            ol: [
              "Für den Betrieb des Dienstes zeigt der Betreiber über Google AdMob native Werbung, Vollbildwerbung und Werbung mit Belohnung an.",
              "Geschäfte über Waren oder Dienstleistungen aus der Werbung kommen zwischen dem Nutzer und dem Werbetreibenden zustande; der Betreiber übernimmt für deren Inhalt keine Verantwortung.",
            ],
          },
        ],
      },
      {
        h: "Artikel 8 (Änderung und Einstellung des Dienstes)",
        blocks: [
          {
            ol: [
              "Der Dienst wird so bereitgestellt, wie er ist, und kann aus betrieblichen oder technischen Gründen geändert oder unterbrochen werden.",
              "Wird der Dienst eingestellt, kündigt der Betreiber dies nach Möglichkeit 30 Tage vorher auf dieser Seite und in der App an.",
            ],
          },
        ],
      },
      {
        h: "Artikel 9 (Haftungsbeschränkung)",
        blocks: [
          {
            ol: [
              "Der Betreiber haftet nicht für den Inhalt der von Nutzern hochgeladenen Beiträge und nicht für Streitigkeiten zwischen Nutzern. Dies gilt nicht bei Vorsatz oder grober Fahrlässigkeit des Betreibers.",
              "Der Betreiber haftet nicht für Folgen, die entstehen, weil Benachrichtigungen aufgrund von Geräteeinstellungen (ausgeschaltete Benachrichtigungen, Stummmodus, Energiesparmodus usw.) nicht ankommen.",
              "Wird der Dienst durch Naturkatastrophen oder vergleichbare höhere Gewalt unterbrochen, haftet der Betreiber nicht.",
            ],
          },
        ],
      },
      {
        h: "Artikel 10 (Streitbeilegung)",
        blocks: [
          {
            ol: [
              "Entsteht im Zusammenhang mit der Nutzung des Dienstes ein Streit, bemühen sich Betreiber und Nutzer, ihn in redlicher Absprache beizulegen.",
              "Kommt keine Einigung zustande, kann Klage bei dem nach der koreanischen Zivilprozessordnung zuständigen Gericht erhoben werden. Diese Bedingungen unterliegen dem Recht der Republik Korea.",
            ],
          },
        ],
      },
      {
        h: "Angaben zum Betreiber",
        blocks: [
          {
            ul: [
              "Firmenname: 바리바리스튜디오 (Baribari Studio)",
              "Inhaber: 고주원 (Joowon Koh)",
              "Unternehmensregisternummer: 895-14-03120",
              "Registrierungsnummer für den Versandhandel: 2026-서울서초-3693",
              "Anschrift: 서울특별시 서초구 바우뫼로 91, 2층 가2호 (91 Baumoe-ro, 2F Ga-2, Seocho-gu, Seoul, Republic of Korea)",
              "Kontakt: [contact@joowonkoh.com](contact)",
            ],
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
