import type { Landing } from "./types";

const vi: Landing = {
  meta: {
    title: "Đếm Lương: Lương theo giây",
    description:
      "Ứng dụng iPhone và Android cho thấy số tiền bạn đang kiếm được ngay lúc này, từng giây một. Có widget, màn hình khóa, StandBy và cuộc đua với lương của bất kỳ ai.",
  },
  appName: "Đếm Lương",
  tagline: "Xem lương tăng từng giây",
  iconAlt: "Biểu tượng ứng dụng Đếm Lương",
  languageLabel: "Ngôn ngữ",
  hero: {
    appStore: "Tải về trên App Store",
    play: "Tải trên Google Play",
    requirements: "iOS 17 · Android 7.0 trở lên · Miễn phí",
  },
  money: { locale: "vi-VN", prefix: "₫", suffix: "" },
  salary: { me: 120_000_000, boss: 300_000_000 },
  eyebrow: {
    features: "Tính năng",
    race: "Cuộc đua so sánh",
    faq: "Câu hỏi thường gặp",
    support: "Liên hệ và hỗ trợ",
  },
  ticker: {
    units: { year: "Năm", month: "Tháng", day: "Ngày" },
    unitNames: { year: "Lương năm", month: "Lương tháng", day: "Lương ngày" },
    since: "Từ 0 giờ hôm nay",
    perSecond: (a) => `${a} mỗi giây`,
  },
  features: [
    { title: "Một giây đáng bao nhiêu", tail: "Theo năm, tháng, ngày hoặc giờ" },
    { title: "Cả ngày · Giờ làm", tail: "Cả lúc ngủ, hoặc chỉ khi làm việc" },
    { title: "Lịch theo tuần · Ca kíp", tail: "Trừ một quãng nghỉ, cả ca đêm" },
    { title: "Mong muốn", tail: "Lấp đầy món đồ muốn mua bằng tiền làm ra" },
    { title: "Lương lúc lười", tail: "Công ty trả bao nhiêu cho lúc bạn đi cà phê" },
    { title: "Cuộc đua so sánh", tail: "Từ ly cà phê đến chiếc xe mới" },
    { title: "Widget · Màn hình khóa · StandBy", tail: "Không cần mở ứng dụng" },
    { title: "20 loại tiền · 12 ngôn ngữ", tail: "Cả ứng dụng lẫn widget" },
  ],
  race: {
    me: "Tôi",
    boss: "Sếp",
    goal: 80_000,
    goalTitle: (a) => `Một tô phở · đến ${a}`,
    speed: "1000×",
    arrived: "Về đích",
    summary: (t, a) => `Trong ${t} sếp kiếm đủ tiền một tô phở, tôi được ${a}.`,
    duration: (h, m) => `${h} giờ ${m} phút`,
  },
  stay: {
    since: (s) => `Từ lúc mở trang này: ${s}`,
    spent: (m, s) => (m > 0 ? `${m} phút ${s} giây` : `${s} giây`),
    footnote: "Tính theo lương năm ₫120.000.000. Ứng dụng sẽ tính theo lương của bạn.",
  },
  statement: {
    headline: "Khi cuộc họp kéo dài, hãy nhìn màn hình: bạn sẽ thấy cuộc họp đó tốn bao nhiêu tiền.",
    body: "Tôi làm ứng dụng này vì muốn ngày nào cũng thấy con số mà thường chỉ cảm nhận được vào ngày lĩnh lương. Mức lương bạn nhập không rời khỏi thiết bị này.",
  },
  faq: [
    {
      q: "Số trên widget không tăng mỗi giây",
      a: "Vì iOS vẽ widget theo dòng thời gian được chuẩn bị trước. Ứng dụng chuẩn bị mỗi lần 30 phút, dùng hết thì chuyển sang đợt tiếp theo. Mỗi lần vẽ lại đều tính đúng tại thời điểm đó, nên số tiền hiển thị luôn chính xác.",
    },
    {
      q: "Có xem được lương thực nhận không?",
      a: "Chưa. Thuế và các khoản bảo hiểm phụ thuộc quá nhiều điều kiện, nên thay vì dùng công thức chưa kiểm chứng, tính năng này tạm hoãn. Hiện mọi số đều là trước thuế.",
    },
    {
      q: "Lương của người để so sánh lấy từ đâu?",
      a: "Đều do bạn tự nhập. Ứng dụng không có sẵn người để so sánh.",
    },
    {
      q: "Đổi loại tiền có quy đổi theo tỷ giá không?",
      a: "Không. Chỉ đổi cách hiển thị. Ở Mỹ, cà phê thì cứ là $5 thôi.",
    },
    {
      q: "Lương của tôi có bị gửi đi đâu không?",
      a: "Không. Không cần đăng ký; lương, cài đặt và ảnh mong muốn chỉ nằm trên thiết bị này. Tuy nhiên ứng dụng có quảng cáo (AdMob) và thống kê sử dụng (Firebase), nên Google xử lý một số thông tin thiết bị. Trên iPhone, quyền theo dõi cho quảng cáo cá nhân hóa được hỏi ở lần mở đầu tiên, và từ chối thì vẫn dùng được mọi tính năng.",
    },
    {
      q: "Có tắt quảng cáo được không?",
      a: "Xem một quảng cáo trong Cài đặt, banner phía dưới sẽ biến mất trong 12 giờ. Không có gì phải mua.",
    },
  ],
  support: { privacy: "Chính sách quyền riêng tư" },
};

export default vi;
