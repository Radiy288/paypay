import { useEffect, useState } from "react";
import type { Theme } from "./types";
import { HeroSection } from "./components/hero-section";
import { PartnersMarqueeSection } from "./components/partners-marquee-section";
import { ExternalAdBanner } from "./components/external-ad-banner";
import { TestimonialsSection } from "./components/testimonials-section";
import { CommunitySection } from "./components/community-section";
import { ServerListSection } from "./components/server-list-section";
import { FeedbackSection } from "./components/feedback-section";
import { LegalsSection } from "./components/legals-section";

function getInitialTheme(): Theme {
  const stored = window.localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return theme;
}

export default function App() {
  const theme = useTheme();

  return (
    <main className="min-h-screen bg-white text-slate-950 transition-colors duration-200 dark:bg-black dark:text-white">
      <HeroSection />
      <PartnersMarqueeSection theme={theme} />
      <ExternalAdBanner />
      <TestimonialsSection />
      <CommunitySection />
      <ServerListSection />
      <FeedbackSection />
      <LegalsSection />
    </main>
  );
}