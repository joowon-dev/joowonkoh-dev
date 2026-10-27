import type { Privacy } from "./types";

const id: Privacy = {
  meta: {
    title: "Kebijakan Privasi Detik Gaji",
    description:
      "Informasi yang diproses app iOS dan Android Detik Gaji, layanan pihak ketiga untuk iklan, statistik penggunaan, dan laporan error, serta pilihan yang Anda miliki.",
  },
  badge: "Detik Gaji · Legal",
  title: "Kebijakan Privasi Detik Gaji",
  updated: "Terakhir diperbarui: 22 Oktober 2026",
  sections: [
    {
      h: "1. Ringkasan",
      body: [
        "Detik Gaji (“App”) adalah aplikasi iOS dan Android yang menampilkan secara real-time berapa yang sudah Anda hasilkan sejauh ini berdasarkan gaji yang Anda masukkan. Kebijakan ini menjelaskan informasi apa yang diproses App, untuk tujuan apa, dan pilihan apa yang Anda miliki.",
        "Singkatnya:",
        [
          "**Gaji, pengaturan, dan foto wish yang Anda masukkan tidak pernah keluar dari perangkat Anda.** App tidak memiliki akun maupun server yang menerima data Anda.",
          "Namun, App menggunakan layanan Google untuk **menampilkan iklan**, **statistik penggunaan**, dan **laporan error**, dan dalam prosesnya Google memproses informasi seperti data perangkat.",
          "App **menggunakan ID iklan untuk iklan yang dipersonalisasi.** Di iOS, ID iklan (IDFA) hanya digunakan jika Anda mengizinkannya pada permintaan App Tracking Transparency (ATT). Di Android, ID iklan perangkat (AAID) digunakan tanpa permintaan terpisah, dan Anda dapat mematikannya kapan saja di pengaturan perangkat. Dalam kedua kasus, semua fitur tetap berfungsi sama.",
        ],
        "Untuk pertanyaan, silakan hubungi {email}.",
      ],
    },
    {
      h: "2. Informasi yang Anda masukkan",
      body: [
        "Semua yang Anda masukkan ke App — gaji, jam kerja, pengaturan tampilan, orang yang Anda tambahkan untuk dibandingkan, wish (foto, nama, dan harga), serta catatan “Dibayar buat santai” — diperlakukan sebagai berikut.",
        [
          "**Hanya disimpan di perangkat Anda.** Di iOS, App memakai penyimpanan App Group agar App dan widget dapat menampilkan nilai yang sama; di Android, penyimpanan khusus App.",
          "Tidak seorang pun, termasuk pengembang, dapat melihat informasi ini karena tidak dikirim ke mana pun. Gaji dan foto Anda tidak digunakan untuk iklan maupun statistik (apa yang dicatat statistik ada di bagian 4).",
          "Jika pencadangan diaktifkan, data App dapat ikut tersimpan di Cadangan iCloud milik Apple atau Pencadangan Otomatis Android milik Google. Ini adalah perilaku bawaan sistem operasi, bukan permintaan App.",
        ],
        "**Foto dan kamera.** Saat menambahkan wish atau mengatur layar StandBy (iOS), App hanya memakai foto yang Anda ambil atau pilih sendiri. Akses kamera dan galeri foto diminta saat Anda memakai fitur tersebut, dan jika Anda menolak, fitur lainnya tetap berjalan normal. Penghapusan latar foto wish dilakukan di perangkat Anda (Apple Vision di iOS, Google ML Kit di Android). Foto hanya disimpan di perangkat Anda dan tidak diunggah ke mana pun.",
        "App tidak mengakses lokasi, kontak, nomor telepon, informasi pembayaran, maupun data kesehatan Anda.",
      ],
    },
    {
      h: "3. Iklan (Google AdMob)",
      body: [
        "App menampilkan iklan melalui Google AdMob: banner di bagian bawah layar, iklan berhadiah yang Anda pilih untuk ditonton (misalnya untuk mengisi ulang jatah ubah nominal atau menyembunyikan banner sementara), dan iklan interstisial yang sesekali muncul saat memakai fitur tertentu.",
        "ID yang digunakan untuk iklan yang dipersonalisasi dan cara persetujuannya **berbeda menurut sistem operasi.**",
        [
          "**iOS** — Kami meminta izin melalui permintaan App Tracking Transparency (ATT), dan **hanya jika Anda mengizinkan** kami meminta iklan sesuai minat Anda menggunakan ID iklan (IDFA). Jika tidak, hanya iklan yang tidak dipersonalisasi yang diminta dan IDFA tidak diakses.",
          "**Android** — Karena tidak ada padanan ATT, App tidak meminta izin terpisah dan **secara default meminta iklan yang dipersonalisasi menggunakan ID iklan perangkat (AAID).** Jika Anda menghapus ID iklan di pengaturan perangkat, sejak itu hanya iklan yang tidak dipersonalisasi yang ditampilkan (lihat bagian 8, Pilihan Anda).",
        ],
        "Dalam semua kasus, semua fitur App tetap berfungsi sama.",
        "Baik iklan dipersonalisasi maupun tidak, Google dapat memproses informasi berikut untuk menayangkan iklan dan mencegah klik palsu:",
        [
          "Alamat IP dan perkiraan lokasi yang disimpulkan darinya (tingkat negara atau kota)",
          "Informasi perangkat seperti jenis perangkat, versi sistem operasi, dan setelan bahasa",
          "Interaksi dengan iklan seperti tayangan dan klik",
          "Hanya jika iklan yang dipersonalisasi berlaku, ID iklan (IDFA di iOS atau ID iklan di Android) dan informasi minat yang disimpulkan darinya",
        ],
        "Di iOS, App juga mendukung SKAdNetwork dari Apple, yaitu cara yang disediakan Apple untuk mengukur kinerja iklan tanpa mengidentifikasi pengguna secara individu.",
      ],
    },
    {
      h: "4. Statistik penggunaan (Google Analytics for Firebase)",
      body: [
        "Untuk memahami fitur mana yang benar-benar dipakai dan meningkatkan App, kami menggunakan Google Analytics for Firebase. Hal yang diproses adalah:",
        [
          "**ID instance App** — nilai acak yang dibuat Firebase untuk setiap instalasi. Tidak terhubung dengan identitas pribadi Anda (seperti nama atau email) dan hilang saat App dihapus.",
          "**Informasi perangkat dan lingkungan** — jenis perangkat, versi sistem operasi, bahasa, dan negara.",
          "**Peristiwa penggunaan** — catatan penggunaan fitur seperti tampilan layar, perubahan satuan gaji, perbandingan yang dijalankan, penggunaan widget (iOS), serta penggunaan Wish dan “Dibayar buat santai”. Saat menambahkan wish, harganya (angka saja) dicatat; saat wish penuh, lama jam kerja yang dibutuhkan untuk menghasilkannya; dan saat sesi “Dibayar buat santai” selesai, durasinya dalam detik.",
        ],
        "**Nominal gaji yang Anda masukkan tidak pernah dikirim.** Hanya jenis pengaturannya yang dicatat, misalnya satuan yang Anda pilih (tahunan, bulanan, harian, atau per jam), bukan nominalnya. Foto dan nama wish juga tidak dikirim.",
      ],
    },
    {
      h: "5. Laporan error (Firebase Crashlytics)",
      body: [
        "Jika App berhenti secara tidak normal, laporan error dikirim ke Firebase Crashlytics agar kami dapat menemukan dan memperbaiki penyebabnya. Laporan berisi lokasi kode tempat error terjadi (stack trace), jenis perangkat, versi sistem operasi, kondisi memori dan penyimpanan, waktu kejadian, dan ID acak yang dibuat Crashlytics untuk setiap instalasi.",
        "Laporan error tidak berisi gaji, foto, maupun nama wish Anda.",
      ],
    },
    {
      h: "6. Layanan pihak ketiga",
      body: [
        "Semua layanan di atas disediakan oleh Google, dan informasinya diproses sesuai kebijakan Google.",
        [
          "**Google AdMob** — penayangan iklan dan pengukuran kinerjanya",
          "**Google Analytics for Firebase** — statistik penggunaan",
          "**Firebase Crashlytics** — laporan error",
        ],
        "Untuk detailnya, lihat [Cara Google menggunakan informasi dari situs atau aplikasi yang menggunakan layanan kami](https://policies.google.com/technologies/partner-sites). App tidak menjual informasi Anda kepada pihak ketiga.",
      ],
    },
    {
      h: "7. Penyimpanan dan penghapusan",
      body: [
        "Karena gaji, pengaturan, dan foto Anda hanya ada di perangkat Anda, semuanya ikut terhapus bersama App dan tidak ada salinan di tempat lain. Informasi yang diproses Google untuk iklan, statistik, dan laporan error disimpan sesuai kebijakan Google.",
      ],
    },
    {
      h: "8. Pilihan Anda",
      body: [
        [
          "**iOS** — Di **Pengaturan > Privasi & Keamanan > Pelacakan**, Anda dapat mengubah kapan saja apakah App boleh melacak Anda. Jika dimatikan, sejak itu hanya iklan yang tidak dipersonalisasi yang ditampilkan. Anda juga dapat membatasi iklan yang dipersonalisasi di **Iklan Apple** pada menu yang sama.",
          "**Android** — Di **Setelan > Keamanan & privasi > Privasi > Iklan** (di beberapa perangkat **Setelan > Google > Semua layanan > Iklan**), pilih **Hapus ID iklan**, dan sejak itu hanya iklan yang tidak dipersonalisasi yang ditampilkan.",
          "Anda dapat mematikan akses kamera dan foto kapan saja di pengaturan perangkat.",
          "Menghapus App akan menghapus data yang tersimpan di perangkat beserta ID instance App.",
          "Untuk pertanyaan atau permintaan lain, silakan hubungi alamat email di atas.",
        ],
      ],
    },
    {
      h: "9. Privasi anak",
      body: [
        "App tidak ditujukan untuk anak di bawah 14 tahun dan tidak mengumpulkan informasi yang dapat mengidentifikasi pengguna secara pribadi, termasuk usia.",
      ],
    },
    {
      h: "10. Perubahan kebijakan",
      body: [
        "Kebijakan ini dapat diperbarui untuk mencerminkan perubahan hukum atau App. Jika hal yang diproses App berubah, kami akan memperbarui kebijakan ini beserta tanggal “Terakhir diperbarui” sebelum merilis versi yang memuat perubahan tersebut.",
        "Kebijakan ini tersedia dalam beberapa bahasa. Jika terjemahan berbeda dari versi bahasa Korea, versi bahasa Korea yang berlaku.",
      ],
    },
  ],
};

export default id;
