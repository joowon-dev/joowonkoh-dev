import type { Landing } from "./types";

const id: Landing = {
  meta: {
    title: "Detik Gaji: Penghitung Gaji",
    description:
      "App iPhone dan Android yang menampilkan uang yang sedang kamu hasilkan saat ini, detik demi detik. Widget, Layar Terkunci, StandBy, dan balapan melawan gaji siapa saja.",
  },
  appName: "Detik Gaji",
  tagline: "Lihat gajimu naik tiap detik",
  iconAlt: "Ikon app Detik Gaji",
  languageLabel: "Bahasa",
  hero: {
    appStore: "Unduh di App Store",
    play: "Dapatkan di Google Play",
    requirements: "iOS 17 · Android 7.0 ke atas · Gratis",
  },
  money: { locale: "id-ID", prefix: "Rp", suffix: "" },
  salary: { me: 72_000_000, boss: 180_000_000 },
  eyebrow: {
    features: "Fitur",
    race: "Balapan perbandingan",
    faq: "Pertanyaan umum",
    support: "Kontak & dukungan",
  },
  ticker: {
    units: { year: "Tahunan", month: "Bulanan", day: "Harian" },
    unitNames: { year: "Gaji tahunan", month: "Gaji bulanan", day: "Gaji harian" },
    since: "Sejak tengah malam",
    perSecond: (a) => `${a} per detik`,
  },
  features: [
    { title: "Nilai satu detik", tail: "Tahunan, bulanan, harian, atau per jam" },
    { title: "Sepanjang hari · Jam kerja", tail: "Saat tidur pun, atau hanya saat kerja" },
    { title: "Jadwal mingguan · Shift", tail: "Satu jam istirahat, shift malam juga" },
    { title: "Wish", tail: "Isi barang impian dengan hasil kerjamu" },
    { title: "Dibayar buat santai", tail: "Uang dari kantor selama rehat kopi" },
    { title: "Balapan perbandingan", tail: "Dari secangkir kopi sampai mobil baru" },
    { title: "Widget · Layar Terkunci · StandBy", tail: "Tanpa membuka app" },
    { title: "20 mata uang · 12 bahasa", tail: "Di app dan widget" },
  ],
  race: {
    me: "Saya",
    boss: "Bos",
    goal: 45_000,
    goalTitle: (a) => `Martabak · sampai ${a}`,
    speed: "1000×",
    arrived: "Sampai",
    summary: (t, a) => `Selama ${t} bos mendapatkan uang martabak, saya sampai ${a}.`,
    duration: (h, m) => `${h} jam ${m} menit`,
  },
  stay: {
    since: (s) => `Sejak halaman ini dibuka: ${s}`,
    spent: (m, s) => (m > 0 ? `${m} mnt ${s} dtk` : `${s} dtk`),
    footnote: "Berdasarkan gaji tahunan Rp72.000.000. Di app, yang dihitung gajimu sendiri.",
  },
  statement: {
    headline: "Saat rapat molor, lihat layarnya: kamu bisa lihat berapa harga rapat itu.",
    body: "Saya membuatnya karena ingin melihat setiap hari angka yang biasanya hanya terasa saat gajian. Gaji yang kamu masukkan tidak keluar dari perangkat ini.",
  },
  faq: [
    {
      q: "Angka widget tidak naik tiap detik",
      a: "iOS menggambar widget sesuai linimasa yang disiapkan lebih dulu. App menyiapkan 30 menit sekaligus, lalu berganti ke berikutnya. Setiap kali digambar ulang, jumlahnya dihitung untuk saat itu juga, jadi angka yang tampil selalu tepat.",
    },
    {
      q: "Bisa lihat gaji bersih?",
      a: "Belum. Pajak dan potongan tergantung banyak hal, jadi daripada memakai rumus yang belum teruji, fitur ini ditunda dulu. Semua angka masih sebelum pajak.",
    },
    {
      q: "Dari mana gaji pembandingnya?",
      a: "Semuanya kamu masukkan sendiri. App tidak menyediakan orang pembanding bawaan.",
    },
    {
      q: "Apakah dikonversi ke mata uang lain?",
      a: "Tidak. Hanya cara penulisannya yang berubah. Di Amerika, kopi ya $5 saja.",
    },
    {
      q: "Apakah gajiku dikirim ke suatu tempat?",
      a: "Tidak. Tidak perlu daftar akun; gaji, pengaturan, dan foto wish hanya ada di perangkat ini. Namun app berisi iklan (AdMob) dan statistik penggunaan (Firebase), jadi Google memproses sebagian informasi perangkat. Di iPhone, izin pelacakan untuk iklan personal ditanyakan saat pertama kali dibuka, dan semua fitur tetap bisa dipakai walau kamu menolak.",
    },
    {
      q: "Bisa menghilangkan iklan?",
      a: "Tonton satu iklan dari Pengaturan, dan banner di bawah hilang selama 12 jam. Tidak ada yang perlu dibeli.",
    },
  ],
  support: { privacy: "Kebijakan Privasi" },
};

export default id;
