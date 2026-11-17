import { useLayoutEffect } from "react";

/** Progressively enhances editorial text; content stays visible without animation support. */
export function useReveal() {
  useLayoutEffect(() => {
    const main = document.querySelector("main");
    if (!main || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targets = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -24px 0px" },
    );
    function register() {
      for (const element of main!.querySelectorAll("h1, h2, h3, p")) {
        // Feedback and form instructions must never wait for a scroll animation.
        if (
          targets.has(element) ||
          element.closest("form, [aria-live], [role=status], .project-carousel")
        )
          continue;
        targets.add(element);
        if (preference.matches) continue;
        element.classList.add("reveal-ready");
        observer.observe(element);
      }
    }
    function revealAll() {
      if (!preference.matches) return;
      observer.disconnect();
      for (const element of targets) element.classList.add("visible");
    }
    function revealFocused(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      target.closest(".reveal-ready")?.classList.add("visible");
    }
    register();
    const mutations = new MutationObserver(register);
    mutations.observe(main, { childList: true, subtree: true });
    preference.addEventListener("change", revealAll);
    main.addEventListener("focusin", revealFocused);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      preference.removeEventListener("change", revealAll);
      main.removeEventListener("focusin", revealFocused);
      for (const element of targets)
        element.classList.remove("reveal-ready", "visible");
    };
  }, []);
}
