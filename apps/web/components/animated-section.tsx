"use client";

import { useRef, useEffect } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  type Variants,
} from "framer-motion";

// ─── Preset animation variants ───────────────────────────────────────────────

const presets: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  slideRight: {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────

type AnimatedSectionProps = {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof presets;
  delay?: number;
  staggerChildren?: number;
  once?: boolean;
  threshold?: number;
  noScroll?: boolean;
  variants?: Variants;
  as?: keyof typeof motion;
};

// ─── AnimatedSection (scroll-triggered wrapper) ──────────────────────────────

export function AnimatedSection({
  children,
  className,
  variant = "fadeUp",
  delay = 0,
  staggerChildren,
  once = true,
  threshold = 0.15,
  noScroll = false,
  variants: customVariants,
  as: Tag = "div",
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once,
    margin: "-60px 0px",
    amount: threshold,
  });

  const baseVariants = customVariants ?? presets[variant];
  const variants: Variants = staggerChildren
    ? {
        container: {
          hidden: { opacity: 1 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren,
              delayChildren: delay,
            },
          },
        },
        item: baseVariants,
      }
    : baseVariants;

  const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      variants={staggerChildren ? variants.container : variants}
      initial={noScroll ? "visible" : "hidden"}
      animate={noScroll ? "visible" : inView ? "visible" : "hidden"}
    >
      {children}
    </MotionTag>
  );
}

// ─── AnimatedItem (child for stagger containers) ─────────────────────────────

export function AnimatedItem({
  children,
  className,
  variant = "fadeUp",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof presets;
}) {
  return (
    <motion.div className={className} variants={presets[variant]}>
      {children}
    </motion.div>
  );
}

// ─── AnimatedCounter (counts up from 0 on scroll) ────────────────────────────

export function AnimatedCounter({
  value,
  className,
  duration = 1.5,
  suffix = "",
}: {
  value: string;
  className?: string;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  // Strip non-numeric except dots
  const isCurrency = value.startsWith("$");
  const raw = value.replace(/[^0-9.]/g, "");
  const target = parseFloat(raw);
  const prefix = isCurrency ? "$" : "";
  const isInteger = Number.isFinite(target) && Number.isInteger(target);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {prefix}
      <CountUp
        from={0}
        to={isNaN(target) ? 0 : target}
        duration={duration}
        run={inView}
        decimals={isInteger ? 0 : 2}
      />
      {suffix}
    </span>
  );
}

function CountUp({
  from,
  to,
  duration,
  run,
  decimals,
}: {
  from: number;
  to: number;
  duration: number;
  run: boolean;
  decimals: number;
}) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (v: number) =>
    v.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );

  useEffect(() => {
    if (!run) return;
    const controls = animate(count, to, { duration, ease: "easeOut" });
    return controls.stop;
  }, [run, to, duration, count]);

  return <motion.span suppressHydrationWarning>{rounded}</motion.span>;
}
