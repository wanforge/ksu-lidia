"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

/* ─── Stagger wrapper ──────────────────────────────────── */
export function StaggerContainer({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.08, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Fade-up item ─────────────────────────────────────── */
export function FadeUp({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated counter that springs from 0 → target ────── */
export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  className,
  duration = 1.2,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const end = start + duration * 1000;

    function tick(now: number) {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (now < end) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayed.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

/* ─── Pulse ring for live status dots ──────────────────── */
export function PulseRing({ color = "bg-emerald-500" }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${color}`}
      />
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`}
      />
    </span>
  );
}

/* ─── Shimmer highlight bar on hero ────────────────────── */
export function ShimmerBar() {
  return (
    <motion.div
      className="absolute -left-20 top-0 h-full w-20 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      animate={{ left: ["0%", "120%"] }}
      transition={{
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 6,
      }}
    />
  );
}

/* ─── Floating decorative circles for hero ─────────────── */
export function FloatingOrbs() {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 10, 0],
          y: [0, -8, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-slate-500/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -12, 0],
          y: [0, 6, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </>
  );
}

/* ─── Activity feed scroll-in item ─────────────────────── */
export function ActivityItem({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        delay: 0.15 + index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Current time display (re-renders every 30s) ──────── */
export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  const dayName = now.toLocaleDateString("id-ID", { weekday: "long" });
  const datePart = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timePart = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <p className="flex items-center gap-2 text-sm text-slate-300">
      <span className="inline-flex h-5 items-center rounded-full bg-slate-700/60 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
        {dayName}
      </span>
      <span>
        {datePart} • {timePart}
      </span>
    </p>
  );
}
