"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import {
  PROFILE,
  METRICS,
  JOURNEY,
  WORKS,
  SKILLS,
  AWARDS,
  PHILOSOPHY,
} from "@/lib/portfolio";
import {
  Reveal,
  CountUp,
  KineticText,
  stagger,
  staggerItem,
  EASE,
} from "./primitives";

/* ------------------------------------------------------------------ */
/*  Ambient aurora — slow-drifting blurred color fields behind hero    */
/* ------------------------------------------------------------------ */
function Aurora() {
  const blobs = [
    { c: "bg-indigo-600/40", s: "h-[42vw] w-[42vw] left-[-8%] top-[6%]", d: 18 },
    { c: "bg-violet-600/30", s: "h-[38vw] w-[38vw] right-[-6%] top-[2%]", d: 22 },
    { c: "bg-blue-500/30", s: "h-[34vw] w-[34vw] left-[26%] top-[38%]", d: 26 },
    { c: "bg-fuchsia-600/20", s: "h-[30vw] w-[30vw] right-[14%] bottom-[2%]", d: 20 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[90px] ${b.c} ${b.s}`}
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.12, 0.94, 1],
          }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* Section eyebrow label */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Reveal>
      <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
        <span className="h-px w-8 bg-white/25" />
        {children}
      </span>
    </Reveal>
  );
}

export default function Portfolio() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // Hero parallax
  const { scrollYProgress: heroProgress } = useScroll({
    target: rootRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 160]);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.08]);

  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 -mt-16 -mb-16 overflow-x-clip bg-[#05060a] text-white">
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-indigo-400 via-blue-400 to-fuchsia-400"
      />

      {/* ============================ HERO ============================ */}
      <section
        ref={rootRef}
        className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6"
      >
        <Aurora />
        {/* subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/70 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Full-Stack Developer · 서비스를 만들고 운영합니다
          </motion.span>

          <h1 className="font-display text-[15vw] font-extrabold leading-[0.92] tracking-tight sm:text-[11vw] md:text-[8.5rem]">
            <KineticText text="고주원" delay={0.15} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.6, ease: EASE }}
            className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-white/60 md:text-xl"
          >
            {PROFILE.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.85, ease: EASE }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#work"
              className="group rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform duration-300 hover:-translate-y-0.5"
            >
              작업 보기
              <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
            <a
              href={`mailto:${PROFILE.email}`}
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 backdrop-blur-md transition-colors duration-300 hover:bg-white/10"
            >
              연락하기
            </a>
          </motion.div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-9 w-5 items-start justify-center rounded-full border border-white/25 p-1"
          >
            <span className="h-2 w-1 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ========================= MANIFESTO ========================= */}
      <section className="relative mx-auto max-w-4xl px-6 py-28 md:py-40">
        <Eyebrow>Manifesto</Eyebrow>
        <div className="mt-8">
          <RevealParagraph text={PHILOSOPHY} />
        </div>
        <Reveal delay={0.2} className="mt-10">
          <p className="max-w-2xl text-base leading-[1.9] text-white/50">
            {PROFILE.intro}
          </p>
        </Reveal>
      </section>

      {/* ========================== METRICS ========================== */}
      <section className="relative border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Eyebrow>By the numbers</Eyebrow>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-12 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3"
          >
            {METRICS.map((m) => (
              <motion.div key={m.label} variants={staggerItem}>
                <div className="font-display text-5xl font-extrabold tracking-tight md:text-6xl">
                  <span className="bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                    <CountUp
                      value={m.value}
                      suffix={m.suffix}
                      prefix={m.prefix}
                      comma={m.comma}
                    />
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-white/80">
                  {m.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/40">
                  {m.sub}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================== JOURNEY ========================== */}
      <section className="relative mx-auto max-w-5xl px-6 py-28 md:py-40">
        <Eyebrow>Journey</Eyebrow>
        <Reveal className="mt-6">
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            지나온 길
          </h2>
        </Reveal>

        <div className="mt-16 space-y-16">
          {JOURNEY.map((j, i) => (
            <Reveal key={j.org} delay={i * 0.05}>
              <div className="group relative grid grid-cols-1 gap-6 border-t border-white/10 pt-10 md:grid-cols-[minmax(0,200px)_1fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-300/80">
                    {j.period}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {j.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/45"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                    {j.org}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-white/50">
                    {j.role}
                  </p>
                  <p className="mt-4 max-w-2xl text-[15px] leading-[1.85] text-white/60">
                    {j.summary}
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {j.points.map((p) => (
                      <li
                        key={p}
                        className="flex gap-3 text-sm leading-relaxed text-white/55"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo-400/70" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* =========================== WORK ============================ */}
      <section id="work" className="relative border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-40">
          <Eyebrow>Selected Work</Eyebrow>
          <Reveal className="mt-6">
            <h2 className="max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">
              혼자 기획·개발·운영하는{" "}
              <span className="bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
                실사용 서비스
              </span>
            </h2>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2">
            {WORKS.map((w, i) => (
              <WorkCard key={w.title} work={w} featured={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================== ARSENAL ========================== */}
      <section className="relative mx-auto max-w-6xl px-6 py-28 md:py-40">
        <Eyebrow>Tech Arsenal</Eyebrow>
        <Reveal className="mt-6">
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            다루는 도구들
          </h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((group, i) => (
            <Reveal key={group.label} delay={i * 0.05}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                {group.label}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-sm text-white/70 transition-colors duration-300 hover:border-white/25 hover:text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* =========================== AWARDS ========================== */}
      <section className="relative border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6 py-28 md:py-36">
          <Eyebrow>Recognition</Eyebrow>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {AWARDS.map((a) => (
              <motion.div
                key={a.title}
                variants={staggerItem}
                className="flex items-baseline gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors duration-300 hover:border-white/20"
              >
                <span className="font-display text-lg font-bold text-white/30">
                  {a.year}
                </span>
                <div>
                  <p className="font-semibold text-white/90">{a.title}</p>
                  <p className="mt-0.5 text-sm text-white/45">{a.detail}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================== CONTACT ========================== */}
      <section className="relative overflow-hidden px-6 py-36 md:py-52">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-[120px]"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <Eyebrow>Let&apos;s talk</Eyebrow>
          <Reveal className="mt-8">
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              함께 만들 사람을
              <br />
              찾고 있다면.
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="mt-6">
            <p className="mx-auto max-w-xl text-base leading-relaxed text-white/50">
              협업 제안, 채용, 커피챗 모두 환영합니다. 편한 채널로 연락 주세요.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${PROFILE.email}`}
                className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-transform duration-300 hover:-translate-y-0.5"
              >
                {PROFILE.email}
              </a>
              <a
                href={PROFILE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/80 transition-colors duration-300 hover:bg-white/10"
              >
                GitHub
              </a>
              <Link
                href="/"
                className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/80 transition-colors duration-300 hover:bg-white/10"
              >
                블로그
              </Link>
            </div>
          </Reveal>
          <p className="mt-16 text-xs text-white/25">
            © {new Date().getFullYear()} {PROFILE.nameEn} · Built with Next.js &
            Motion
          </p>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Work card — hover lift + gradient sheen                            */
/* ------------------------------------------------------------------ */
function WorkCard({
  work,
  featured,
}: {
  work: (typeof WORKS)[number];
  featured?: boolean;
}) {
  const external = work.href.startsWith("http");
  const inner = (
    <>
      <div
        className={`pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br ${work.accent} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`}
      />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              className={`inline-block rounded-full bg-gradient-to-r ${work.accent} bg-clip-text text-[11px] font-semibold uppercase tracking-[0.14em] text-transparent`}
            >
              {work.tagline}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">
              {work.title}
            </h3>
          </div>
          <span className="shrink-0 text-xs font-medium text-white/35">
            {work.period}
          </span>
        </div>

        <p className="mt-4 flex-1 text-sm leading-[1.8] text-white/55">
          {work.description}
        </p>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <div className="font-display text-2xl font-bold text-white">
              {work.metric}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-white/35">
              {work.metricLabel}
            </div>
          </div>
          <span className="text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
            ↗
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
          {work.stack.map((s) => (
            <span
              key={s}
              className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/45"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  const className = `group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-white/20 ${
    featured ? "md:col-span-2" : ""
  }`;

  return (
    <Reveal>
      {external ? (
        <a href={work.href} target="_blank" rel="noopener noreferrer" className={className}>
          {inner}
        </a>
      ) : (
        <Link href={work.href} className={className}>
          {inner}
        </Link>
      )}
    </Reveal>
  );
}

/* Word-staggered manifesto paragraph */
function RevealParagraph({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.p
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={{ show: { transition: { staggerChildren: 0.025 } } }}
      className="max-w-4xl font-display text-2xl font-semibold leading-[1.5] tracking-tight text-white/90 md:text-4xl md:leading-[1.4]"
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0.12 },
            show: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
          }}
          className="inline-block"
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </motion.p>
  );
}
