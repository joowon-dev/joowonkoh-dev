import type { Privacy } from "./types";

const vi: Privacy = {
  meta: {
    title: "Chính sách quyền riêng tư của Đếm Lương",
    description:
      "Thông tin mà ứng dụng iOS và Android Đếm Lương xử lý, các dịch vụ bên thứ ba dùng cho quảng cáo, thống kê sử dụng và báo cáo sự cố, cùng các lựa chọn của bạn.",
  },
  badge: "Đếm Lương · Legal",
  title: "Chính sách quyền riêng tư của Đếm Lương",
  updated: "Cập nhật lần cuối: 22 tháng 10, 2026",
  sections: [
    {
      h: "1. Tổng quan",
      body: [
        "Đếm Lương (“Ứng dụng”) là ứng dụng iOS và Android hiển thị theo thời gian thực số tiền bạn đã kiếm được đến lúc này, dựa trên mức lương bạn nhập. Chính sách này giải thích Ứng dụng xử lý thông tin nào, nhằm mục đích gì và bạn có những lựa chọn nào.",
        "Tóm tắt:",
        [
          "**Lương, cài đặt và ảnh mong muốn bạn nhập không bao giờ rời khỏi thiết bị của bạn.** Ứng dụng không có tài khoản và không có máy chủ nhận dữ liệu của bạn.",
          "Tuy nhiên, Ứng dụng dùng dịch vụ của Google để **hiển thị quảng cáo**, **thống kê sử dụng** và **báo cáo sự cố**, và trong quá trình đó Google xử lý các thông tin như thông tin thiết bị.",
          "Ứng dụng **dùng mã nhận dạng quảng cáo cho quảng cáo được cá nhân hóa.** Trên iOS, mã nhận dạng quảng cáo (IDFA) chỉ được dùng khi bạn cho phép trong hộp thoại Minh bạch về theo dõi ứng dụng (ATT). Trên Android, mã nhận dạng quảng cáo của thiết bị (AAID) được dùng mà không hỏi riêng, và bạn có thể tắt bất cứ lúc nào trong cài đặt thiết bị. Dù thế nào, mọi tính năng vẫn hoạt động như nhau.",
        ],
        "Nếu có thắc mắc, vui lòng liên hệ {email}.",
      ],
    },
    {
      h: "2. Thông tin bạn nhập",
      body: [
        "Mọi thứ bạn nhập vào Ứng dụng — lương, giờ làm, cài đặt hiển thị, người bạn thêm để so sánh, món đồ mong muốn (ảnh, tên và giá) và bản ghi “Lương lúc lười” — được xử lý như sau.",
        [
          "**Chỉ được lưu trên thiết bị của bạn.** Trên iOS, Ứng dụng dùng vùng lưu trữ App Group để Ứng dụng và widget hiển thị cùng một giá trị; trên Android, dùng vùng lưu trữ riêng của Ứng dụng.",
          "Không ai, kể cả nhà phát triển, có thể xem thông tin này vì nó không được gửi đi đâu cả. Lương và ảnh của bạn không được dùng cho quảng cáo hay thống kê (những gì thống kê ghi lại xem ở mục 4).",
          "Nếu bật sao lưu, dữ liệu của Ứng dụng có thể nằm trong Bản sao lưu iCloud của Apple hoặc Sao lưu tự động Android của Google. Đây là hoạt động mặc định của hệ điều hành, không phải yêu cầu của Ứng dụng.",
        ],
        "**Ảnh và máy ảnh.** Khi thêm món đồ mong muốn hoặc trang trí màn hình StandBy (iOS), Ứng dụng chỉ dùng ảnh do chính bạn chụp hoặc chọn. Quyền truy cập máy ảnh và thư viện ảnh chỉ được yêu cầu khi bạn dùng các tính năng này, và nếu từ chối, các tính năng khác vẫn dùng bình thường. Việc xóa nền ảnh mong muốn được thực hiện ngay trên thiết bị của bạn (Apple Vision trên iOS, Google ML Kit trên Android). Ảnh chỉ được lưu trên thiết bị của bạn và không được tải lên đâu cả.",
        "Ứng dụng không truy cập vị trí, danh bạ, số điện thoại, thông tin thanh toán hay dữ liệu sức khỏe của bạn.",
      ],
    },
    {
      h: "3. Quảng cáo (Google AdMob)",
      body: [
        "Ứng dụng hiển thị quảng cáo qua Google AdMob gồm: banner ở cuối màn hình, quảng cáo có thưởng do bạn tự chọn xem (ví dụ để nạp thêm lượt đổi số tiền hoặc tạm ẩn banner) và quảng cáo xen kẽ thỉnh thoảng xuất hiện khi dùng một số tính năng.",
        "Mã nhận dạng dùng cho quảng cáo được cá nhân hóa và cách xin đồng ý **khác nhau tùy hệ điều hành.**",
        [
          "**iOS** — Chúng tôi hỏi qua hộp thoại Minh bạch về theo dõi ứng dụng (ATT), và **chỉ khi bạn cho phép** mới yêu cầu quảng cáo theo sở thích của bạn bằng mã nhận dạng quảng cáo (IDFA). Nếu không, chỉ quảng cáo không cá nhân hóa được yêu cầu và IDFA không bị truy cập.",
          "**Android** — Vì không có cơ chế tương đương ATT, Ứng dụng không hỏi riêng và **mặc định yêu cầu quảng cáo được cá nhân hóa bằng mã nhận dạng quảng cáo của thiết bị (AAID).** Nếu bạn xóa mã nhận dạng quảng cáo trong cài đặt thiết bị, từ đó chỉ quảng cáo không cá nhân hóa được hiển thị (xem mục 8, Lựa chọn của bạn).",
        ],
        "Trong mọi trường hợp, tất cả tính năng của Ứng dụng đều hoạt động như nhau.",
        "Dù quảng cáo có được cá nhân hóa hay không, Google có thể xử lý các thông tin sau để phân phối quảng cáo và ngăn nhấp chuột gian lận:",
        [
          "Địa chỉ IP và vị trí gần đúng suy ra từ đó (cấp quốc gia hoặc thành phố)",
          "Thông tin thiết bị như loại thiết bị, phiên bản hệ điều hành và cài đặt ngôn ngữ",
          "Tương tác với quảng cáo như lượt hiển thị và lượt nhấp",
          "Chỉ khi áp dụng quảng cáo được cá nhân hóa: mã nhận dạng quảng cáo (IDFA trên iOS hoặc mã nhận dạng quảng cáo trên Android) và thông tin sở thích suy ra từ đó",
        ],
        "Ngoài ra, trên iOS Ứng dụng hỗ trợ SKAdNetwork của Apple, phương thức Apple cung cấp để đo hiệu quả quảng cáo mà không nhận dạng từng người dùng.",
      ],
    },
    {
      h: "4. Thống kê sử dụng (Google Analytics for Firebase)",
      body: [
        "Để biết tính năng nào thực sự được dùng và cải thiện Ứng dụng, chúng tôi dùng Google Analytics for Firebase. Các mục được xử lý gồm:",
        [
          "**Mã phiên bản ứng dụng** — giá trị ngẫu nhiên Firebase tạo cho mỗi lần cài đặt. Nó không gắn với danh tính của bạn (như tên hay email) và sẽ mất khi bạn xóa Ứng dụng.",
          "**Thông tin thiết bị và môi trường** — loại thiết bị, phiên bản hệ điều hành, ngôn ngữ và quốc gia.",
          "**Sự kiện sử dụng** — bản ghi việc dùng tính năng như xem màn hình, đổi đơn vị lương, chạy so sánh, dùng widget (iOS), dùng Mong muốn và “Lương lúc lười”. Khi thêm món đồ mong muốn, giá của nó (chỉ con số) được ghi lại; khi món đồ được lấp đầy, ghi lại thời gian làm việc cần để kiếm số tiền đó; và khi kết thúc một lần “Lương lúc lười”, ghi lại thời lượng tính bằng giây.",
        ],
        "**Số tiền lương bạn nhập không bao giờ được gửi đi.** Chỉ loại cài đặt được ghi lại, chẳng hạn bạn chọn đơn vị nào (năm, tháng, ngày hoặc giờ), không phải bản thân số tiền. Ảnh và tên món đồ mong muốn cũng không được gửi đi.",
      ],
    },
    {
      h: "5. Báo cáo sự cố (Firebase Crashlytics)",
      body: [
        "Nếu Ứng dụng bị thoát bất thường, báo cáo sự cố sẽ được gửi tới Firebase Crashlytics để chúng tôi tìm và sửa nguyên nhân. Báo cáo gồm vị trí trong mã nơi xảy ra lỗi (stack trace), loại thiết bị, phiên bản hệ điều hành, trạng thái bộ nhớ và dung lượng lưu trữ, thời điểm xảy ra và một mã ngẫu nhiên Crashlytics tạo cho mỗi lần cài đặt.",
        "Báo cáo sự cố không chứa lương, ảnh hay tên món đồ mong muốn của bạn.",
      ],
    },
    {
      h: "6. Dịch vụ bên thứ ba",
      body: [
        "Tất cả dịch vụ trên đều do Google cung cấp, và thông tin đó được xử lý theo chính sách của Google.",
        [
          "**Google AdMob** — hiển thị quảng cáo và đo hiệu quả",
          "**Google Analytics for Firebase** — thống kê sử dụng",
          "**Firebase Crashlytics** — báo cáo sự cố",
        ],
        "Để biết chi tiết, vui lòng xem [Cách Google sử dụng thông tin từ các trang web hoặc ứng dụng sử dụng dịch vụ của chúng tôi](https://policies.google.com/technologies/partner-sites). Ứng dụng không bán thông tin của bạn cho bên thứ ba.",
      ],
    },
    {
      h: "7. Lưu giữ và xóa thông tin",
      body: [
        "Vì lương, cài đặt và ảnh của bạn chỉ có trên thiết bị, chúng sẽ bị xóa cùng Ứng dụng và không có bản sao nào được lưu ở nơi khác. Thông tin Google xử lý cho quảng cáo, thống kê và báo cáo sự cố được lưu giữ theo chính sách của Google.",
      ],
    },
    {
      h: "8. Lựa chọn của bạn",
      body: [
        [
          "**iOS** — Trong **Cài đặt > Quyền riêng tư & Bảo mật > Theo dõi**, bạn có thể thay đổi bất cứ lúc nào việc cho phép Ứng dụng theo dõi. Nếu tắt, từ đó chỉ quảng cáo không cá nhân hóa được hiển thị. Bạn cũng có thể giới hạn quảng cáo được cá nhân hóa trong **Quảng cáo của Apple** ở cùng menu.",
          "**Android** — Trong **Cài đặt > Bảo mật và quyền riêng tư > Quyền riêng tư > Quảng cáo** (một số thiết bị là **Cài đặt > Google > Tất cả dịch vụ > Quảng cáo**), chọn **Xóa mã nhận dạng quảng cáo**, và từ đó chỉ quảng cáo không cá nhân hóa được hiển thị.",
          "Bạn có thể tắt quyền truy cập máy ảnh và ảnh bất cứ lúc nào trong cài đặt thiết bị.",
          "Xóa Ứng dụng sẽ xóa dữ liệu lưu trên thiết bị cùng với mã phiên bản ứng dụng.",
          "Với các câu hỏi hoặc yêu cầu khác, vui lòng liên hệ địa chỉ email ở trên.",
        ],
      ],
    },
    {
      h: "9. Thông tin cá nhân của trẻ em",
      body: [
        "Ứng dụng không dành cho trẻ em dưới 14 tuổi và không thu thập thông tin có thể nhận dạng cá nhân người dùng, kể cả tuổi.",
      ],
    },
    {
      h: "10. Thay đổi chính sách",
      body: [
        "Chính sách này có thể được sửa đổi để phản ánh thay đổi về pháp luật hoặc về Ứng dụng. Nếu những gì Ứng dụng xử lý thay đổi, chúng tôi sẽ cập nhật chính sách này và ngày “Cập nhật lần cuối” trước khi phát hành phiên bản có thay đổi đó.",
        "Chính sách này có ở nhiều ngôn ngữ. Nếu bản dịch khác với bản tiếng Hàn, bản tiếng Hàn được ưu tiên áp dụng.",
      ],
    },
  ],
};

export default vi;
