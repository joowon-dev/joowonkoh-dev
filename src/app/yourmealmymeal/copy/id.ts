import type { Copy } from "./types";

const id: Copy = {
  appName: "Makananmu, Makananku",
  quote: ["“", "”"],
  store: { download: "Unduh" },

  landing: {
    meta: {
      title: "Makananmu, Makananku",
      description:
        "Aplikasi untuk mengisi nampan dengan satu foto per waktu makan (sarapan, makan siang, makan malam) dan saling memperhatikan bersama keluarga atau teman. Halaman pengenalan dan dukungan aplikasi iOS & Android “Makananmu, Makananku”.",
      ogTitle: "Makananmu, Makananku — Daripada nanya “udah makan?”",
      ogDescription:
        "Aplikasi untuk mengisi nampan dengan satu foto per waktu makan (sarapan, makan siang, makan malam) dan saling memperhatikan bersama keluarga atau teman.",
      ogAlt: "Gambar “Makananmu, Makananku”: nampan putih di atas latar kuning telur, hanya kotak makan siang yang terisi warna tomat",
    },
    trayTitle: "Nampan “Makananmu, Makananku”",
    greetings: [
      "Hari ini makan apa?",
      "Udah makan yang bener?",
      "Makan siangnya enak?",
      "Makan malam hari ini, serasa makan bareng",
    ],
    tagline: "Bagi nampan makanmu hari ini ke keluarga & teman, cukup satu foto.",
    together: {
      title: "Satu meja makan bareng",
      lead: "Nampan 2–12 orang yang kumpul lewat kode undangan ada di satu meja. Nggak perlu nanya, kelihatan siapa yang belum makan.",
    },
    featuresTitle: "Yang bisa kamu lakukan",
    features: [
      { title: "Satu kotak per makan", tail: "Foto atau pilih dari album, langsung masuk" },
      { title: "Atur posisinya sendiri", tail: "Geser dan perbesar biar makanan nggak kepotong" },
      { title: "Colek kotak kosong", tail: "Belum makan? Colek pelan-pelan" },
      { title: "Cukup satu nampan", tail: "Unggah sekali, muncul di semua grup" },
      { title: "Reaksi · komentar", tail: "Cukup bilang “kelihatan enak!”" },
      { title: "Sehari jadi satu gambar", tail: "Simpan nampan hari itu ke galeri" },
    ],
    statement: { before: "Bukannya nanya “Udah makan?”, ", em: "kotak kosong", after: " yang duluan bicara." },
    story: [
      "Buat yang tinggal sendiri, makan sering jadi hal pertama yang dikerjakan asal-asalan. Satu-satunya cara tahu cuma telepon dan nanya, dan jawabannya hampir selalu “udah makan kok”.",
      "Jadi, daripada nanya, kami bikin semuanya kelihatan. Ini bukan aplikasi omelan otomatis, tapi aplikasi yang bikin kamu nggak repot nanya kabar. Makanya kotak kosong nggak dimarahi. Waktu makan ada tiga, camilan cuma bonus.",
    ],
    faqTitle: "Pertanyaan yang sering diajukan",
    faq: [
      {
        q: "Siapa yang bisa lihat fotoku?",
        a: "Cuma orang yang satu grup sama kamu. Batasan ini dipasang langsung di database, bukan cuma di tampilan aplikasi, jadi biarpun aplikasinya diotak-atik, makanan orang lain tetap nggak bisa diambil. Penyimpanan foto bersifat privat dan link-nya cuma berlaku sebentar.",
      },
      {
        q: "Bisa ikut grup keluarga dan grup teman sekaligus?",
        a: "Bisa. Tiap orang cuma punya satu nampan, jadi sekali kamu unggah sarapan, itu langsung muncul di semua grup yang kamu ikuti. Nggak perlu unggah ulang di tiap grup.",
      },
      {
        q: "Berapa kali aku bisa kirim colek?",
        a: "Biar nggak jadi banjir notifikasi, server menghitung jumlahnya per hari. Kalau sudah habis, kamu bisa nonton iklan singkat untuk dapat beberapa lagi, dan itu juga ada batas hariannya. Kotak camilan cuma bonus, jadi nggak bisa dicolek.",
      },
      {
        q: "Ada iklannya?",
        a: "Ada iklan layar penuh yang sesekali muncul setelah kamu selesai lihat foto atau selesai mengunggah, dan iklan berhadiah yang cuma ditonton kalau kamu mau dapat colek tambahan. Nggak ada banner yang nempel terus di layar. Kami juga mengumpulkan statistik penggunaan untuk memperbaiki aplikasi. Detailnya ada di Kebijakan Privasi.",
      },
      {
        q: "Apa yang terjadi kalau akunku dihapus?",
        a: "Kamu bisa langsung menghapusnya di dalam aplikasi. Semua foto dan catatan yang kamu unggah akan hilang dan nggak bisa dikembalikan. Grup yang kamu buat akan diserahkan ke anggota yang paling lama bergabung di antara yang tersisa, dan kalau nggak ada siapa-siapa, grupnya ikut hilang.",
      },
    ],
    closing: {
      title: "Makan malam hari ini, serasa makan bareng",
      body: "Punya saran fitur atau pertanyaan? Kirim email kapan saja.",
      privacy: "Kebijakan Privasi",
      deleteAccount: "Cara hapus akun",
    },
  },

  join: {
    meta: {
      title: "Udah makan? · Makananmu, Makananku",
      description:
        "Kamu diundang ke meja makan. Catat makananmu hari ini di nampan. Salin kode undangannya, masukkan di aplikasi, dan kamu langsung masuk grup.",
      ogTitle: "Udah makan?",
      ogDescription: "Kamu diundang ke meja makan · Catat makananmu hari ini di nampan",
      ogAlt: "Gambar undangan: nampan putih dengan empat kotak yang masih kosong di tengah latar kuning telur muda, diapit sendok warna tomat dan garpu warna mint",
    },
    trayTitle: "Nampan kosong yang belum terisi apa-apa",
    title: "Udah makan?",
    sub: "Catat makananmu hari ini di nampan, yuk!",
    pill: "Kamu diundang makan bareng · Yuk isi",
    step1: "Salin kode undangannya",
    copyAria: "Salin kode undangan {code}",
    noCodeAria: "Tidak ada kode undangan",
    copied: "Tersalin!",
    missing: [
      "Kode undangan di link ini hilang atau terpotong.",
      "Minta kodenya lagi ke yang mengundangmu, ya.",
    ],
    step2: "Pasang aplikasi, lalu masukkan",
    hint: {
      before: "Tab ",
      tab: "Grup",
      after: " di bawah",
      add: "Tambah grup",
      join: "Gabung pakai kode undangan",
    },
    openInApp: "Sudah punya aplikasinya? · Buka",
    limit: "Maks. 12 orang per grup. Kalau sudah penuh, nggak bisa gabung.",
    about: "Tentang Makananmu, Makananku",
    privacy: "Privasi",
  },

  shell: {
    homeAria: "Ke beranda Makananmu, Makananku",
    about: "Tentang",
    privacy: "Kebijakan Privasi",
    deleteAccount: "Hapus akun",
    language: "Bahasa",
  },

  legal: {
    badge: "Makananmu, Makananku · Legal",
    updated: "Terakhir diperbarui",
    koreanPrevails: "Ini adalah terjemahan; jika ada perbedaan, versi bahasa Korea yang berlaku.",
    koreanLink: "Lihat versi bahasa Korea",
  },

  privacy: {
    title: "Kebijakan Privasi Makananmu, Makananku",
    description:
      "Penjelasan tentang informasi yang diproses oleh aplikasi iOS & Android “Makananmu, Makananku”, siapa yang bisa melihat foto dan catatan makanmu, serta cara menghapus akun.",
    updatedAt: "16 Oktober 2026",
    sections: [
      {
        h: "1. Ringkasan",
        blocks: [
          {
            p: "“Makananmu, Makananku” (네밥내밥, selanjutnya disebut “Aplikasi”) adalah aplikasi iOS dan Android untuk mencatat makanan hari ini dengan foto dan membagikannya dengan orang-orang di grup yang sama. Kebijakan ini menjelaskan informasi yang diproses oleh Aplikasi, tujuannya, dan pilihan yang kamu miliki sebagai pengguna.",
          },
          { p: "Singkatnya:" },
          {
            ul: [
              "Foto dan catatan makan **hanya terlihat oleh orang yang berada di grup yang sama denganmu**.",
              "Aplikasi menampilkan **iklan interstisial dan iklan berhadiah dari Google AdMob**. Iklan interstisial sesekali muncul di layar penuh setelah kamu selesai melihat foto atau selesai mengunggah, sedangkan iklan berhadiah kamu pilih sendiri untuk ditonton saat colekmu habis. Tidak ada iklan banner yang selalu tampil di layar. Untuk statistik penggunaan, kami memakai Google Analytics for Firebase. Nama, email, foto, dan catatan makan tidak diberikan ke layanan-layanan ini.",
              "Di iOS, setelah login kami **menanyakan dulu apakah kamu mengizinkan** pelacakan iklan; kalaupun kamu menolak, semua fitur Aplikasi tetap bisa dipakai.",
              "Kamu bisa menghapus akun **langsung di dalam Aplikasi**, dan saat dihapus, foto serta catatanmu ikut terhapus.",
            ],
          },
          { p: "Untuk pertanyaan, silakan hubungi [contact@joowonkoh.com](contact)." },
        ],
      },
      {
        h: "2. Informasi yang kami kumpulkan",
        blocks: [
          {
            ul: [
              "**Alamat email** — diterima melalui login Apple atau Google. Hanya digunakan untuk mengenali siapa yang login.",
              "**Nama tampilan** — nama yang terlihat oleh orang-orang di grupmu. Kamu sendiri yang menentukan dan bisa mengubahnya kapan saja.",
              "**Foto makanan** — foto yang kamu ambil sendiri atau pilih dari album. Inilah tujuan utama Aplikasi.",
              "**Tanggal dan waktu makan** — diperlukan untuk mengetahui foto itu untuk waktu makan yang mana, di hari apa.",
              "**Token notifikasi push perangkat** — disimpan untuk mengetahui ke mana notifikasi harus dikirim.",
              "**Komentar** — tulisan yang kamu tinggalkan di makanan orang dalam grup yang sama. Hanya terlihat oleh orang di grup tersebut.",
              "**Foto profil** — foto yang kamu unggah sendiri. Hanya terlihat oleh orang yang berada di grup yang sama denganmu.",
              "**Catatan laporan dan blokir** — siapa melaporkan apa dan mengapa, serta siapa memblokir siapa. Hanya digunakan untuk menangani konten yang tidak pantas.",
              "**Pengenal akun** — rangkaian karakter acak yang dibuat otomatis saat mendaftar. Hanya digunakan untuk menghubungkan foto dan catatan dengan pemiliknya, dan tidak seperti nama atau email, tidak ditampilkan di layar.",
            ],
          },
          { p: "Untuk iklan dan statistik penggunaan, informasi berikut diproses." },
          {
            ul: [
              "**Informasi penggunaan Aplikasi** — layar yang dilihat dan fitur yang digunakan, ID instance aplikasi, jenis perangkat dan OS, serta perkiraan wilayah. Digunakan untuk mengetahui fitur mana yang dipakai dan memperbaiki Aplikasi, dan diproses oleh Google Analytics for Firebase.",
              "**Pengenal iklan dan informasi iklan** — IDFA di iOS atau ID iklan di Android, serta informasi tayangan dan klik iklan. Digunakan untuk menampilkan iklan dan mengukur kinerjanya, dan diproses oleh Google AdMob. Di iOS, jika kamu menolak “Izinkan App untuk Melacak”, IDFA tidak digunakan dan iklan yang ditampilkan bukan iklan yang dipersonalisasi.",
            ],
          },
          {
            p: "Aplikasi tidak mengakses lokasi akurat, kontak, riwayat panggilan, informasi kesehatan, maupun informasi pembayaran.",
          },
        ],
      },
      {
        h: "3. Siapa yang bisa melihat",
        blocks: [
          {
            p: "Foto dan catatan makan hanya terlihat oleh orang yang berada di grup yang sama. Batasan ini tidak hanya ada di tampilan Aplikasi, tetapi **dipasang langsung di database** (Row Level Security), sehingga meskipun seseorang memodifikasi Aplikasi atau meniru komunikasinya secara langsung, makanan orang lain tetap tidak bisa diambil.",
          },
          { p: "Penyimpanan foto bersifat privat, dan link untuk melihat foto hanya berlaku dalam waktu singkat." },
          {
            p: "Token notifikasi push disimpan di tabel terpisah yang hanya bisa dibaca oleh pemiliknya sendiri. Orang di grup yang sama pun tidak bisa melihatnya, karena siapa pun yang mengetahui token bisa mengirim notifikasi apa saja ke perangkat tersebut.",
          },
          {
            p: "Komentar dan reaksi **hanya terlihat di dalam grup tempat ia ditinggalkan**. Meskipun fotonya sama, orang di grup lain tidak bisa melihatnya. Konten yang kamu laporkan atau blokir tidak akan lagi terlihat olehmu sejak saat itu.",
          },
        ],
      },
      {
        h: "4. Layanan pihak ketiga",
        blocks: [
          {
            p: "Aplikasi tidak menjual informasi pribadi. Nama, email, foto, dan catatan makan tidak diberikan kepada pihak ketiga untuk tujuan iklan atau analisis. Layanan yang digunakan Aplikasi adalah sebagai berikut.",
          },
          {
            ul: [
              "**Supabase** — login dan penyimpanan data. Servernya berada di Korea Selatan (Seoul).",
              "**Cloudflare R2** — penyimpanan foto makanan dan foto profil. Disimpan secara privat di wilayah Asia-Pasifik, dan setelah hak aksesmu diperiksa, foto dikirim melalui alamat yang hanya berlaku selama satu jam.",
              "**Expo** — pengiriman notifikasi. Di iOS melalui Apple APNs, di Android melalui Google FCM. Teks notifikasi dan token perangkat ikut dikirimkan.",
              "**Apple / Google** — login. Kami menerima alamat emailmu.",
              "**Google AdMob** — iklan interstisial dan iklan berhadiah. Pengenal iklan, informasi tayangan dan klik iklan, serta informasi perangkat dikirimkan.",
              "**Google Analytics for Firebase** — statistik penggunaan. Informasi penggunaan Aplikasi, ID instance aplikasi, dan informasi perangkat dikirimkan.",
            ],
          },
          {
            p: "Cara Google memproses informasi ini dapat dilihat di [Cara Google menggunakan informasi dari situs atau aplikasi yang menggunakan layanan kami](google).",
          },
        ],
      },
      {
        h: "5. Masa penyimpanan",
        blocks: [
          {
            p: "Informasi disimpan selama akun masih ada, dan ikut dihapus saat akun dihapus. Kami tidak menyimpan salinan terpisah. Statistik penggunaan tidak terikat dengan akun dan dihapus setelah 2 bulan sesuai pengaturan bawaan Google Analytics.",
          },
        ],
      },
      {
        h: "6. Penghapusan akun",
        blocks: [
          { p: "Kamu bisa langsung menghapusnya di dalam Aplikasi: **Aku > Hapus akun**." },
          {
            p: "Saat dihapus, profil dan nama tampilan, foto profil, file foto yang diunggah, catatan makan, komentar, reaksi, catatan laporan dan blokir, keanggotaan grup, serta token notifikasi push akan dihapus seluruhnya dan tidak dapat dikembalikan.",
          },
          {
            p: "Grup yang kamu buat akan diserahkan kepada anggota yang paling lama bergabung di antara yang tersisa. Jika tidak ada yang tersisa, grup tersebut ikut hilang. Satu orang keluar tidak akan membuat grup orang lain hilang.",
          },
        ],
      },
      {
        h: "7. Hak pengguna",
        blocks: [
          {
            ul: [
              "Nama tampilan bisa diubah di Aplikasi kapan saja.",
              "Akun dan semua catatan bisa langsung dihapus dengan cara di nomor 6 di atas. Jika kamu sudah menghapus Aplikasi, silakan lihat [Cara hapus akun](deleteAccount).",
              "Blokir bisa dibuka kapan saja di tab Aku > Orang yang diblokir.",
              "Notifikasi bisa dimatikan kapan saja di pengaturan perangkat.",
              "Pelacakan iklan bisa dimatikan atau ID iklan bisa dihapus kapan saja: di iOS melalui Pengaturan > Privasi & Keamanan > Pelacakan, dan di Android melalui Setelan > Google > Iklan.",
              "Untuk permintaan akses, koreksi, atau penghapusan lainnya, silakan hubungi alamat email di atas.",
            ],
          },
        ],
      },
      {
        h: "8. Privasi anak",
        blocks: [
          {
            p: "Aplikasi tidak ditujukan untuk anak di bawah usia 14 tahun, dan tidak dengan sengaja mengumpulkan informasi dari pengguna di usia tersebut.",
          },
        ],
      },
      {
        h: "9. Perubahan kebijakan",
        blocks: [
          {
            p: "Kebijakan ini dapat diubah untuk menyesuaikan dengan peraturan atau perubahan layanan. Jika ada perubahan pada informasi yang diproses, kami akan memperbarui kebijakan ini terlebih dahulu sebelum versi yang memuat fitur tersebut dirilis, sekaligus mengubah tanggal “Terakhir diperbarui”.",
          },
        ],
      },
    ],
  },

  deleteAccount: {
    title: "Hapus akun Makananmu, Makananku",
    description:
      "Cara menghapus akun “Makananmu, Makananku” beserta foto dan catatan makan yang sudah diunggah. Bisa langsung dihapus di dalam aplikasi, atau diminta lewat email jika kamu tidak punya aplikasinya.",
    updatedAt: "18 September 2026",
    mailSubject: "[네밥내밥] Permintaan penghapusan akun",
    sections: [
      {
        h: "Hapus langsung di aplikasi",
        blocks: [
          { p: "Ini cara tercepat. Tidak perlu menunggu permintaan diproses; akun langsung terhapus saat itu juga." },
          {
            ol: [
              "Buka “Makananmu, Makananku” lalu ketuk tab **Aku** di bagian bawah layar.",
              "Ketuk **Hapus akun**.",
              "Untuk konfirmasi, ketik **hapus**, lalu tombolnya akan aktif.",
            ],
          },
          {
            p: "Tab Aku selalu terlihat meskipun kamu belum bergabung dengan grup mana pun. Kamu tetap bisa menghapus akun walaupun baru pertama kali membuka aplikasi dan hanya login.",
          },
        ],
      },
      {
        h: "Jika tidak punya aplikasinya",
        blocks: [
          {
            p: "Jika kamu sudah ganti perangkat atau sudah menghapus aplikasinya, silakan ajukan permintaan lewat email. Kirim dari alamat email yang dipakai saat mendaftar agar identitasmu bisa diverifikasi.",
          },
          { p: "Kirim ke: [contact@joowonkoh.com](deleteMail)" },
          { p: "Permintaan akan diproses dalam 7 hari kerja dan hasilnya akan kami kabarkan lewat balasan email." },
        ],
      },
      {
        h: "Apa saja yang dihapus",
        blocks: [
          { p: "Data di bawah ini dihapus **seketika dan tidak dapat dikembalikan**." },
          {
            ul: [
              "Akun dan informasi login (alamat email, pengenal akun)",
              "Nama tampilan",
              "Semua file foto makanan yang diunggah",
              "Catatan makan beserta tanggalnya",
              "Reaksi yang kamu tinggalkan di makanan orang lain",
              "Keanggotaan grup",
              "Token notifikasi push perangkat yang disimpan untuk menerima notifikasi",
            ],
          },
          {
            p: "Grup yang kamu buat tidak hilang. Grup akan diserahkan kepada anggota yang paling lama bergabung di antara yang tersisa, dan jika tidak ada yang tersisa, grup ikut hilang. Catatan milik orang lain tidak akan ikut terhapus.",
          },
        ],
      },
      {
        h: "Berapa lama data disimpan",
        blocks: [
          {
            p: "Tidak ada masa penyimpanan terpisah. Data dihapus pada saat kamu menekan hapus. Salinan yang tersisa di media cadangan juga akan hilang paling lama dalam 30 hari, mengikuti siklus pencadangan.",
          },
        ],
      },
      {
        h: "Lihat juga",
        blocks: [{ p: "Informasi apa yang kami kumpulkan dan alasannya dijelaskan di [Kebijakan Privasi](privacy)." }],
      },
    ],
  },
};

export default id;
