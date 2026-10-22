import type { Landing } from "./types";

const pt: Landing = {
  meta: {
    title: "Salariômetro: salário ao vivo",
    description:
      "Um app para iPhone e Android que mostra o dinheiro que você está ganhando agora, segundo a segundo. Widgets, Tela Bloqueada, StandBy e uma corrida contra o salário de quem você quiser.",
  },
  appName: "Salariômetro",
  tagline: "Veja seu salário subir ao vivo",
  iconAlt: "Ícone do app Salariômetro",
  languageLabel: "Idioma",
  hero: {
    appStore: "Baixar na App Store",
    play: "Disponível no Google Play",
    requirements: "iOS 17 · Android 7.0 ou superior · Grátis",
  },
  money: { locale: "pt-BR", prefix: "R$", suffix: "" },
  salary: { me: 60_000, boss: 150_000 },
  eyebrow: {
    features: "Recursos",
    race: "Corrida de comparação",
    faq: "Perguntas frequentes",
    support: "Contato e suporte",
  },
  ticker: {
    units: { year: "Anual", month: "Mensal", day: "Diário" },
    unitNames: { year: "Salário anual", month: "Salário mensal", day: "Ganho diário" },
    since: "Desde a meia-noite",
    perSecond: (a) => `${a} por segundo`,
  },
  features: [
    { title: "Quanto vale um segundo", tail: "Anual, mensal, diário ou por hora" },
    { title: "O dia todo · Expediente", tail: "Até dormindo, ou só no trabalho" },
    { title: "Jornada semanal · Turnos", tail: "Um intervalo por dia, turno da noite também" },
    { title: "Desejos", tail: "Encha o que você quer com o que ganha" },
    { title: "Pago para enrolar", tail: "Quanto a empresa pagou pelo seu cafezinho" },
    { title: "Corrida de comparação", tail: "De um café a um carro novo" },
    { title: "Widgets · Tela Bloqueada · StandBy", tail: "Sem abrir o app" },
    { title: "20 moedas · 12 idiomas", tail: "No app e nos widgets" },
  ],
  race: {
    me: "Eu",
    boss: "O chefe",
    goal: 40,
    goalTitle: (a) => `Uma pizza · até ${a}`,
    speed: "1000×",
    arrived: "Chegou",
    summary: (t, a) => `Nas ${t} que o chefe leva para ganhar uma pizza, eu chego a ${a}.`,
    duration: (h, m) => `${h} h ${m} min`,
  },
  stay: {
    since: (s) => `Desde que você abriu esta página: ${s}`,
    spent: (m, s) => (m > 0 ? `${m} min ${s} s` : `${s} s`),
    footnote: "Com salário anual de R$60.000. O app conta com o seu.",
  },
  statement: {
    headline: "Quando uma reunião se arrastar, olhe para a tela: você vai ver quanto ela custa.",
    body: "Fiz o app porque queria ver todo dia o número que a gente só sente no dia do pagamento. O salário que você informa não sai deste aparelho.",
  },
  faq: [
    {
      q: "O widget não sobe a cada segundo",
      a: "O iOS desenha os widgets seguindo uma linha do tempo preparada com antecedência. O app prepara 30 minutos de cada vez e depois passa para os próximos. A cada redesenho, o cálculo é feito para aquele exato momento, então o valor mostrado está sempre certo.",
    },
    {
      q: "Dá para ver o salário líquido?",
      a: "Ainda não. Impostos e descontos dependem de muita coisa, então em vez de uma fórmula não verificada, ficou para depois. Todos os valores são brutos.",
    },
    {
      q: "De onde vêm os salários para comparar?",
      a: "Você mesmo informa todos. O app não traz pessoas predefinidas para comparar.",
    },
    {
      q: "O app converte para outras moedas?",
      a: "Não. Só muda a forma de escrever. Nos Estados Unidos, um café custa $5 e pronto.",
    },
    {
      q: "Meu salário é enviado para algum lugar?",
      a: "Não. Não há cadastro: seu salário, suas configurações e as fotos dos seus desejos ficam neste aparelho. Mas o app tem anúncios (AdMob) e estatísticas de uso (Firebase), então o Google processa algumas informações do aparelho. No iPhone, o rastreamento para anúncios personalizados é perguntado na primeira abertura, e tudo funciona mesmo se você recusar.",
    },
    {
      q: "Dá para tirar os anúncios?",
      a: "Assista a um anúncio nos Ajustes e o banner de baixo some por 12 horas. Não há nada para comprar.",
    },
  ],
  support: { privacy: "Política de Privacidade" },
};

export default pt;
