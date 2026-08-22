// 이 파일 하나에 UI 문자열 사전을 몰아넣는다.
// 나중에 언어 가짓수를 줄이기로 하면 이 파일만 건드리면 되게 하려는 의도다.
// 이 사이트 자체는 한국어 전용 개인 사이드 프로젝트라, 9개 언어는 사실 과한 편이다.

export interface Strings {
  title: string;
  intro: string;
  chooseA: string; // "첫 번째 사람의 Timeline.json"
  chooseB: string;
  trySample: string; // "가상 여행으로 해보기"
  consentTitle: string;
  consentBody: string; // 타일 서버가 대략적 위치를 알게 된다는 설명
  consentAgree: string; // "이해했고 지도를 불러오겠습니다"
  privacyNote: string; // "파일은 이 기기를 벗어나지 않습니다"
  useRawData: string;
  accuracyLimit: string;
  outlierFilter: string;
  outlierConservative: string;
  outlierOff: string;
  exactDates: string;
  startDate: string;
  endDate: string;
  videoTitle: string;
  duration: string;
  seconds: string; // "{n}초"
  cameraMotion: string;
  cameraFixed: string;
  cameraSteady: string;
  cameraDynamic: string;
  videoSize: string;
  sizeSquare: string;
  sizePortrait: string;
  sizeLandscape: string;
  preview: string;
  createVideo: string;
  cancelVideo: string;
  shareVideo: string;
  downloadVideo: string;
  language: string;
  systemDefault: string;
  personA: string;
  personB: string;
  meetRadius: string;
  meetMinDuration: string;
  hideHome: string;
  hideHomeRadius: string;
  showSummary: string;
  meetingsFound: string; // "함께한 순간: {n}" — 숫자를 값으로 두어 개수와 무관하게 읽히게 한다
  noMeetings: string;
  totalTogether: string; // "함께 있었던 시간: {n}" — {n}은 이미 단위까지 붙은 값 문자열
  favouriteSpot: string; // "가장 자주 만난 곳: {n}번" — {n}은 만난 횟수(숫자)
  farthestApart: string; // "가장 멀리 떨어져 있던 순간: {n}" — {n}은 "거리 (날짜)"
  parseFailed: string;
  rendering: string;
  webmFallback: string; // mp4를 못 만들 때 알리는 문구
  attribution: string;
  hoursUnit: string; // 숫자 뒤에 붙는 "시간" 단위. 라틴 약어(h)를 그대로 쓰지 않는다
  kmUnit: string; // 숫자 뒤에 붙는 "km" 단위
  minutesUnit: string; // 숫자 뒤에 붙는 "분" 단위. 만남은 대개 1시간이 안 돼 이게 더 자주 쓰인다
  metersUnit: string; // 숫자 뒤에 붙는 "m" 단위. 1km 미만 거리에 쓴다
  noMeetingsReasonHeading: string; // "왜 없을까요" — 0건 화면의 이유 목록 위 소제목
  noMeetingsReasonDateRange: string; // 이유 1: 두 사람의 기록 기간이 안 겹쳤을 수 있음
  noMeetingsReasonRadius: string; // 이유 2: 판정 거리가 너무 좁았을 수 있음
  noMeetingsReasonAccuracy: string; // 이유 3: 정확도 필터가 기록을 너무 많이 걸렀을 수 있음
  noMeetingsReasonGenuine: string; // 이유 4: 정말 만나지 않았을 수도 있음
  showMoreMeetings: string; // "{n}건 더 보기" — n은 접힌 나머지 건수
  showLessMeetings: string; // 펼친 목록을 다시 접는 버튼
}

export type Lang =
  | "ko"
  | "en"
  | "ja"
  | "zh-Hans"
  | "zh-Hant"
  | "es"
  | "fr"
  | "de"
  | "pt";
export type LangPref = Lang | "system";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh-Hans", label: "简体中文" },
  { code: "zh-Hant", label: "繁體中文" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português (Brasil)" },
];

/**
 * 브라우저 언어 목록에서 지원하는 언어를 고른다.
 * 못 찾으면 한국어로 떨어진다 — 이 사이트의 기본 언어다.
 */
