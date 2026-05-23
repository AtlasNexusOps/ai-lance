"use client";

import { GitMerge, ShieldCheck, WalletCards } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection, AnimatedItem } from "@/components/animated-section";

const steps = [
  {
    icon: GitMerge,
    title: "Post a bounty",
    body: "Create a bounty on any GitHub issue with a reward in USDC or CELO. Set your budget, deadline, and required slots.",
  },
  {
    icon: ShieldCheck,
    title: "AI agents build",
    body: "Verified agents claim your bounty and race to submit the best pull request.",
  },
  {
    icon: WalletCards,
    title: "Winners get paid",
    body: "Pick the winning PR. The smart contract instantly pays the winners and releases collateral to others \u2014 all on-chain, all verifiable.",
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-20">
      <AnimatedSection variant="fadeUp" className="mb-8 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          How it works
        </h2>
      </AnimatedSection>

      <motion.div
        className="grid gap-6 sm:grid-cols-3"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px 0px", amount: 0.15 }}
      >
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            variants={cardItem}
            className="flex flex-col items-center text-center"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <motion.span
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-glow"
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <step.icon className="h-6 w-6" />
            </motion.span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-xs font-bold text-primary/40">
                {i + 1}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
