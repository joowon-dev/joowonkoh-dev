"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Icon } from "@iconify/react";
import { useRef } from "react";
import Link from "next/link";
import {
  PROFILE,
  METRICS,
  JOURNEY,
  WORKS,
  SKILL_MARQUEE,
  AWARDS,
  PHILOSOPHY,
  techIcon,
} from "@/lib/portfolio";
import {
  Reveal,
  CountUp,
  KineticText,
  Marquee,
  MagneticButton,
  stagger,
  staggerItem,
  EASE,
} from "./primitives";
import GithubContributions from "./GithubContributions";

/* Spring curve reused for all interactive lifts (Supanova standard). */
const SPRING = "[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]";

/* ------------------------------------------------------------------ */
/*  Ambient mesh — lime/emerald orbs, no purple "AI gradient".          */
/* ------------------------------------------------------------------ */
function Ambient() {
  const orbs = [
    { c: "bg-[#9fd42f]/20", s: "h-[40vw] w-[40vw] left-[-6%] top-[4%]", d: 20 },
    { c: "bg-emerald-500/14", s: "h-[36vw] w-[36vw] right-[-4%] top-[0%]", d: 24 },
    { c: "bg-[#C6F24E]/10", s: "h-[32vw] w-[32vw] left-[30%] top-[40%]", d: 28 },
    { c: "bg-teal-400/10", s: "h-[28vw] w-[28vw] right-[16%] bottom-[4%]", d: 22 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {orbs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[100px] ${b.c} ${b.s}`}
          animate={{ x: [0, 36, -28, 0], y: [0, -28, 26, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* Section eyebrow — Supanova pill badge */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Reveal>
      <span className="inline-flex items-center gap-2 rounded-full border border-[#C6F24E]/20 bg-[#C6F24E]/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8f87e]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#C6F24E]" />
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

  const { scrollYProgress: heroProgress } = useScroll({
    target: rootRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.06]);

  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 -mt-16 -mb-16 overflow-x-clip break-keep bg-[#050505] text-white antialiased [text-wrap:pretty]">
      {/* Scroll progress — single lime hue */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-[#C6F24E] to-[#9fd42f]"
      />

      {/* ============================ HERO ============================ */}
      <section
        ref={rootRef}
        className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6"
      >
        <Ambient />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 75% 60% at 50% 42%, black 40%, transparent 100%)",
          }}
        />
        {/* floating accent ring */}
        <motion.div
          aria-hidden
          animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute right-[14%] top-[22%] hidden h-16 w-16 rounded-full border border-[#C6F24E]/25 md:block"
        />
        <motion.div
          aria-hidden
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-[16%] bottom-[26%] hidden h-2.5 w-2.5 rounded-full bg-[#C6F24E]/70 md:block"
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-9 inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-[13px] font-medium tracking-wide text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C6F24E] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C6F24E]" />
            </span>
            {PROFILE.badge}
          </motion.span>

          <h1 className="font-display text-[19vw] font-extrabold leading-[0.9] tracking-tight sm:text-[13vw] md:text-[10rem]">
            <KineticText text="고주원" delay={0.15} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.6, ease: EASE }}
            className="mt-9 max-w-2xl text-balance text-xl font-medium leading-relaxed text-white/75 md:text-2xl"
          >
            {PROFILE.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.85, ease: EASE }}
            className="mt-11 flex flex-wrap items-center justify-center gap-3"
          >
            <MagneticButton
              href="#work"
              className="group inline-flex items-center gap-3 rounded-full bg-[#C6F24E] py-2 pl-7 pr-2 text-[15px] font-semibold text-black shadow-[0_10px_36px_-10px_rgba(198,242,78,0.6)]"
            >
              작업 보기
              <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/10 transition-transform duration-500 ${SPRING} group-hover:translate-x-0.5`}>
                →
              </span>
            </MagneticButton>
            <a
              href={`mailto:${PROFILE.email}`}
              className={`rounded-full border border-white/18 bg-white/[0.04] px-7 py-3.5 text-[15px] font-semibold text-white/85 backdrop-blur-md transition-all duration-500 ${SPRING} hover:-translate-y-1 hover:bg-white/[0.1] active:scale-[0.97]`}
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
        <div className="mt-9">
          <RevealParagraph text={PHILOSOPHY} />
        </div>
        <Reveal delay={0.2} className="mt-10">
          <p className="max-w-[62ch] break-keep text-lg leading-[1.9] text-white/60">
            {PROFILE.intro}
          </p>
        </Reveal>
      </section>

      {/* ========================== METRICS ========================== */}
      <section className="relative border-y border-white/10 bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Eyebrow>By the numbers</Eyebrow>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3"
          >
            {METRICS.map((m) => (
              <motion.div key={m.label} variants={staggerItem}>
                <div className="flex items-start gap-1.5">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C6F24E]" />
                  <span className="font-display text-5xl font-extrabold tracking-tight text-white md:text-6xl">
                    <CountUp
                      value={m.value}
                      suffix={m.suffix}
                      prefix={m.prefix}
                      comma={m.comma}
                    />
                  </span>
                </div>
                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: m.bar / 100 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
                    style={{ originX: 0 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#C6F24E] to-[#9fd42f]"
                  />
                </div>
                <p className="mt-3.5 text-[15px] font-semibold text-white/85">
                  {m.label}
                </p>
                <p className="mt-1 break-keep text-[13px] leading-relaxed text-white/50">
                  {m.sub}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* GitHub contribution graph — the dramatic "잔디" visual */}
          <Reveal className="mt-16">
            <GithubContributions username="joowon-dev" />
          </Reveal>
        </div>
      </section>

      {/* ========================== JOURNEY ========================== */}
      <section className="relative mx-auto max-w-5xl px-6 py-28 md:py-40">
        <Eyebrow>Journey</Eyebrow>
        <Reveal className="mt-7">
          <h2 className="font-display text-4xl font-bold tracking-tight text-balance md:text-5xl">
            지나온 길
          </h2>
        </Reveal>

        <div className="mt-16 space-y-14">
          {JOURNEY.map((j, i) => (
            <Reveal key={j.org} delay={i * 0.05}>
              <div className="group relative grid grid-cols-1 gap-6 border-t border-white/10 pt-10 md:grid-cols-[minmax(0,200px)_1fr]">
                <div className="md:sticky md:top-24 md:self-start">
                  <p className="font-mono text-[13px] font-semibold tracking-tight text-[#C6F24E]/90">
                    {j.period}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {j.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-white/55"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-white md:text-[1.75rem]">
                    {j.org}
                  </h3>
                  <p className="mt-1.5 text-[15px] font-medium text-[#d8f87e]/70">
                    {j.role}
                  </p>
                  <p className="mt-4 max-w-2xl break-keep text-[15px] leading-[1.85] text-white/70">
                    {j.summary}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {j.points.map((p) => (
                      <li
                        key={p}
                        className="flex gap-3 break-keep text-[14.5px] leading-relaxed text-white/65"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C6F24E]/80" />
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
      <section id="work" className="relative border-t border-white/10 bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-40">
          <Eyebrow>Selected Work</Eyebrow>
          <Reveal className="mt-7">
            <h2 className="max-w-3xl font-display text-4xl font-bold leading-snug tracking-tight text-balance md:text-5xl">
              퇴근 후에도 멈추지 않고 만드는{" "}
              <span className="bg-gradient-to-r from-[#d8f87e] to-[#C6F24E] bg-clip-text text-transparent">
                실사용 서비스
              </span>
            </h2>
          </Reveal>

          {/* Bento — wide cards span two columns */}
          <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2">
            {WORKS.map((w) => (
              <WorkCard key={w.title} work={w} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================== ARSENAL ========================== */}
      <section className="relative overflow-hidden py-28 md:py-36">
        <div className="mx-auto mb-14 max-w-6xl px-6">
          <Eyebrow>Tech Arsenal</Eyebrow>
          <Reveal className="mt-7">
            <h2 className="font-display text-4xl font-bold leading-snug tracking-tight text-balance md:text-5xl">
              손에 익은 도구들
            </h2>
          </Reveal>
        </div>

        {/* two marquee rows, opposite directions */}
        <div className="space-y-4">
          <Marquee duration={38}>
            {SKILL_MARQUEE.map((s, i) => (
              <SkillChip key={`a-${s}-${i}`} label={s} />
            ))}
          </Marquee>
          <Marquee duration={44} reverse>
            {[...SKILL_MARQUEE].reverse().map((s, i) => (
              <SkillChip key={`b-${s}-${i}`} label={s} />
            ))}
          </Marquee>
        </div>

        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050505] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050505] to-transparent" />
      </section>

      {/* =========================== AWARDS ========================== */}
      <section className="relative border-t border-white/10 bg-white/[0.015]">
        <div className="mx-auto max-w-5xl px-6 py-28 md:py-36">
          <Eyebrow>Recognition</Eyebrow>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {AWARDS.map((a) => (
              <motion.div
                key={a.title}
                variants={staggerItem}
                className={`flex items-baseline gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-500 ${SPRING} hover:-translate-y-0.5 hover:border-[#C6F24E]/30`}
              >
                <span className="font-mono text-base font-bold text-[#C6F24E]/80">
                  {a.year}
                </span>
                <div>
                  <p className="font-semibold text-white/90 break-keep">{a.title}</p>
                  <p className="mt-0.5 break-keep text-[13.5px] text-white/55">
                    {a.detail}
                  </p>
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
            animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 h-[55vw] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9fd42f]/12 blur-[130px]"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <Eyebrow>Let&apos;s talk</Eyebrow>
          <Reveal className="mt-9">
            <h2 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-balance md:text-6xl">
              함께 만들 사람을
              <br />
              찾고 있다면.
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="mt-7">
            <p className="mx-auto max-w-xl break-keep text-lg leading-relaxed text-white/60">
              커피챗, 채용, 협업 무엇이든 좋아요. 뭔가 만드는 이야기라면 언제든
              환영입니다.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-11">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <MagneticButton
                href={`mailto:${PROFILE.email}`}
                className="group inline-flex items-center gap-3 rounded-full bg-[#C6F24E] py-2.5 pl-7 pr-2.5 text-[15px] font-semibold text-black shadow-[0_10px_36px_-10px_rgba(198,242,78,0.6)]"
              >
                {PROFILE.email}
                <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/10 transition-transform duration-500 ${SPRING} group-hover:translate-x-0.5`}>
                  →
                </span>
              </MagneticButton>
              <a
                href={PROFILE.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-full border border-white/18 px-7 py-4 text-[15px] font-semibold text-white/85 transition-all duration-500 ${SPRING} hover:-translate-y-1 hover:bg-white/[0.08] active:scale-[0.97]`}
              >
                GitHub
              </a>
              <Link
                href="/"
                className={`rounded-full border border-white/18 px-7 py-4 text-[15px] font-semibold text-white/85 transition-all duration-500 ${SPRING} hover:-translate-y-1 hover:bg-white/[0.08] active:scale-[0.97]`}
              >
                블로그
              </Link>
            </div>
          </Reveal>
          <p className="mt-16 text-[13px] text-white/30">
            © {new Date().getFullYear()} {PROFILE.nameEn} · Built with Next.js &
            Motion
          </p>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skill chip (marquee)                                               */
/* ------------------------------------------------------------------ */
function SkillChip({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-[15px] font-medium text-white/80 transition-colors duration-300 group-hover:border-[#C6F24E]/25">
      <Icon
        icon={techIcon(label)}
        className="h-[18px] w-[18px] text-white/85"
        aria-hidden
      />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Work card — spring lift + tinted lime edge glow                    */
/* ------------------------------------------------------------------ */
function WorkCard({ work }: { work: (typeof WORKS)[number] }) {
  const external = work.href.startsWith("http");
  const wide = work.span === "wide";

  const inner = (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(2rem-0.375rem)] bg-[#0b0b0d] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
      <div className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_top_right,rgba(198,242,78,0.16),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#C6F24E]/90">
              {work.tagline}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">
              {work.title}
            </h3>
          </div>
          <span className="shrink-0 font-mono text-[12px] font-medium text-white/40">
            {work.period}
          </span>
        </div>

        <p className="mt-4 flex-1 break-keep text-[14.5px] leading-[1.8] text-white/65">
          {work.description}
        </p>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <div
              className="font-display text-2xl font-bold text-white"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {work.metric}
            </div>
            <div className="mt-0.5 text-[11.5px] uppercase tracking-wide text-white/45">
              {work.metricLabel}
            </div>
          </div>
          <span className="text-lg text-white/40 transition-all duration-500 group-hover:translate-x-1 group-hover:text-[#C6F24E]">
            ↗
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
          {work.stack.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-1 text-[11px] font-medium text-white/60"
            >
              <Icon
                icon={techIcon(s)}
                className="h-3.5 w-3.5 text-white/70"
                aria-hidden
              />
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // Double-Bezel: glass core seated in a machined tray.
  const className = `group relative block rounded-[2rem] bg-white/[0.045] p-1.5 ring-1 ring-white/10 transition-all duration-500 ${SPRING} hover:-translate-y-1.5 hover:ring-[#C6F24E]/40 ${
    wide ? "md:col-span-2" : ""
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

/* Word-staggered manifesto paragraph — brightens word by word on scroll */
function RevealParagraph({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.p
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={{ show: { transition: { staggerChildren: 0.025 } } }}
      className="max-w-4xl break-keep font-display text-[1.65rem] font-semibold leading-[1.5] tracking-tight text-white md:text-[2.5rem] md:leading-[1.4]"
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0.16 },
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
