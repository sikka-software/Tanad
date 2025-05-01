"use client";

import { ChevronRight, Menu, X } from "lucide-react";
import { useScroll } from "motion/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function HeroSection() {
  const t = useTranslations();
  return (
    <>
      <main className="overflow-hidden">
        <section>
          <div className="relative pt-24">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"></div>
            <div className="mx-auto max-w-5xl px-6">
              <div className="sm:mx-auto lg:mr-auto">
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                >
                  <h1 className="mt-8 max-w-2xl text-5xl font-bold text-balance md:text-6xl lg:mt-16">
                    {t("Landing.hero.title")}
                  </h1>
                  <p className="mt-8 max-w-2xl text-lg text-pretty">
                    Tailwindcss highly customizable components for building modern websites and
                    applications that look and feel the way you mean it.
                  </p>
                  <div className="mt-12 flex items-center gap-2">
                    <div key={1} className="bg-foreground/10 rounded-[14px] border p-0.5">
                      <Button asChild size="lg" className="rounded-xl px-5 text-base">
                        <Link href="#link">
                          <span className="text-nowrap">Start Building</span>
                        </Link>
                      </Button>
                    </div>
                    <Button
                      key={2}
                      asChild
                      size="lg"
                      variant="ghost"
                      className="h-[42px] rounded-xl px-5 text-base"
                    >
                      <Link href="#link">
                        <span className="text-nowrap">Request a demo</span>
                      </Link>
                    </Button>
                  </div>
                </AnimatedGroup>
              </div>
            </div>
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative mt-8 -mr-56 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20">
                <div
                  aria-hidden
                  className="to-background absolute inset-0 z-10 bg-gradient-to-b from-transparent from-35%"
                />
                <div className="ring-background bg-background relative mx-auto max-w-5xl overflow-hidden rounded-2xl border p-4 shadow-lg ring-1 inset-shadow-2xs shadow-zinc-950/15 dark:inset-shadow-white/20">
                  <img
                    className="bg-background relative hidden aspect-15/8 rounded-2xl dark:block"
                    src="https://tailark.com/_next/image?url=%2Fmail2.png&w=3840&q=75"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                  <img
                    className="border-border/25 relative z-2 aspect-15/8 rounded-2xl border dark:hidden"
                    src="https://tailark.com/_next/image?url=%2Fmail2-light.png&w=3840&q=75"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </>
  );
}

const menuItems = [
  { name: "Features", href: "#link" },
  { name: "Solution", href: "#link" },
  { name: "Pricing", href: "#link" },
  { name: "About", href: "#link" },
];
