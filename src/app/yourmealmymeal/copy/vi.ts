import type { Copy } from "./types";

const vi: Copy = {
  appName: "Cơm bạn, cơm mình",
  quote: ["“", "”"],
  store: { download: "Tải về" },

  landing: {
    meta: {
      title: "Cơm bạn, cơm mình",
      description:
        "Ứng dụng giúp bạn lấp từng ô trên khay cơm bằng ảnh bữa sáng, trưa, tối và cùng gia đình, bạn bè quan tâm nhau. Trang giới thiệu và hỗ trợ của ứng dụng “Cơm bạn, cơm mình” trên iOS và Android.",
      ogTitle: "Cơm bạn, cơm mình — Thay vì hỏi “Ăn cơm chưa?”",
      ogDescription:
        "Ứng dụng giúp bạn lấp từng ô trên khay cơm bằng ảnh bữa sáng, trưa, tối và cùng gia đình, bạn bè quan tâm nhau.",
      ogAlt: "Ảnh giới thiệu “Cơm bạn, cơm mình”: khay cơm trắng trên nền vàng lòng đỏ trứng, chỉ ô bữa trưa được tô màu cà chua",
    },
    trayTitle: "Khay cơm của “Cơm bạn, cơm mình”",
    greetings: ["Hôm nay ăn gì thế?", "Ăn uống đầy đủ chưa?", "Bữa trưa ngon không?", "Bữa tối nay, như đang ăn cùng nhau"],
    tagline: "Chỉ một tấm ảnh bữa ăn, chia sẻ khay cơm hôm nay với gia đình, bạn bè.",
    together: {
      title: "Mâm cơm chung",
      lead: "Khay cơm của 2–6 người tụ lại bằng mã mời được đặt chung một mâm. Ai chưa ăn, không cần hỏi cũng thấy.",
    },
    featuresTitle: "Bạn có thể làm gì",
    features: [
      { title: "Từng ô một", tail: "Chụp hoặc chọn từ album, đặt gọn vào ô" },
      { title: "Tự chọn khung ảnh", tail: "Kéo, phóng to để món ăn không bị cắt" },
      { title: "Ô trống thì Chọc", tail: "Chưa ăn thì khẽ chọc một cái" },
      { title: "Một khay cơm thôi", tail: "Đăng một lần, hiện ở mọi nhóm" },
      { title: "Cảm xúc · Bình luận", tail: "Một câu “Trông ngon quá” là đủ" },
      { title: "Cả ngày trong một ảnh", tail: "Lưu khay cơm hôm đó vào thư viện ảnh" },
    ],
    statement: { before: "Thay vì hỏi “Ăn cơm chưa?”, ", em: "ô trống", after: " sẽ lên tiếng trước." },
    story: [
      "Với người sống một mình, bữa ăn thường là thứ đầu tiên bị qua loa. Cách duy nhất để biết là gọi điện hỏi, và câu trả lời hầu như luôn là “Ăn rồi”.",
      "Vì vậy, thay vì hỏi, chúng tôi làm cho mọi người nhìn thấy được. Đây không phải ứng dụng tự động hóa lời cằn nhằn, mà là ứng dụng giúp bớt công hỏi han nhau. Vì thế nó không trách móc ô trống. Mỗi ngày có ba bữa chính, bữa phụ chỉ là thêm vào.",
    ],
    faqTitle: "Câu hỏi thường gặp",
    faq: [
      {
        q: "Ai có thể xem ảnh của tôi?",
        a: "Chỉ những người cùng nhóm với bạn. Giới hạn này được đặt ngay trong cơ sở dữ liệu chứ không phải trên giao diện ứng dụng, nên dù có sửa ứng dụng cũng không lấy được bữa ăn của người khác. Kho ảnh là riêng tư và liên kết xem ảnh chỉ có hiệu lực trong thời gian ngắn.",
      },
      {
        q: "Tôi có thể vào cả nhóm gia đình lẫn nhóm bạn bè không?",
        a: "Được. Mỗi người chỉ có một khay cơm, nên đăng bữa sáng một lần là nó hiện ở tất cả các nhóm bạn tham gia. Không cần đăng riêng cho từng nhóm.",
      },
      {
        q: "Tôi có thể gửi Chọc bao nhiêu lần?",
        a: "Để không thành “bom thông báo”, máy chủ đếm số lần mỗi ngày. Dùng hết thì bạn có thể xem một quảng cáo ngắn để nhận thêm vài lần, và việc này cũng có giới hạn mỗi ngày. Ô bữa phụ chỉ là thêm vào nên không Chọc được.",
      },
      {
        q: "Ứng dụng có quảng cáo không?",
        a: "Có quảng cáo toàn màn hình thỉnh thoảng hiện ra sau khi bạn xem xong ảnh hoặc đăng ảnh xong, và quảng cáo có thưởng chỉ xem khi bạn muốn nhận thêm lượt Chọc. Không có banner luôn hiện trên màn hình. Chúng tôi cũng thu thập số liệu sử dụng để cải thiện ứng dụng. Chi tiết có trong Chính sách quyền riêng tư.",
      },
      {
        q: "Xóa tài khoản thì sẽ thế nào?",
        a: "Bạn có thể xóa ngay trong ứng dụng. Mọi ảnh và ghi chép đã đăng sẽ biến mất và không thể khôi phục. Nhóm bạn tạo sẽ được chuyển cho người ở lâu nhất trong số những người còn lại; nếu không còn ai, nhóm cũng bị xóa theo.",
      },
    ],
    closing: {
      title: "Bữa tối nay, như đang ăn cùng nhau",
      body: "Nếu có góp ý tính năng hay câu hỏi, cứ gửi email cho chúng tôi bất cứ lúc nào nhé.",
      privacy: "Chính sách quyền riêng tư",
      deleteAccount: "Hướng dẫn xóa tài khoản",
    },
  },

  join: {
    meta: {
      title: "Ăn cơm chưa? · Cơm bạn, cơm mình",
      description:
        "Bạn được mời vào mâm cơm. Hãy ghi lại bữa ăn hôm nay lên khay cơm. Sao chép mã mời và nhập vào ứng dụng để vào nhóm.",
      ogTitle: "Ăn cơm chưa?",
      ogDescription: "Bạn được mời vào mâm cơm · Hãy ghi lại bữa ăn hôm nay lên khay cơm",
      ogAlt: "Ảnh lời mời: khay cơm trắng với bốn ô còn trống ở giữa nền vàng nhạt, hai bên là thìa màu cà chua và nĩa màu bạc hà",
    },
    trayTitle: "Khay cơm trống, chưa có gì",
    title: "Ăn cơm chưa?",
    sub: "Ghi lại bữa ăn hôm nay lên khay cơm nhé!",
    pill: "Được mời vào mâm cơm · Cùng lấp đầy",
    step1: "Sao chép mã mời",
    copyAria: "Sao chép mã mời {code}",
    noCodeAria: "Không có mã mời",
    copied: "Đã sao chép!",
    missing: ["Liên kết không có mã mời hoặc bị cắt mất.", "Hãy xin lại mã từ người đã mời bạn."],
    step2: "Cài ứng dụng rồi nhập mã",
    hint: { before: "Tab ", tab: "Nhóm", after: " ở dưới", add: "Thêm nhóm", join: "Vào nhóm bằng mã mời" },
    openInApp: "Đã có ứng dụng? · Mở trong ứng dụng",
    limit: "Mỗi nhóm tối đa 6 người. Đủ người rồi thì không vào được.",
    about: "Giới thiệu",
    privacy: "Quyền riêng tư",
  },

  shell: {
    homeAria: "Về trang đầu Cơm bạn, cơm mình",
    about: "Giới thiệu",
    privacy: "Quyền riêng tư",
    deleteAccount: "Xóa tài khoản",
    language: "Ngôn ngữ",
  },

  legal: {
    badge: "Cơm bạn, cơm mình · Legal",
    updated: "Cập nhật lần cuối",
    koreanPrevails: "Đây là bản dịch; nếu có khác biệt, bản tiếng Hàn sẽ được ưu tiên.",
    koreanLink: "Xem bản tiếng Hàn",
  },

  privacy: {
    title: "Chính sách quyền riêng tư của Cơm bạn, cơm mình",
    description:
      "Hướng dẫn về thông tin mà ứng dụng “Cơm bạn, cơm mình” trên iOS và Android xử lý, ai có thể xem ảnh và ghi chép bữa ăn, và cách xóa tài khoản.",
    updatedAt: "Ngày 16 tháng 10 năm 2026",
    sections: [
      {
        h: "1. Tổng quan",
        blocks: [
          {
            p: "“Cơm bạn, cơm mình” (네밥내밥, sau đây gọi là “Ứng dụng”) là ứng dụng iOS và Android giúp ghi lại bữa ăn hôm nay bằng ảnh và chia sẻ với những người cùng nhóm. Chính sách này giải thích thông tin mà Ứng dụng xử lý, mục đích xử lý và các lựa chọn của người dùng.",
          },
          { p: "Tóm tắt như sau." },
          {
            ul: [
              "Ảnh và ghi chép bữa ăn **chỉ hiển thị với những người cùng nhóm với bạn**.",
              "Ứng dụng hiển thị **quảng cáo toàn màn hình và quảng cáo có thưởng của Google AdMob**. Quảng cáo toàn màn hình thỉnh thoảng hiện ra chiếm cả màn hình sau khi bạn xem xong ảnh hoặc đăng ảnh xong; quảng cáo có thưởng do người dùng tự chọn xem khi đã dùng hết lượt Chọc. Không có quảng cáo banner luôn hiện trên màn hình. Ứng dụng dùng Google Analytics for Firebase để thống kê sử dụng. Tên, email, ảnh và ghi chép bữa ăn không được chuyển cho các dịch vụ này.",
              "Trên iOS, sau khi đăng nhập, Ứng dụng sẽ **hỏi trước bạn có cho phép theo dõi quảng cáo hay không**; dù từ chối, bạn vẫn dùng được mọi tính năng của Ứng dụng.",
              "Bạn có thể **tự xóa tài khoản ngay trong Ứng dụng**; khi xóa, ảnh và ghi chép cũng bị xóa theo.",
            ],
          },
          { p: "Mọi thắc mắc xin vui lòng liên hệ [contact@joowonkoh.com](contact)." },
        ],
      },
      {
        h: "2. Thông tin thu thập",
        blocks: [
          {
            ul: [
              "**Địa chỉ email** — Nhận qua đăng nhập Apple hoặc Google. Chỉ dùng để xác định người đăng nhập là ai.",
              "**Tên hiển thị** — Tên mà những người trong nhóm nhìn thấy. Người dùng tự đặt và có thể sửa bất cứ lúc nào.",
              "**Ảnh bữa ăn** — Ảnh do người dùng tự chụp hoặc chọn từ album. Đây chính là mục đích của Ứng dụng.",
              "**Ngày và bữa ăn** — Cần để xác định đó là bữa nào của ngày nào.",
              "**Mã thông báo đẩy (push token) của thiết bị** — Lưu lại để biết gửi thông báo đến đâu.",
              "**Bình luận** — Nội dung để lại dưới bữa ăn của người cùng nhóm. Chỉ hiển thị với người trong nhóm đó.",
              "**Ảnh đại diện** — Ảnh do người dùng tự tải lên. Chỉ hiển thị với những người cùng nhóm với bạn.",
              "**Ghi nhận báo cáo và chặn** — Ai đã báo cáo nội dung gì và vì sao, đã chặn ai. Chỉ dùng để xử lý nội dung không phù hợp.",
              "**Mã định danh tài khoản** — Chuỗi ký tự ngẫu nhiên được tạo tự động khi đăng ký. Chỉ dùng để liên kết ảnh và ghi chép với chủ sở hữu, và khác với tên hay email, nó không hiện trên màn hình.",
            ],
          },
          { p: "Các thông tin sau được xử lý cho quảng cáo và thống kê sử dụng." },
          {
            ul: [
              "**Thông tin sử dụng ứng dụng** — Màn hình đã xem và tính năng đã nhấn, ID phiên bản ứng dụng (app instance ID), loại thiết bị và hệ điều hành, khu vực ước lượng. Dùng để biết tính năng nào được sử dụng và cải thiện ứng dụng; do Google Analytics for Firebase xử lý.",
              "**Mã định danh quảng cáo và thông tin quảng cáo** — IDFA trên iOS hoặc ID quảng cáo trên Android, thông tin hiển thị và nhấp quảng cáo. Dùng để hiển thị quảng cáo và đo hiệu quả; do Google AdMob xử lý. Trên iOS, nếu bạn từ chối “Cho phép ứng dụng theo dõi”, IDFA sẽ không được dùng và quảng cáo không cá nhân hóa sẽ được hiển thị.",
            ],
          },
          {
            p: "Ứng dụng không truy cập vị trí chính xác, danh bạ, lịch sử cuộc gọi, thông tin sức khỏe hay thông tin thanh toán.",
          },
        ],
      },
      {
        h: "3. Ai có thể xem",
        blocks: [
          {
            p: "Ảnh và ghi chép bữa ăn chỉ hiển thị với những người cùng nhóm. Giới hạn này **được đặt ngay trong cơ sở dữ liệu** (Row Level Security) chứ không phải trên giao diện ứng dụng, nên dù sửa ứng dụng hay trực tiếp giả lập kết nối cũng không lấy được bữa ăn của người khác.",
          },
          { p: "Kho ảnh là riêng tư, và liên kết để xem ảnh chỉ có hiệu lực trong thời gian ngắn." },
          {
            p: "Mã thông báo đẩy được lưu trong một bảng riêng mà chỉ chính bạn đọc được. Ngay cả người cùng nhóm cũng không thấy. Lý do là ai biết mã này có thể gửi thông báo tùy ý đến thiết bị đó.",
          },
          {
            p: "Bình luận và cảm xúc **chỉ hiển thị trong nhóm nơi chúng được để lại**. Dù cùng một bức ảnh, người ở nhóm khác cũng không thấy. Nội dung đã báo cáo hoặc chặn sẽ không còn hiển thị với người báo cáo hoặc chặn kể từ lúc đó.",
          },
        ],
      },
      {
        h: "4. Dịch vụ bên thứ ba",
        blocks: [
          {
            p: "Ứng dụng không bán thông tin cá nhân. Tên, email, ảnh và ghi chép bữa ăn không được cung cấp cho bên thứ ba vì mục đích quảng cáo hay phân tích. Các dịch vụ Ứng dụng sử dụng như sau.",
          },
          {
            ul: [
              "**Supabase** — Đăng nhập và lưu trữ dữ liệu. Máy chủ đặt tại Hàn Quốc (Seoul).",
              "**Cloudflare R2** — Lưu ảnh bữa ăn và ảnh đại diện. Được lưu riêng tư tại khu vực châu Á – Thái Bình Dương, và sau khi xác nhận quyền xem, ảnh được cung cấp qua địa chỉ chỉ có hiệu lực trong một giờ.",
              "**Expo** — Gửi thông báo. iOS đi qua Apple APNs, Android đi qua Google FCM. Nội dung thông báo và mã thiết bị được chuyển đi.",
              "**Apple / Google** — Đăng nhập. Nhận địa chỉ email.",
              "**Google AdMob** — Quảng cáo toàn màn hình và quảng cáo có thưởng. Mã định danh quảng cáo, thông tin hiển thị và nhấp quảng cáo, thông tin thiết bị được chuyển đi.",
              "**Google Analytics for Firebase** — Thống kê sử dụng. Thông tin sử dụng ứng dụng, ID phiên bản ứng dụng, thông tin thiết bị được chuyển đi.",
            ],
          },
          {
            p: "Bạn có thể xem cách Google xử lý các thông tin này tại [Cách Google sử dụng dữ liệu từ các trang web và ứng dụng của đối tác](google).",
          },
        ],
      },
      {
        h: "5. Thời gian lưu trữ",
        blocks: [
          {
            p: "Thông tin được lưu trong thời gian tài khoản còn tồn tại và bị xóa cùng khi bạn xóa tài khoản. Không có bản sao nào được lưu riêng. Số liệu thống kê sử dụng không gắn với tài khoản và sẽ bị xóa sau 2 tháng theo cài đặt mặc định của Google Analytics.",
          },
        ],
      },
      {
        h: "6. Xóa tài khoản",
        blocks: [
          { p: "Bạn có thể xóa ngay trong Ứng dụng: **Tôi > Xóa tài khoản**." },
          {
            p: "Khi xóa, hồ sơ và tên hiển thị, ảnh đại diện, tệp ảnh đã đăng, ghi chép bữa ăn, bình luận, cảm xúc, ghi nhận báo cáo và chặn, tư cách thành viên nhóm, mã thông báo đẩy đều bị xóa và không thể khôi phục.",
          },
          {
            p: "Nhóm bạn tạo sẽ được chuyển cho người ở lâu nhất trong số những người còn lại. Nếu không còn ai, nhóm cũng bị xóa theo. Một người rời đi không làm mất nhóm của những người khác.",
          },
        ],
      },
      {
        h: "7. Quyền của người dùng",
        blocks: [
          {
            ul: [
              "Bạn có thể sửa tên hiển thị trong Ứng dụng bất cứ lúc nào.",
              "Bạn có thể xóa ngay tài khoản và mọi ghi chép theo cách ở mục 6 bên trên. Nếu đã gỡ Ứng dụng, vui lòng xem [Hướng dẫn xóa tài khoản](deleteAccount).",
              "Bạn có thể bỏ chặn bất cứ lúc nào tại tab Tôi > Người đã chặn.",
              "Bạn có thể tắt thông báo bất cứ lúc nào trong cài đặt thiết bị.",
              "Bạn có thể tắt theo dõi quảng cáo hoặc xóa ID quảng cáo bất cứ lúc nào: trên iOS tại Cài đặt > Quyền riêng tư & Bảo mật > Theo dõi, trên Android tại Cài đặt > Google > Quảng cáo.",
              "Các yêu cầu xem, chỉnh sửa hoặc xóa khác, vui lòng liên hệ qua địa chỉ email ở trên.",
            ],
          },
        ],
      },
      {
        h: "8. Thông tin cá nhân của trẻ em",
        blocks: [
          {
            p: "Ứng dụng không dành cho trẻ em dưới 14 tuổi và không cố ý thu thập thông tin từ người dùng ở độ tuổi này.",
          },
        ],
      },
      {
        h: "9. Thay đổi chính sách",
        blocks: [
          {
            p: "Chính sách này có thể được sửa đổi để phản ánh thay đổi của pháp luật hoặc dịch vụ. Khi các mục thông tin được xử lý có thay đổi, chúng tôi sẽ cập nhật chính sách này trước khi phát hành phiên bản có tính năng đó và sửa ngày “Cập nhật lần cuối” cùng lúc.",
          },
        ],
      },
    ],
  },

  deleteAccount: {
    title: "Xóa tài khoản Cơm bạn, cơm mình",
    description:
      "Cách xóa tài khoản “Cơm bạn, cơm mình” cùng ảnh và ghi chép bữa ăn đã đăng. Bạn có thể xóa ngay trong ứng dụng, hoặc gửi yêu cầu qua email nếu không còn ứng dụng.",
    updatedAt: "Ngày 18 tháng 9 năm 2026",
    mailSubject: "[네밥내밥] Yêu cầu xóa tài khoản",
    sections: [
      {
        h: "Xóa ngay trong ứng dụng",
        blocks: [
          { p: "Đây là cách nhanh nhất. Không cần chờ xử lý yêu cầu, tài khoản bị xóa ngay tại chỗ." },
          {
            ol: [
              "Mở “Cơm bạn, cơm mình” và nhấn tab **Tôi** ở dưới màn hình.",
              "Nhấn **Xóa tài khoản**.",
              "Nhập **xóa** để xác nhận, nút sẽ được kích hoạt.",
            ],
          },
          {
            p: "Tab Tôi luôn hiển thị dù bạn không thuộc nhóm nào. Bạn có thể xóa ngay cả khi mới mở ứng dụng lần đầu và chỉ vừa đăng nhập.",
          },
        ],
      },
      {
        h: "Khi không còn ứng dụng",
        blocks: [
          {
            p: "Nếu bạn đã đổi thiết bị hoặc đã gỡ ứng dụng, vui lòng gửi yêu cầu qua email. Bạn cần gửi từ địa chỉ email đã dùng để đăng ký thì chúng tôi mới xác minh được danh tính.",
          },
          { p: "Gửi đến: [contact@joowonkoh.com](deleteMail)" },
          { p: "Chúng tôi sẽ xử lý trong vòng 7 ngày làm việc và phản hồi kết quả." },
        ],
      },
      {
        h: "Những gì bị xóa",
        blocks: [
          { p: "Các mục dưới đây bị xóa **ngay lập tức và không thể khôi phục**." },
          {
            ul: [
              "Tài khoản và thông tin đăng nhập (địa chỉ email, mã định danh tài khoản)",
              "Tên hiển thị",
              "Toàn bộ tệp ảnh bữa ăn đã đăng",
              "Ghi chép bữa ăn và ngày",
              "Cảm xúc đã để lại trên bữa ăn của người khác",
              "Tư cách thành viên nhóm",
              "Mã thông báo đẩy của thiết bị đã lưu để nhận thông báo",
            ],
          },
          {
            p: "Nhóm bạn tạo sẽ không biến mất. Nhóm được chuyển cho người ở lâu nhất trong số những người còn lại; nếu không còn ai, nhóm cũng bị xóa theo. Ghi chép của người khác không bị xóa theo.",
          },
        ],
      },
      {
        h: "Lưu lại bao lâu",
        blocks: [
          {
            p: "Không có thời gian lưu trữ riêng. Dữ liệu bị xóa vào thời điểm bạn nhấn xóa. Bản sao còn lại trên phương tiện sao lưu cũng sẽ biến mất trong tối đa 30 ngày theo chu kỳ sao lưu.",
          },
        ],
      },
      {
        h: "Xem thêm",
        blocks: [
          { p: "Chúng tôi thu thập thông tin gì và vì sao được ghi trong [Chính sách quyền riêng tư](privacy)." },
        ],
      },
    ],
  },
};

export default vi;
