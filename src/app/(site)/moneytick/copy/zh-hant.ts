import type { Landing } from "./types";

const zhHant: Landing = {
  meta: {
    title: "我的秒薪：即時薪水計算機",
    description:
      "輸入薪資，就能以秒為單位看到此刻正在累積的收入。支援主畫面小工具、鎖定畫面和待機模式，還能和任何人的薪資並排賽跑。適用於 iPhone 和 Android。",
  },
  appName: "我的秒薪",
  tagline: "看著薪資每秒往上跳",
  iconAlt: "我的秒薪 App 圖示",
  languageLabel: "語言",
  hero: {
    appStore: "在 App Store 下載",
    play: "在 Google Play 下載",
    requirements: "iOS 17 · Android 7.0 以上 · 免費",
  },
  money: { locale: "zh-TW", prefix: "NT$", suffix: "" },
  salary: { me: 600_000, boss: 1_500_000 },
  eyebrow: {
    features: "功能",
    race: "比較賽跑",
    faq: "常見問題",
    support: "聯絡與支援",
  },
  ticker: {
    units: { year: "年薪", month: "月薪", day: "日薪" },
    unitNames: { year: "年薪", month: "月薪", day: "日薪" },
    since: "從今天 0 點起",
    perSecond: (a) => `每秒 ${a}`,
  },
  features: [
    { title: "一秒值多少", tail: "年薪、月薪、日薪、時薪任選" },
    { title: "全天 · 上班時間", tail: "睡覺時也算，或只算上班時間" },
    { title: "依星期 · 輪班", tail: "可扣一段休息，大夜班也算" },
    { title: "願望", tail: "用賺到的錢填滿想要的東西" },
    { title: "帶薪摸魚", tail: "摸魚時公司付了你多少" },
    { title: "比較賽跑", tail: "從一杯咖啡到一台車" },
    { title: "小工具 · 鎖定畫面 · 待機模式", tail: "不用打開 App" },
    { title: "20 種貨幣 · 12 種語言", tail: "App 和小工具都一樣" },
  ],
  race: {
    me: "我",
    boss: "主管",
    goal: 400,
    goalTitle: (a) => `一頓火鍋 · 賺到 ${a}`,
    speed: "1000 倍速",
    arrived: "抵達",
    summary: (t, a) => `主管賺到一頓火鍋的 ${t} 裡，我賺到了 ${a}。`,
    duration: (h, m) => `${h} 小時 ${m} 分鐘`,
  },
  stay: {
    since: (s) => `打開這個頁面已經 ${s}`,
    spent: (m, s) => (m > 0 ? `${m} 分 ${s} 秒` : `${s} 秒`),
    footnote: "以年薪 NT$600,000 計算。App 會用你的年薪來算。",
  },
  statement: {
    headline: "會議拖太久時看一眼螢幕，就能看到這場會議的價格。",
    body: "只有發薪日才感受得到的數字，我想讓它每天都看得到，所以做了這個 App。輸入的薪資不會離開這台裝置。",
  },
  faq: [
    {
      q: "小工具的數字沒有每秒增加",
      a: "因為 iOS 小工具是依照事先準備好的時間軸來繪製。App 每次準備 30 分鐘的份量，用完再換下一段。每次重新繪製時都會以當下時刻計算，所以顯示的金額永遠正確。",
    },
    {
      q: "可以看實領金額嗎",
      a: "目前還不行。稅金和勞健保因人而異，與其放一個沒驗證過的公式，不如先不做。現在顯示的都是稅前金額。",
    },
    {
      q: "比較對象的薪資從哪裡來",
      a: "全部都是你自己輸入的。App 沒有預設的比較對象。",
    },
    {
      q: "換成其他貨幣會依匯率換算嗎",
      a: "不會，只會改變顯示方式。畢竟在美國，一杯咖啡就是 $5。",
    },
    {
      q: "我的薪資會被傳送到別處嗎",
      a: "不會。不需要註冊，薪資、設定和願望照片都只存在這台裝置裡。不過 App 內有廣告（AdMob）和使用統計（Firebase），Google 會處理部分裝置資訊。在 iPhone 上第一次開啟時會詢問是否允許個人化廣告追蹤，拒絕也能使用全部功能。",
    },
    {
      q: "可以關掉廣告嗎",
      a: "在設定裡看一次廣告，底部橫幅會消失 12 小時。沒有任何付費項目。",
    },
  ],
  support: { privacy: "隱私權政策" },
};

export default zhHant;
