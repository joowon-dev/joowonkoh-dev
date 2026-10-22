import type { Landing } from "./types";

const es: Landing = {
  meta: {
    title: "Sueldómetro: salario en vivo",
    description:
      "Una app para iPhone y Android que muestra el dinero que estás ganando ahora mismo, segundo a segundo. Widgets, pantalla bloqueada, StandBy y una carrera contra el sueldo de quien quieras.",
  },
  appName: "Sueldómetro",
  tagline: "Tu sueldo, segundo a segundo",
  iconAlt: "Icono de la app Sueldómetro",
  languageLabel: "Idioma",
  hero: {
    appStore: "Descargar en el App Store",
    play: "Disponible en Google Play",
    requirements: "iOS 17 · Android 7.0 o posterior · Gratis",
  },
  money: { locale: "es-ES", prefix: "€", suffix: "" },
  salary: { me: 32_000, boss: 80_000 },
  eyebrow: {
    features: "Funciones",
    race: "Carrera comparada",
    faq: "Preguntas frecuentes",
    support: "Contacto y soporte",
  },
  ticker: {
    units: { year: "Anual", month: "Mensual", day: "Diario" },
    unitNames: { year: "Sueldo anual", month: "Sueldo mensual", day: "Sueldo diario" },
    since: "Desde medianoche",
    perSecond: (a) => `${a} por segundo`,
  },
  features: [
    { title: "Lo que vale un segundo", tail: "Anual, mensual, diario o por hora" },
    { title: "Todo el día · Horas de trabajo", tail: "Mientras duermes, o solo trabajando" },
    { title: "Horario semanal · Turnos", tail: "Un descanso al día, turnos de noche también" },
    { title: "Deseos", tail: "Llena lo que quieres con lo que ganas" },
    { title: "Pagado por escaquearte", tail: "Lo que te pagó la empresa por ese café" },
    { title: "Carrera comparada", tail: "De un café a un coche nuevo" },
    { title: "Widgets · Pantalla bloqueada · StandBy", tail: "Sin abrir la app" },
    { title: "20 monedas · 12 idiomas", tail: "En la app y en los widgets" },
  ],
  race: {
    me: "Yo",
    boss: "El jefe",
    goal: 20,
    goalTitle: (a) => `Una pizza · hasta ${a}`,
    speed: "×1000",
    arrived: "Llegó",
    summary: (t, a) => `En las ${t} que tarda el jefe en ganar una pizza, yo llego a ${a}.`,
    duration: (h, m) => `${h} h ${m} min`,
  },
  stay: {
    since: (s) => `Desde que abriste esta página: ${s}`,
    spent: (m, s) => (m > 0 ? `${m} min ${s} s` : `${s} s`),
    footnote: "Con un sueldo anual de €32.000. La app lo cuenta con el tuyo.",
  },
  statement: {
    headline: "Cuando una reunión se alarga, mira la pantalla: verás lo que cuesta esa reunión.",
    body: "La hice porque quería ver cada día el número que solo se nota el día de cobro. El sueldo que introduces no sale de este dispositivo.",
  },
  faq: [
    {
      q: "El widget no sube cada segundo",
      a: "iOS dibuja los widgets siguiendo una línea de tiempo preparada de antemano. La app prepara 30 minutos cada vez y luego pasa a los siguientes. Cada vez que se redibuja, se calcula para ese momento exacto, así que el importe mostrado siempre es correcto.",
    },
    {
      q: "¿Puedo ver mi sueldo neto?",
      a: "Todavía no. Impuestos y cotizaciones dependen de demasiadas cosas, así que en vez de una fórmula sin verificar, de momento no está. Todos los importes son brutos.",
    },
    {
      q: "¿De dónde salen los sueldos para comparar?",
      a: "Los introduces tú. La app no trae personas predefinidas para comparar.",
    },
    {
      q: "¿Convierte a otras monedas?",
      a: "No. Solo cambia cómo se escribe. En Estados Unidos un café cuesta $5 y ya.",
    },
    {
      q: "¿Se envía mi sueldo a algún sitio?",
      a: "No. No hay registro: tu sueldo, tus ajustes y las fotos de tus deseos se quedan en este dispositivo. Eso sí, la app incluye anuncios (AdMob) y estadísticas de uso (Firebase), así que Google procesa algunos datos del dispositivo. En iPhone se te pregunta por el seguimiento para anuncios personalizados al abrirla por primera vez, y todo funciona aunque digas que no.",
    },
    {
      q: "¿Puedo quitar los anuncios?",
      a: "Mira un anuncio desde Ajustes y el banner de abajo desaparece durante 12 horas. No hay nada que comprar.",
    },
  ],
  support: { privacy: "Política de privacidad" },
};

export default es;
