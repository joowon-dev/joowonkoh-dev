import type { Privacy } from "./types";

const de: Privacy = {
  meta: {
    title: "Gehaltsuhr – Datenschutzerklärung",
    description:
      "Welche Daten die iOS- und Android-App Gehaltsuhr verarbeitet, welche Drittanbieter für Werbung, Nutzungsstatistiken und Absturzberichte genutzt werden und welche Wahlmöglichkeiten Sie haben.",
  },
  badge: "Gehaltsuhr · Legal",
  title: "Gehaltsuhr – Datenschutzerklärung",
  updated: "Zuletzt aktualisiert: 22. Oktober 2026",
  sections: [
    {
      h: "1. Überblick",
      body: [
        "Gehaltsuhr (die „App“) ist eine iOS- und Android-Anwendung, die anhand des von Ihnen eingegebenen Gehalts in Echtzeit anzeigt, wie viel Sie bisher verdient haben. Diese Erklärung beschreibt, welche Informationen die App verarbeitet, zu welchem Zweck und welche Wahlmöglichkeiten Sie haben.",
        "Kurz zusammengefasst:",
        [
          "**Das von Ihnen eingegebene Gehalt, Ihre Einstellungen und Wunschfotos verlassen Ihr Gerät nicht.** Die App hat keine Konten und keinen Server, der Ihre Daten empfängt.",
          "Für die **Anzeige von Werbung**, **Nutzungsstatistiken** und **Absturzberichte** nutzt die App jedoch Dienste von Google; dabei verarbeitet Google unter anderem Geräteinformationen.",
          "Die App **nutzt eine Werbe-ID für personalisierte Werbung.** Unter iOS wird die Werbe-ID (IDFA) nur verwendet, wenn Sie dies in der Abfrage zur App-Tracking-Transparenz (ATT) erlauben. Unter Android wird die Werbe-ID des Geräts (AAID) ohne gesonderte Abfrage verwendet; Sie können sie jederzeit in den Geräteeinstellungen abschalten. In beiden Fällen funktionieren alle Funktionen gleich.",
        ],
        "Bei Fragen wenden Sie sich bitte an {email}.",
      ],
    },
    {
      h: "2. Von Ihnen eingegebene Informationen",
      body: [
        "Alles, was Sie in der App eingeben – etwa Gehalt, Arbeitszeiten, Anzeigeeinstellungen, selbst hinzugefügte Vergleichspersonen, Wünsche (Foto, Name und Preis) und Einträge unter „Bezahlt fürs Faulenzen“ –, wird wie folgt behandelt:",
        [
          "**Es wird ausschließlich auf Ihrem Gerät gespeichert.** Unter iOS nutzt die App einen App-Group-Speicher, damit App und Widgets dieselben Werte anzeigen können; unter Android den privaten Speicher der App.",
          "Niemand, auch nicht der Entwickler, kann diese Informationen einsehen, da sie nirgendwohin übertragen werden. Gehalt und Fotos werden weder für Werbung noch für Statistiken verwendet (was die Statistik erfasst, steht in Abschnitt 4).",
          "Sind Backups aktiviert, können App-Daten in Apples iCloud-Backup oder in Googles automatischer Android-Sicherung enthalten sein. Das ist das Standardverhalten des jeweiligen Betriebssystems und wird nicht von der App angefordert.",
        ],
        "**Fotos und Kamera.** Wenn Sie einen Wunsch hinzufügen oder den StandBy-Bildschirm (iOS) gestalten, verwendet die App nur Fotos, die Sie selbst aufnehmen oder auswählen. Der Zugriff auf Kamera und Fotomediathek wird erst bei Nutzung dieser Funktionen angefragt; wenn Sie ablehnen, funktioniert der Rest der App normal. Das Entfernen des Hintergrunds von Wunschfotos erfolgt auf Ihrem Gerät (Apple Vision unter iOS, Google ML Kit unter Android). Fotos werden nur auf Ihrem Gerät gespeichert und nirgendwohin hochgeladen.",
        "Die App greift nicht auf Standort, Kontakte, Telefonnummer, Zahlungsinformationen oder Gesundheitsdaten zu.",
      ],
    },
    {
      h: "3. Werbung (Google AdMob)",
      body: [
        "Die App zeigt Werbung über Google AdMob an: ein Banner am unteren Bildschirmrand, Werbung mit Prämie, die Sie selbst ansehen (etwa um Betragsänderungen aufzufüllen oder das Banner vorübergehend auszublenden), und Interstitial-Werbung, die gelegentlich bei der Nutzung bestimmter Funktionen erscheint.",
        "Welche Kennung für personalisierte Werbung verwendet wird und wie die Einwilligung funktioniert, **hängt vom Betriebssystem ab.**",
        [
          "**iOS** — Wir fragen über die Abfrage zur App-Tracking-Transparenz (ATT) nach Ihrer Erlaubnis und fordern **nur wenn Sie zustimmen** mithilfe der Werbe-ID (IDFA) auf Ihre Interessen zugeschnittene Werbung an. Andernfalls wird nur nicht personalisierte Werbung angefordert und auf die IDFA nicht zugegriffen.",
          "**Android** — Da es kein Gegenstück zu ATT gibt, fragt die App nicht gesondert nach und **fordert standardmäßig personalisierte Werbung mithilfe der Werbe-ID des Geräts (AAID) an.** Wenn Sie die Werbe-ID in den Geräteeinstellungen löschen, wird ab dann nur noch nicht personalisierte Werbung angezeigt (siehe Abschnitt 8, Ihre Wahlmöglichkeiten).",
        ],
        "In jedem Fall funktionieren alle Funktionen der App gleich.",
        "Unabhängig davon, ob Werbung personalisiert ist, kann Google zur Auslieferung von Werbung und zur Verhinderung betrügerischer Klicks folgende Informationen verarbeiten:",
        [
          "IP-Adresse und der daraus abgeleitete ungefähre Standort (Land oder Stadt)",
          "Geräteinformationen wie Gerätetyp, Betriebssystemversion und Spracheinstellung",
          "Interaktionen mit Werbung wie Einblendungen und Klicks",
          "Nur bei personalisierter Werbung: die Werbe-ID (IDFA unter iOS bzw. Werbe-ID unter Android) und daraus abgeleitete Interessen",
        ],
        "Unter iOS unterstützt die App außerdem Apples SKAdNetwork, ein von Apple bereitgestelltes Verfahren, um den Werbeerfolg zu messen, ohne einzelne Nutzer zu identifizieren.",
      ],
    },
    {
      h: "4. Nutzungsstatistiken (Google Analytics for Firebase)",
      body: [
        "Um zu verstehen, welche Funktionen tatsächlich genutzt werden, und die App zu verbessern, verwenden wir Google Analytics for Firebase. Dabei werden folgende Daten verarbeitet:",
        [
          "**App-Instanz-ID** — ein Zufallswert, den Firebase für jede Installation erzeugt. Er ist nicht mit Ihrer Person (etwa Name oder E-Mail) verknüpft und verschwindet, wenn Sie die App löschen.",
          "**Geräte- und Umgebungsinformationen** — Gerätetyp, Betriebssystemversion, Sprache und Land.",
          "**Nutzungsereignisse** — Aufzeichnungen zur Nutzung von Funktionen wie Bildschirmaufrufe, Wechsel der Gehaltseinheit, gestartete Vergleiche, Widget-Nutzung (iOS) sowie Nutzung von Wünschen und „Bezahlt fürs Faulenzen“. Beim Hinzufügen eines Wunsches wird dessen Preis (nur die Zahl) erfasst, wenn ein Wunsch voll ist, die Arbeitszeit, die es dafür brauchte, und beim Beenden einer Faulenzer-Pause deren Dauer in Sekunden.",
        ],
        "**Der von Ihnen eingegebene Gehaltsbetrag wird nie übertragen.** Erfasst wird nur die Art der Einstellung, etwa welche Einheit Sie gewählt haben (Jahr, Monat, Tag oder Stunde), nicht der Betrag selbst. Auch Wunschfotos und Namen von Wünschen werden nicht übertragen.",
      ],
    },
    {
      h: "5. Absturzberichte (Firebase Crashlytics)",
      body: [
        "Stürzt die App ab, wird ein Absturzbericht an Firebase Crashlytics gesendet, damit wir die Ursache finden und beheben können. Er enthält die Stelle im Code, an der der Fehler auftrat (Stacktrace), Gerätetyp, Betriebssystemversion, Speicher- und Arbeitsspeicherzustand, den Zeitpunkt des Absturzes und eine Zufallskennung, die Crashlytics für jede Installation erzeugt.",
        "Absturzberichte enthalten weder Ihr Gehalt noch Fotos oder Namen von Wünschen.",
      ],
    },
    {
      h: "6. Drittanbieter",
      body: [
        "Alle oben genannten Dienste werden von Google bereitgestellt; die Informationen werden nach den Richtlinien von Google verarbeitet.",
        [
          "**Google AdMob** — Anzeige von Werbung und Messung des Werbeerfolgs",
          "**Google Analytics for Firebase** — Nutzungsstatistiken",
          "**Firebase Crashlytics** — Absturzberichte",
        ],
        "Einzelheiten finden Sie unter Googles [Wie Google Daten von Websites oder Apps verwendet, auf bzw. in denen unsere Dienste genutzt werden](https://policies.google.com/technologies/partner-sites). Die App verkauft Ihre Informationen nicht an Dritte.",
      ],
    },
    {
      h: "7. Speicherung und Löschung",
      body: [
        "Da Ihr Gehalt, Ihre Einstellungen und Fotos nur auf Ihrem Gerät vorhanden sind, werden sie zusammen mit der App gelöscht; anderswo wird keine Kopie aufbewahrt. Informationen, die Google für Werbung, Statistiken und Absturzberichte verarbeitet, werden gemäß den Richtlinien von Google aufbewahrt.",
      ],
    },
    {
      h: "8. Ihre Wahlmöglichkeiten",
      body: [
        [
          "**iOS** — Unter **Einstellungen > Datenschutz & Sicherheit > Tracking** können Sie jederzeit ändern, ob die App Sie tracken darf. Schalten Sie es aus, wird ab dann nur noch nicht personalisierte Werbung angezeigt. Unter **Apple-Werbung** im selben Menü können Sie personalisierte Werbung außerdem einschränken.",
          "**Android** — Wählen Sie unter **Einstellungen > Sicherheit und Datenschutz > Datenschutz > Werbung** (auf manchen Geräten **Einstellungen > Google > Alle Dienste > Werbung**) **Werbe-ID löschen**, dann wird ab dann nur noch nicht personalisierte Werbung angezeigt.",
          "Den Zugriff auf Kamera und Fotos können Sie jederzeit in den Geräteeinstellungen abschalten.",
          "Wenn Sie die App löschen, werden die auf dem Gerät gespeicherten Daten und die App-Instanz-ID entfernt.",
          "Für weitere Fragen oder Anliegen wenden Sie sich bitte an die oben genannte E-Mail-Adresse.",
        ],
      ],
    },
    {
      h: "9. Datenschutz von Kindern",
      body: [
        "Die App richtet sich nicht an Kinder unter 14 Jahren und erhebt keine Informationen, mit denen Nutzer persönlich identifiziert werden könnten, einschließlich ihres Alters.",
      ],
    },
    {
      h: "10. Änderungen dieser Erklärung",
      body: [
        "Diese Erklärung kann geändert werden, um Änderungen der Rechtslage oder der App zu berücksichtigen. Ändert sich, was die App verarbeitet, aktualisieren wir diese Erklärung und das Datum „Zuletzt aktualisiert“, bevor die Version mit der Änderung erscheint.",
        "Diese Erklärung ist in mehreren Sprachen verfügbar. Weicht eine Übersetzung von der koreanischen Fassung ab, ist die koreanische Fassung maßgeblich.",
      ],
    },
  ],
};

export default de;