export function resolveLang(
  pref: LangPref,
  navigatorLangs: readonly string[],
): Lang {
  if (pref !== "system") return pref;

  for (const raw of navigatorLangs) {
    const lower = raw.toLowerCase();
    // 중국어만 간체·번체를 갈라야 해서 따로 본다
    if (lower.startsWith("zh")) {
      return /hant|tw|hk|mo/.test(lower) ? "zh-Hant" : "zh-Hans";
    }
    const base = lower.split("-")[0];
    const hit = LANGS.find((l) => l.code === base);
    if (hit) return hit.code;
  }
  return "ko";
}

export function t(lang: Lang): Strings {
  return DICT[lang];
}

// 한국어를 원본으로 삼고 나머지 8개 언어는 이를 옮긴 것이다.
const DICT: Record<Lang, Strings> = {
  ko: {
    title: "함께 걸은 길",
    intro:
      "두 사람의 구글 타임라인을 겹쳐서, 서로 가까이 있었던 순간들을 지도 위에서 찾아줘요.",
    chooseA: "첫 번째 사람의 Timeline.json",
    chooseB: "두 번째 사람의 Timeline.json",
    trySample: "가상 여행으로 해보기",
    consentTitle: "시작하기 전에",
    consentBody:
      "지도를 그리려면 타일 서버에 위치 좌표를 요청해요. 대략적인 위치가 지도 회사에 전달된다는 뜻이에요. 파일 자체는 이 기기 밖으로 나가지 않아요.",
    consentAgree: "이해했고 지도를 불러오겠습니다",
    privacyNote: "파일은 이 기기를 벗어나지 않습니다",
    useRawData: "보정 없이 원본 좌표 쓰기",
    accuracyLimit: "정확도 한계",
    outlierFilter: "튀는 기록 걸러내기",
    outlierConservative: "보수적으로",
    outlierOff: "끄기",
    exactDates: "날짜 직접 지정",
    startDate: "시작일",
    endDate: "종료일",
    videoTitle: "영상 제목",
    duration: "영상 길이",
    seconds: "{n}초",
    cameraMotion: "카메라 움직임",
    cameraFixed: "고정",
    cameraSteady: "천천히 따라가기",
    cameraDynamic: "역동적으로",
    videoSize: "화면 비율",
    sizeSquare: "정사각형",
    sizePortrait: "세로",
    sizeLandscape: "가로",
    preview: "미리 보기",
    createVideo: "영상 만들기",
    cancelVideo: "영상 만들기 취소",
    shareVideo: "공유하기",
    downloadVideo: "다운로드",
    language: "언어",
    systemDefault: "시스템 기본값",
    personA: "첫 번째 사람",
    personB: "두 번째 사람",
    meetRadius: "가까이 있었다고 볼 거리",
    meetMinDuration: "가까이 있었다고 볼 최소 시간",
    hideHome: "집 근처는 숨기기",
    hideHomeRadius: "집으로 볼 반경",
    showSummary: "요약 보기",
    meetingsFound: "함께한 순간: {n}",
    noMeetings: "겹치는 순간을 찾지 못했어요",
    totalTogether: "함께 있었던 시간: {n}",
    favouriteSpot: "가장 자주 만난 곳: {n}번",
    farthestApart: "가장 멀리 떨어져 있던 순간: {n}",
    parseFailed: "파일을 읽지 못했어요. Timeline.json이 맞는지 확인해 주세요",
    rendering: "영상을 만드는 중이에요",
    webmFallback:
      "이 브라우저에서는 mp4를 만들 수 없어서 webm으로 대신 내려받아요",
    attribution: "지도 데이터 제공",
    hoursUnit: "시간",
    kmUnit: "km",
    minutesUnit: "분",
    metersUnit: "m",
    noMeetingsReasonHeading: "왜 없을까요",
    noMeetingsReasonDateRange: "두 사람의 기록 기간이 겹치지 않았을 수 있어요",
    noMeetingsReasonRadius: "가까이 있었다고 볼 거리가 너무 좁았을 수 있어요",
    noMeetingsReasonAccuracy: "정확도 필터가 기록을 너무 많이 걸러냈을 수 있어요",
    noMeetingsReasonGenuine: "정말로 가까이 있지 않았을 수도 있어요",
    showMoreMeetings: "{n}건 더 보기",
    showLessMeetings: "접기",
  },
  en: {
    title: "The Path We Walked Together",
    intro:
      "Overlay two people's Google Timeline exports and find the moments you were near each other, right on the map.",
    chooseA: "First person's Timeline.json",
    chooseB: "Second person's Timeline.json",
    trySample: "Try it with a sample trip",
    consentTitle: "Before you start",
    consentBody:
      "To draw the map, we need to request tiles using your coordinates. That means an approximate location gets sent to the map tile provider. The files themselves never leave this device.",
    consentAgree: "Got it, load the map",
    privacyNote: "Your files never leave this device",
    useRawData: "Use raw coordinates, no smoothing",
    accuracyLimit: "Accuracy limit",
    outlierFilter: "Filter out stray points",
    outlierConservative: "Conservative",
    outlierOff: "Off",
    exactDates: "Set exact dates",
    startDate: "Start date",
    endDate: "End date",
    videoTitle: "Video title",
    duration: "Video length",
    seconds: "{n} sec",
    cameraMotion: "Camera motion",
    cameraFixed: "Fixed",
    cameraSteady: "Follow smoothly",
    cameraDynamic: "Dynamic",
    videoSize: "Aspect ratio",
    sizeSquare: "Square",
    sizePortrait: "Portrait",
    sizeLandscape: "Landscape",
    preview: "Preview",
    createVideo: "Create video",
    cancelVideo: "Cancel video",
    shareVideo: "Share",
    downloadVideo: "Download",
    language: "Language",
    systemDefault: "System default",
    personA: "First person",
    personB: "Second person",
    meetRadius: "Distance counted as \"near\"",
    meetMinDuration: "Minimum time counted as \"near\"",
    hideHome: "Hide the area around home",
    hideHomeRadius: "Radius treated as home",
    showSummary: "Show summary",
    meetingsFound: "Moments together: {n}",
    noMeetings: "No overlapping moments found",
    totalTogether: "Time spent together: {n}",
    favouriteSpot: "Most frequent meeting spot: {n} times",
    farthestApart: "Farthest apart at any point: {n}",
    parseFailed: "Couldn't read that file. Please check it's a Timeline.json",
    rendering: "Rendering your video",
    webmFallback:
      "This browser can't produce mp4, so we're downloading a webm instead",
    attribution: "Map data by",
    hoursUnit: "h",
    kmUnit: "km",
    minutesUnit: "min",
    metersUnit: "m",
    noMeetingsReasonHeading: "Possible reasons",
    noMeetingsReasonDateRange: "Their two date ranges may not overlap",
    noMeetingsReasonRadius: "The distance counted as \"near\" may be too strict",
    noMeetingsReasonAccuracy: "The accuracy filter may have discarded too much",
    noMeetingsReasonGenuine: "You genuinely may not have been near each other",
    showMoreMeetings: "Show {n} more",
    showLessMeetings: "Show less",
  },
  ja: {
    title: "ふたりで歩いた道",
    intro:
      "ふたりのGoogleタイムラインを重ねて、近くにいた瞬間を地図の上で見つけます。",
    chooseA: "1人目のTimeline.json",
    chooseB: "2人目のTimeline.json",
    trySample: "サンプルの旅で試す",
    consentTitle: "始める前に",
    consentBody:
      "地図を描くには、座標をもとにタイル画像をリクエストします。おおよその位置情報が地図タイルの提供元に送られるということです。ファイル自体はこの端末の外には出ません。",
    consentAgree: "理解しました、地図を読み込みます",
    privacyNote: "ファイルはこの端末の外に出ません",
    useRawData: "補正なしで元の座標を使う",
    accuracyLimit: "精度の限界",
    outlierFilter: "外れた記録を除く",
    outlierConservative: "控えめに",
    outlierOff: "オフ",
    exactDates: "日付を直接指定",
    startDate: "開始日",
    endDate: "終了日",
    videoTitle: "動画タイトル",
    duration: "動画の長さ",
    seconds: "{n}秒",
    cameraMotion: "カメラの動き",
    cameraFixed: "固定",
    cameraSteady: "ゆっくり追従",
    cameraDynamic: "ダイナミック",
    videoSize: "画面比率",
    sizeSquare: "正方形",
    sizePortrait: "縦長",
    sizeLandscape: "横長",
    preview: "プレビュー",
    createVideo: "動画を作る",
    cancelVideo: "動画作成をキャンセル",
    shareVideo: "共有する",
    downloadVideo: "ダウンロード",
    language: "言語",
    systemDefault: "システムの既定値",
    personA: "1人目",
    personB: "2人目",
    meetRadius: "「近くにいた」とみなす距離",
    meetMinDuration: "「近くにいた」とみなす最短時間",
    hideHome: "自宅の周辺を隠す",
    hideHomeRadius: "自宅とみなす半径",
    showSummary: "サマリーを見る",
    meetingsFound: "一緒にいた瞬間: {n}",
    noMeetings: "重なる瞬間は見つかりませんでした",
    totalTogether: "一緒にいた時間: {n}",
    favouriteSpot: "いちばんよく会った場所: {n}回",
    farthestApart: "いちばん離れていた瞬間: {n}",
    parseFailed:
      "ファイルを読み込めませんでした。Timeline.jsonかどうか確認してください",
    rendering: "動画を作成しています",
    webmFallback:
      "このブラウザではmp4を作れないため、代わりにwebmでダウンロードします",
    attribution: "地図データ提供",
    hoursUnit: "時間",
    kmUnit: "km",
    minutesUnit: "分",
    metersUnit: "m",
    noMeetingsReasonHeading: "考えられる理由",
    noMeetingsReasonDateRange: "ふたりの記録期間が重なっていないかもしれません",
    noMeetingsReasonRadius: "「近くにいた」とみなす距離が狭すぎたかもしれません",
    noMeetingsReasonAccuracy: "精度フィルターが記録を削りすぎたかもしれません",
    noMeetingsReasonGenuine: "本当に近くにいなかった可能性もあります",
    showMoreMeetings: "あと{n}件を表示",
    showLessMeetings: "閉じる",
  },
  "zh-Hans": {
    title: "我们一起走过的路",
    intro:
      "把两个人的谷歌时间线叠加在一起，在地图上找出彼此靠近的那些瞬间。",
    chooseA: "第一个人的 Timeline.json",
    chooseB: "第二个人的 Timeline.json",
    trySample: "用示例旅程试试看",
    consentTitle: "开始之前",
    consentBody:
      "为了绘制地图，我们需要用坐标向地图瓦片服务请求图块，也就是说大致位置会被发送给地图提供方。文件本身不会离开这台设备。",
    consentAgree: "我明白了，加载地图",
    privacyNote: "文件不会离开这台设备",
    useRawData: "使用原始坐标，不做平滑处理",
    accuracyLimit: "精度上限",
    outlierFilter: "过滤异常记录点",
    outlierConservative: "保守过滤",
    outlierOff: "关闭",
    exactDates: "手动指定日期",
    startDate: "开始日期",
    endDate: "结束日期",
    videoTitle: "视频标题",
    duration: "视频时长",
    seconds: "{n} 秒",
    cameraMotion: "镜头运动",
    cameraFixed: "固定",
    cameraSteady: "缓慢跟随",
    cameraDynamic: "动感",
    videoSize: "画面比例",
    sizeSquare: "正方形",
    sizePortrait: "竖屏",
    sizeLandscape: "横屏",
    preview: "预览",
    createVideo: "生成视频",
    cancelVideo: "取消生成",
    shareVideo: "分享",
    downloadVideo: "下载",
    language: "语言",
    systemDefault: "跟随系统",
    personA: "第一个人",
    personB: "第二个人",
    meetRadius: "判定为“靠近”的距离",
    meetMinDuration: "判定为“靠近”的最短时间",
    hideHome: "隐藏家附近的区域",
    hideHomeRadius: "视为家的半径",
    showSummary: "查看摘要",
    meetingsFound: "共同的瞬间：{n}",
    noMeetings: "没有找到重叠的瞬间",
    totalTogether: "一起度过的时间：{n}",
    favouriteSpot: "最常相遇的地方：{n}次",
    farthestApart: "相距最远的瞬间：{n}",
    parseFailed: "无法读取该文件，请确认它是 Timeline.json",
    rendering: "正在生成视频",
    webmFallback: "此浏览器无法生成 mp4，已改为下载 webm 格式",
    attribution: "地图数据来源",
    hoursUnit: "小时",
    kmUnit: "公里",
    minutesUnit: "分钟",
    metersUnit: "m",
    noMeetingsReasonHeading: "可能的原因",
    noMeetingsReasonDateRange: "两人的记录时间段可能没有重叠",
    noMeetingsReasonRadius: "判定为“靠近”的距离可能设置得太窄",
    noMeetingsReasonAccuracy: "精度过滤可能过滤掉了太多记录",
    noMeetingsReasonGenuine: "也可能你们确实没有靠近过",
    showMoreMeetings: "再显示 {n} 条",
    showLessMeetings: "收起",
  },
  "zh-Hant": {
    title: "我們一起走過的路",
    intro:
      "把兩個人的 Google 時間軸疊在一起，在地圖上找出彼此靠近的那些瞬間。",
    chooseA: "第一個人的 Timeline.json",
    chooseB: "第二個人的 Timeline.json",
    trySample: "用範例旅程試試看",
    consentTitle: "開始之前",
    consentBody:
      "為了繪製地圖，我們需要用座標向地圖圖磚服務請求圖塊，也就是說大致位置會被傳送給地圖提供方。檔案本身不會離開這台裝置。",
    consentAgree: "我了解了，載入地圖",
    privacyNote: "檔案不會離開這台裝置",
    useRawData: "使用原始座標，不做平滑處理",
    accuracyLimit: "精確度上限",
    outlierFilter: "過濾異常記錄點",
    outlierConservative: "保守過濾",
    outlierOff: "關閉",
    exactDates: "手動指定日期",
    startDate: "開始日期",
    endDate: "結束日期",
    videoTitle: "影片標題",
    duration: "影片長度",
    seconds: "{n} 秒",
    cameraMotion: "鏡頭運動",
    cameraFixed: "固定",
    cameraSteady: "緩慢跟隨",
    cameraDynamic: "動感",
    videoSize: "畫面比例",
    sizeSquare: "正方形",
    sizePortrait: "直式",
    sizeLandscape: "橫式",
    preview: "預覽",
    createVideo: "產生影片",
    cancelVideo: "取消產生",
    shareVideo: "分享",
    downloadVideo: "下載",
    language: "語言",
    systemDefault: "跟隨系統",
    personA: "第一個人",
    personB: "第二個人",
    meetRadius: "判定為「靠近」的距離",
    meetMinDuration: "判定為「靠近」的最短時間",
    hideHome: "隱藏住家附近的區域",
    hideHomeRadius: "視為住家的半徑",
    showSummary: "查看摘要",
    meetingsFound: "共同的瞬間：{n}",
    noMeetings: "沒有找到重疊的瞬間",
    totalTogether: "一起度過的時間：{n}",
    favouriteSpot: "最常相遇的地方：{n}次",
    farthestApart: "相距最遠的瞬間：{n}",
    parseFailed: "無法讀取該檔案，請確認它是 Timeline.json",
    rendering: "正在產生影片",
    webmFallback: "這個瀏覽器無法產生 mp4，已改為下載 webm 格式",
    attribution: "地圖資料來源",
    hoursUnit: "小時",
    kmUnit: "公里",
    minutesUnit: "分鐘",
    metersUnit: "m",
    noMeetingsReasonHeading: "可能的原因",
    noMeetingsReasonDateRange: "兩人的記錄時間段可能沒有重疊",
    noMeetingsReasonRadius: "判定為「靠近」的距離可能設得太窄",
    noMeetingsReasonAccuracy: "精確度過濾可能濾掉了太多記錄",
    noMeetingsReasonGenuine: "也可能你們確實沒有靠近過",
    showMoreMeetings: "再顯示 {n} 筆",
    showLessMeetings: "收合",
  },
  es: {
    title: "El camino que recorrimos juntos",
    intro:
      "Superpone las líneas de tiempo de Google de dos personas y encuentra en el mapa los momentos en que estuvieron cerca.",
    chooseA: "Timeline.json de la primera persona",
    chooseB: "Timeline.json de la segunda persona",
    trySample: "Probar con un viaje de ejemplo",
    consentTitle: "Antes de empezar",
    consentBody:
      "Para dibujar el mapa necesitamos pedir los mosaicos usando tus coordenadas, lo que significa que una ubicación aproximada se envía al proveedor de mapas. Los archivos en sí nunca salen de este dispositivo.",
    consentAgree: "Entendido, cargar el mapa",
    privacyNote: "Tus archivos nunca salen de este dispositivo",
    useRawData: "Usar coordenadas originales, sin suavizado",
    accuracyLimit: "Límite de precisión",
    outlierFilter: "Filtrar puntos anómalos",
    outlierConservative: "Conservador",
    outlierOff: "Desactivado",
    exactDates: "Elegir fechas exactas",
    startDate: "Fecha de inicio",
    endDate: "Fecha de fin",
    videoTitle: "Título del video",
    duration: "Duración del video",
    seconds: "{n} seg",
    cameraMotion: "Movimiento de cámara",
    cameraFixed: "Fija",
    cameraSteady: "Seguimiento suave",
    cameraDynamic: "Dinámica",
    videoSize: "Formato de video",
    sizeSquare: "Cuadrado",
    sizePortrait: "Vertical",
    sizeLandscape: "Horizontal",
    preview: "Vista previa",
    createVideo: "Crear video",
    cancelVideo: "Cancelar creación",
    shareVideo: "Compartir",
    downloadVideo: "Descargar",
    language: "Idioma",
    systemDefault: "Predeterminado del sistema",
    personA: "Primera persona",
    personB: "Segunda persona",
    meetRadius: "Distancia para considerar \"cerca\"",
    meetMinDuration: "Tiempo mínimo para considerar \"cerca\"",
    hideHome: "Ocultar la zona alrededor de casa",
    hideHomeRadius: "Radio considerado como casa",
    showSummary: "Ver resumen",
    meetingsFound: "Momentos juntos: {n}",
    noMeetings: "No se encontraron momentos en común",
    totalTogether: "Tiempo pasado juntos: {n}",
    favouriteSpot: "Lugar donde más se encontraron: {n} veces",
    farthestApart: "El momento en que estuvieron más lejos: {n}",
    parseFailed:
      "No se pudo leer ese archivo. Comprueba que sea un Timeline.json",
    rendering: "Generando tu video",
    webmFallback:
      "Este navegador no puede generar mp4, así que descargaremos un webm en su lugar",
    attribution: "Datos del mapa por",
    hoursUnit: "h",
    kmUnit: "km",
    minutesUnit: "min",
    metersUnit: "m",
    noMeetingsReasonHeading: "Posibles razones",
    noMeetingsReasonDateRange: "Puede que los dos rangos de fechas no se superpongan",
    noMeetingsReasonRadius: "La distancia considerada \"cerca\" puede ser demasiado estricta",
    noMeetingsReasonAccuracy: "El filtro de precisión puede haber descartado demasiados puntos",
    noMeetingsReasonGenuine: "Puede que de verdad no hayan estado cerca",
    showMoreMeetings: "Mostrar {n} más",
    showLessMeetings: "Mostrar menos",
  },
  fr: {
    title: "Le chemin parcouru ensemble",
    intro:
      "Superposez les frises Google Timeline de deux personnes et retrouvez sur la carte les moments où vous étiez proches l'un de l'autre.",
    chooseA: "Timeline.json de la première personne",
    chooseB: "Timeline.json de la deuxième personne",
    trySample: "Essayer avec un voyage d'exemple",
    consentTitle: "Avant de commencer",
    consentBody:
      "Pour dessiner la carte, nous devons demander des tuiles à partir de vos coordonnées, ce qui signifie qu'une position approximative est envoyée au fournisseur de cartes. Les fichiers eux-mêmes ne quittent jamais cet appareil.",
    consentAgree: "Compris, charger la carte",
    privacyNote: "Vos fichiers ne quittent jamais cet appareil",
    useRawData: "Utiliser les coordonnées brutes, sans lissage",
    accuracyLimit: "Limite de précision",
    outlierFilter: "Filtrer les points aberrants",
    outlierConservative: "Prudent",
    outlierOff: "Désactivé",
    exactDates: "Choisir des dates précises",
    startDate: "Date de début",
    endDate: "Date de fin",
    videoTitle: "Titre de la vidéo",
    duration: "Durée de la vidéo",
    seconds: "{n} s",
    cameraMotion: "Mouvement de caméra",
    cameraFixed: "Fixe",
    cameraSteady: "Suivi en douceur",
    cameraDynamic: "Dynamique",
    videoSize: "Format de la vidéo",
    sizeSquare: "Carré",
    sizePortrait: "Portrait",
    sizeLandscape: "Paysage",
    preview: "Aperçu",
    createVideo: "Créer la vidéo",
    cancelVideo: "Annuler la création",
    shareVideo: "Partager",
    downloadVideo: "Télécharger",
    language: "Langue",
    systemDefault: "Paramètre du système",
    personA: "Première personne",
    personB: "Deuxième personne",
    meetRadius: "Distance considérée comme « proche »",
    meetMinDuration: "Durée minimale considérée comme « proche »",
    hideHome: "Masquer la zone autour du domicile",
    hideHomeRadius: "Rayon considéré comme le domicile",
    showSummary: "Voir le résumé",
    meetingsFound: "Moments ensemble : {n}",
    noMeetings: "Aucun moment commun trouvé",
    totalTogether: "Temps passé ensemble : {n}",
    favouriteSpot: "Lieu de rencontre le plus fréquent : {n} fois",
    farthestApart: "Moment où vous étiez le plus éloignés : {n}",
    parseFailed:
      "Impossible de lire ce fichier. Vérifiez qu'il s'agit bien d'un Timeline.json",
    rendering: "Création de votre vidéo en cours",
    webmFallback:
      "Ce navigateur ne peut pas produire de mp4, un fichier webm sera téléchargé à la place",
    attribution: "Données cartographiques par",
    hoursUnit: "h",
    kmUnit: "km",
    minutesUnit: "min",
    metersUnit: "m",
    noMeetingsReasonHeading: "Raisons possibles",
    noMeetingsReasonDateRange: "Les deux périodes enregistrées ne se chevauchent peut-être pas",
    noMeetingsReasonRadius: "La distance considérée comme « proche » était peut-être trop stricte",
    noMeetingsReasonAccuracy: "Le filtre de précision a peut-être écarté trop de points",
    noMeetingsReasonGenuine: "Vous n'étiez peut-être vraiment pas proches",
    showMoreMeetings: "Afficher {n} de plus",
    showLessMeetings: "Réduire",
  },
  de: {
    title: "Der Weg, den wir gemeinsam gegangen sind",
    intro:
      "Legt die Google-Timeline-Daten zweier Personen übereinander und findet auf der Karte die Momente, in denen ihr nah beieinander wart.",
    chooseA: "Timeline.json der ersten Person",
    chooseB: "Timeline.json der zweiten Person",
    trySample: "Mit einer Beispielreise ausprobieren",
    consentTitle: "Bevor es losgeht",
    consentBody:
      "Um die Karte zu zeichnen, fragen wir Kartenkacheln anhand eurer Koordinaten ab. Das heißt, ein ungefährer Standort wird an den Kartenanbieter übermittelt. Die Dateien selbst verlassen dieses Gerät nie.",
    consentAgree: "Verstanden, Karte laden",
    privacyNote: "Eure Dateien verlassen dieses Gerät nie",
    useRawData: "Rohkoordinaten ohne Glättung verwenden",
    accuracyLimit: "Genauigkeitsgrenze",
    outlierFilter: "Ausreißerpunkte herausfiltern",
    outlierConservative: "Zurückhaltend",
    outlierOff: "Aus",
    exactDates: "Genaue Daten festlegen",
    startDate: "Startdatum",
    endDate: "Enddatum",
    videoTitle: "Videotitel",
    duration: "Videolänge",
    seconds: "{n} Sek.",
    cameraMotion: "Kamerabewegung",
    cameraFixed: "Fest",
    cameraSteady: "Sanft folgen",
    cameraDynamic: "Dynamisch",
    videoSize: "Seitenverhältnis",
    sizeSquare: "Quadratisch",
    sizePortrait: "Hochformat",
    sizeLandscape: "Querformat",
    preview: "Vorschau",
    createVideo: "Video erstellen",
    cancelVideo: "Videoerstellung abbrechen",
    shareVideo: "Teilen",
    downloadVideo: "Herunterladen",
    language: "Sprache",
    systemDefault: "Systemstandard",
    personA: "Erste Person",
    personB: "Zweite Person",
    meetRadius: "Entfernung, die als „nah“ zählt",
    meetMinDuration: "Mindestdauer, die als „nah“ zählt",
    hideHome: "Bereich um zu Hause ausblenden",
    hideHomeRadius: "Radius, der als Zuhause gilt",
    showSummary: "Zusammenfassung ansehen",
    meetingsFound: "Gemeinsame Momente: {n}",
    noMeetings: "Keine gemeinsamen Momente gefunden",
    totalTogether: "Gemeinsam verbrachte Zeit: {n}",
    favouriteSpot: "Häufigster Treffpunkt: {n} Mal",
    farthestApart: "Der Moment mit der größten Entfernung: {n}",
    parseFailed:
      "Diese Datei konnte nicht gelesen werden. Bitte prüft, ob es sich um eine Timeline.json handelt",
    rendering: "Video wird erstellt",
    webmFallback:
      "Dieser Browser kann kein mp4 erzeugen, daher wird stattdessen ein webm heruntergeladen",
    attribution: "Kartendaten von",
    hoursUnit: "Std.",
    kmUnit: "km",
    minutesUnit: "Min.",
    metersUnit: "m",
    noMeetingsReasonHeading: "Mögliche Gründe",
    noMeetingsReasonDateRange: "Die beiden Aufzeichnungszeiträume überschneiden sich vielleicht nicht",
    noMeetingsReasonRadius: "Die als „nah“ geltende Entfernung war vielleicht zu streng",
    noMeetingsReasonAccuracy: "Der Genauigkeitsfilter hat vielleicht zu viele Punkte verworfen",
    noMeetingsReasonGenuine: "Ihr wart vielleicht wirklich nicht nah beieinander",
    showMoreMeetings: "{n} weitere anzeigen",
    showLessMeetings: "Weniger anzeigen",
  },
  pt: {
    title: "O caminho que percorremos juntos",
    intro:
      "Sobreponha a linha do tempo do Google de duas pessoas e encontre no mapa os momentos em que vocês estiveram próximos.",
    chooseA: "Timeline.json da primeira pessoa",
    chooseB: "Timeline.json da segunda pessoa",
    trySample: "Testar com uma viagem de exemplo",
    consentTitle: "Antes de começar",
    consentBody:
      "Para desenhar o mapa, precisamos pedir os blocos de mapa usando suas coordenadas, ou seja, uma localização aproximada é enviada ao provedor de mapas. Os arquivos em si nunca saem deste dispositivo.",
    consentAgree: "Entendi, carregar o mapa",
    privacyNote: "Seus arquivos nunca saem deste dispositivo",
    useRawData: "Usar coordenadas originais, sem suavização",
    accuracyLimit: "Limite de precisão",
    outlierFilter: "Filtrar pontos fora da curva",
    outlierConservative: "Conservador",
    outlierOff: "Desligado",
    exactDates: "Definir datas exatas",
    startDate: "Data de início",
    endDate: "Data de término",
    videoTitle: "Título do vídeo",
    duration: "Duração do vídeo",
    seconds: "{n} seg",
    cameraMotion: "Movimento de câmera",
    cameraFixed: "Fixa",
    cameraSteady: "Acompanhamento suave",
    cameraDynamic: "Dinâmica",
    videoSize: "Formato do vídeo",
    sizeSquare: "Quadrado",
    sizePortrait: "Retrato",
    sizeLandscape: "Paisagem",
    preview: "Pré-visualizar",
    createVideo: "Criar vídeo",
    cancelVideo: "Cancelar criação",
    shareVideo: "Compartilhar",
    downloadVideo: "Baixar",
    language: "Idioma",
    systemDefault: "Padrão do sistema",
    personA: "Primeira pessoa",
    personB: "Segunda pessoa",
    meetRadius: "Distância considerada \"perto\"",
    meetMinDuration: "Tempo mínimo considerado \"perto\"",
    hideHome: "Ocultar a área ao redor de casa",
    hideHomeRadius: "Raio considerado como casa",
    showSummary: "Ver resumo",
    meetingsFound: "Momentos juntos: {n}",
    noMeetings: "Nenhum momento em comum encontrado",
    totalTogether: "Tempo passado juntos: {n}",
    favouriteSpot: "Local de encontro mais frequente: {n} vezes",
    farthestApart: "O momento em que estiveram mais distantes: {n}",
    parseFailed:
      "Não foi possível ler esse arquivo. Verifique se é um Timeline.json",
    rendering: "Gerando seu vídeo",
    webmFallback:
      "Este navegador não consegue gerar mp4, então vamos baixar um webm no lugar",
    attribution: "Dados do mapa por",
    hoursUnit: "h",
    kmUnit: "km",
    minutesUnit: "min",
    metersUnit: "m",
    noMeetingsReasonHeading: "Possíveis motivos",
    noMeetingsReasonDateRange: "Os dois períodos registrados podem não ter se sobreposto",
    noMeetingsReasonRadius: "A distância considerada \"perto\" pode ter sido rígida demais",
    noMeetingsReasonAccuracy: "O filtro de precisão pode ter descartado registros demais",
    noMeetingsReasonGenuine: "Vocês podem realmente não ter estado perto",
    showMoreMeetings: "Mostrar mais {n}",
    showLessMeetings: "Mostrar menos",
  },
};
