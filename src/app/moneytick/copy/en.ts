import type { Landing } from "./types";

const en: Landing = {
  meta: {
    title: "MoneyTick: Salary Ticker",
    description:
      "An iPhone and Android app that shows the money you're earning right now, counting up every second. Widgets, Lock Screen and StandBy, plus a race against anyone's salary. MoneyTick product and support page.",
  },
  appName: "MoneyTick",
  tagline: "Watch your paycheck grow live",
  iconAlt: "MoneyTick app icon",
  languageLabel: "Language",
  hero: {
    appStore: "Download on the App Store",
    play: "Get it on Google Play",
    requirements: "iOS 17 · Android 7.0 or later · Free",
  },
  money: { locale: "en-US", prefix: "$", suffix: "" },
  salary: { me: 60_000, boss: 150_000 },
  eyebrow: {
    features: "Features",
    race: "Race",
    faq: "FAQ",
    support: "Contact & support",
  },
  ticker: {
    units: { year: "Yearly", month: "Monthly", day: "Daily" },
    unitNames: { year: "Salary", month: "Monthly pay", day: "Daily pay" },
    since: "Since midnight",
    perSecond: (a) => `${a} per second`,
  },
  features: [
    { title: "What a second is worth", tail: "Yearly, monthly, daily or hourly" },
    { title: "Around the clock · Work hours", tail: "While you sleep, or only on the clock" },
    { title: "Weekly schedules · Shifts", tail: "One break a day, overnight shifts too" },
    { title: "Wish", tail: "Fill something you want with what you earn" },
    { title: "Paid to Slack", tail: "What your company paid for that coffee break" },
    { title: "Race", tail: "From a cup of coffee to a new car" },
    { title: "Widgets · Lock Screen · StandBy", tail: "No need to open the app" },
    { title: "20 currencies · 12 languages", tail: "In the app and the widgets" },
  ],
  race: {
    me: "Me",
    boss: "The boss",
    goal: 40,
    goalTitle: (a) => `Pizza for two · race to ${a}`,
    speed: "1000×",
    arrived: "Done",
    summary: (t, a) => `In the ${t} it takes the boss to earn pizza for two, I get to ${a}.`,
    duration: (h, m) => `${h}h ${m}m`,
  },
  stay: {
    since: (s) => `Since you opened this page: ${s}`,
    spent: (m, s) => (m > 0 ? `${m}m ${s}s` : `${s}s`),
    footnote: "Based on a $60,000 salary. The app counts it with yours.",
  },
  statement: {
    headline: "When a meeting drags on, glance at the screen. You'll see what that meeting costs.",
    body: "I built this because I wanted to see, every day, the number I only really felt on payday. The salary you enter never leaves your device.",
  },
  faq: [
    {
      q: "The widget doesn't count up every second",
      a: "iOS draws widgets from a timeline prepared in advance. The app prepares 30 minutes at a time and hands over the next batch when it runs out. Each redraw is calculated for that exact moment, so the amount shown is always right.",
    },
    {
      q: "Can I see my take-home pay?",
      a: "Not yet. Taxes and deductions depend on too many things, so rather than ship an unverified formula, it's on hold. Amounts are before tax for now.",
    },
    {
      q: "Where do the comparison salaries come from?",
      a: "You enter them all yourself. The app doesn't come with preset people to compare against.",
    },
    {
      q: "Does it convert between currencies?",
      a: "No. Only the way amounts are written changes. A coffee in the US is just $5.",
    },
    {
      q: "Is my salary sent anywhere?",
      a: "No. There's no sign-up, and your pay, settings and wish photos stay on this device. The app does include ads (AdMob) and usage analytics (Firebase), so Google processes some device information. On iPhone you're asked about ad tracking on first launch, and everything works even if you say no.",
    },
    {
      q: "Can I turn off the ads?",
      a: "Watch one ad from Settings and the bottom banner disappears for 12 hours. There's nothing to buy.",
    },
  ],
  support: { privacy: "Privacy Policy" },
};

export default en;
