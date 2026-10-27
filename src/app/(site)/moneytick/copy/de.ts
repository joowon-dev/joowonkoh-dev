import type { Landing } from "./types";

const de: Landing = {
  meta: {
    title: "Gehaltsuhr: Lohn pro Sekunde",
    description:
      "Eine iPhone- und Android-App, die zeigt, wie dein Gehalt in diesem Moment wächst, Sekunde für Sekunde. Mit Widgets, Sperrbildschirm, StandBy und einem Rennen gegen jedes Gehalt.",
  },
  appName: "Gehaltsuhr",
  tagline: "Sieh dein Gehalt live wachsen",
  iconAlt: "App-Symbol der Gehaltsuhr",
  languageLabel: "Sprache",
  hero: {
    appStore: "Im App Store laden",
    play: "Bei Google Play laden",
    requirements: "iOS 17 · Android 7.0 oder neuer · Kostenlos",
  },
  money: { locale: "de-DE", prefix: "€", suffix: "" },
  salary: { me: 48_000, boss: 120_000 },
  eyebrow: {
    features: "Funktionen",
    race: "Vergleichsrennen",
    faq: "Häufige Fragen",
    support: "Kontakt & Support",
  },
  ticker: {
    units: { year: "Jahr", month: "Monat", day: "Tag" },
    unitNames: { year: "Jahresgehalt", month: "Monatsgehalt", day: "Tagesgehalt" },
    since: "Seit Mitternacht",
    perSecond: (a) => `${a} pro Sekunde`,
  },
  features: [
    { title: "Was eine Sekunde wert ist", tail: "Jahres-, Monats-, Tages- oder Stundenlohn" },
    { title: "Rund um die Uhr · Arbeitszeit", tail: "Auch im Schlaf, oder nur bei der Arbeit" },
    { title: "Wochenplan · Schichtdienst", tail: "Eine Pause am Tag, auch Nachtschichten" },
    { title: "Wünsche", tail: "Füll, was du willst, mit deinem Verdienst" },
    { title: "Bezahlt fürs Faulenzen", tail: "Was die Firma für deine Kaffeepause zahlt" },
    { title: "Vergleichsrennen", tail: "Vom Kaffee bis zum Neuwagen" },
    { title: "Widgets · Sperrbildschirm · StandBy", tail: "Ohne die App zu öffnen" },
    { title: "20 Währungen · 12 Sprachen", tail: "In der App und in den Widgets" },
  ],
  race: {
    me: "Ich",
    boss: "Der Chef",
    goal: 30,
    goalTitle: (a) => `Pizza für zwei · bis ${a}`,
    speed: "1000×",
    arrived: "Ziel",
    summary: (t, a) =>
      `In den ${t}, die der Chef für eine Pizza für zwei braucht, komme ich auf ${a}.`,
    duration: (h, m) => `${h} Std. ${m} Min.`,
  },
  stay: {
    since: (s) => `Seit du diese Seite geöffnet hast: ${s}`,
    spent: (m, s) => (m > 0 ? `${m} Min. ${s} Sek.` : `${s} Sek.`),
    footnote: "Bei einem Jahresgehalt von €48.000. Die App rechnet mit deinem.",
  },
  statement: {
    headline: "Schau bei einem endlosen Meeting aufs Display, und du siehst, was dieses Meeting kostet.",
    body: "Ich wollte die Zahl, die man sonst nur am Zahltag spürt, jeden Tag sehen. Darum gibt es diese App. Dein Gehalt verlässt dieses Gerät nicht.",
  },
  faq: [
    {
      q: "Das Widget zählt nicht jede Sekunde hoch",
      a: "iOS zeichnet Widgets nach einer vorab erstellten Zeitleiste. Die App legt jeweils 30 Minuten an und liefert danach die nächsten. Bei jedem Neuzeichnen wird für genau diesen Moment gerechnet, der angezeigte Betrag stimmt also immer.",
    },
    {
      q: "Kann ich mein Nettogehalt sehen?",
      a: "Noch nicht. Steuern und Abgaben hängen von zu vielen Dingen ab, deshalb gibt es lieber keine ungeprüfte Formel. Alle Beträge sind brutto.",
    },
    {
      q: "Woher kommen die Gehälter zum Vergleichen?",
      a: "Die trägst du alle selbst ein. Die App bringt keine vorgegebenen Vergleichspersonen mit.",
    },
    {
      q: "Rechnet die App in andere Währungen um?",
      a: "Nein. Nur die Schreibweise ändert sich. In den USA kostet ein Kaffee eben einfach $5.",
    },
    {
      q: "Wird mein Gehalt irgendwohin gesendet?",
      a: "Nein. Es gibt keine Anmeldung, Gehalt, Einstellungen und Wunschfotos bleiben auf diesem Gerät. Die App enthält aber Werbung (AdMob) und Nutzungsstatistiken (Firebase), daher verarbeitet Google einige Geräteinformationen. Auf dem iPhone wirst du beim ersten Start nach Tracking für personalisierte Werbung gefragt, und alles funktioniert auch, wenn du ablehnst.",
    },
    {
      q: "Kann ich die Werbung ausschalten?",
      a: "Schau dir in den Einstellungen eine Werbung an, dann verschwindet das Banner unten für 12 Stunden. Kaufen kann man nichts.",
    },
  ],
  support: { privacy: "Datenschutzerklärung" },
};

export default de;
