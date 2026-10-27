import type { Landing } from "./types";

const zhHans: Landing = {
  meta: {
    title: "我的秒薪：实时工资计算器",
    description:
      "输入薪水，就能按秒看到此刻正在累积的收入。支持主屏幕小组件、锁定屏幕和待机显示，还能和任何人的薪水并排赛跑。适用于 iPhone 和 Android。",
  },
  appName: "我的秒薪",
  tagline: "看着薪水每秒往上涨",
  iconAlt: "我的秒薪 App 图标",
  languageLabel: "语言",
  hero: {
    appStore: "在 App Store 下载",
    play: "在 Google Play 下载",
    requirements: "iOS 17 · Android 7.0 及以上 · 免费",
  },
  money: { locale: "zh-CN", prefix: "¥", suffix: "" },
  salary: { me: 120_000, boss: 300_000 },
  eyebrow: {
    features: "功能",
    race: "比较赛跑",
    faq: "常见问题",
    support: "联系与支持",
  },
  ticker: {
    units: { year: "年薪", month: "月薪", day: "日薪" },
    unitNames: { year: "年薪", month: "月薪", day: "日薪" },
    since: "从今天 0 点起",
    perSecond: (a) => `每秒 ${a}`,
  },
  features: [
    { title: "一秒值多少", tail: "年薪、月薪、日薪、时薪任选" },
    { title: "全天 · 工作时间", tail: "睡觉时也算，或只算上班时间" },
    { title: "按星期 · 轮班", tail: "可扣一段休息，夜班也算" },
    { title: "心愿", tail: "用赚到的钱填满想要的东西" },
    { title: "带薪摸鱼", tail: "摸鱼时公司付了你多少" },
    { title: "比较赛跑", tail: "从一杯咖啡到一辆车" },
    { title: "小组件 · 锁定屏幕 · 待机显示", tail: "不用打开 App" },
    { title: "20 种货币 · 12 种语言", tail: "App 和小组件都一样" },
  ],
  race: {
    me: "我",
    boss: "领导",
    goal: 80,
    goalTitle: (a) => `一顿火锅 · 赚到 ${a}`,
    speed: "1000 倍速",
    arrived: "到达",
    summary: (t, a) => `领导赚够一顿火锅的 ${t} 里，我赚到了 ${a}。`,
    duration: (h, m) => `${h} 小时 ${m} 分钟`,
  },
  stay: {
    since: (s) => `打开这个页面已经 ${s}`,
    spent: (m, s) => (m > 0 ? `${m} 分 ${s} 秒` : `${s} 秒`),
    footnote: "按年薪 ¥120,000 计算。App 会用你的年薪来算。",
  },
  statement: {
    headline: "会议拖得太久时看一眼屏幕，就能看到这场会议的价格。",
    body: "只有发薪日才能感受到的数字，我想让它每天都看得见，于是做了这个 App。输入的薪水不会离开这台设备。",
  },
  faq: [
    {
      q: "小组件的数字不是每秒都在涨",
      a: "因为 iOS 小组件是按照预先准备好的时间线来绘制的。App 每次准备 30 分钟的量，用完再换下一段。每次重新绘制时都会按当时的时刻计算，所以显示的金额始终准确。",
    },
    {
      q: "能看税后到手的金额吗",
      a: "暂时不能。个税和社保因人而异，与其放一个没验证过的公式，不如先不做。目前显示的都是税前金额。",
    },
    {
      q: "比较对象的薪水从哪里来",
      a: "全部是你自己输入的。App 不提供预设的比较对象。",
    },
    {
      q: "换成其他货币会按汇率换算吗",
      a: "不会，只改变显示方式。毕竟在美国，一杯咖啡就是 $5。",
    },
    {
      q: "我的薪水会被发送到别处吗",
      a: "不会。不需要注册，薪水、设置和心愿照片都只保存在这台设备上。不过 App 内有广告（AdMob）和使用统计（Firebase），Google 会处理部分设备信息。在 iPhone 上首次启动时会询问是否允许个性化广告追踪，拒绝也能使用全部功能。",
    },
    {
      q: "可以去掉广告吗",
      a: "在设置里看一次广告，底部横幅会消失 12 小时。没有任何付费项目。",
    },
  ],
  support: { privacy: "隐私政策" },
};

export default zhHans;
