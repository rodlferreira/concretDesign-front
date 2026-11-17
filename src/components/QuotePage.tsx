import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useI18n } from "../i18n/I18n";
import { projects } from "../lib/projects";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { QuoteForm } from "./QuoteForm";

export function QuotePage() {
  const { t } = useI18n();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (paused || reduced) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % projects.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, reduced]);
  return (
    <section className="quote-page" aria-labelledby="quote-page-title">
      <div className="quote-dialog-backdrop" aria-hidden="true">
        {projects.map((project, index) => (
          <img
            key={project.id}
            src={`/images/${project.image}.webp`}
            alt=""
            className={index === active ? "is-active" : ""}
          />
        ))}
      </div>
      <a href="/" className="quote-page-back text-link">
        <ArrowLeft size={16} />
        {t("nav.home")}
      </a>
      <div className="quote-dialog-layout">
        <aside className="quote-dialog-inspiration">
          <img
            className="quote-dialog-symbol"
            src="/images/brand-symbol.svg"
            width="80"
            height="80"
            alt="ConcretDesign"
          />
          <p className="eyebrow">ConcretDesign · {t("nav.portfolio")}</p>
          <div className="quote-mini-carousel">
            <div
              className="quote-mini-track"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {projects.map((project) => (
                <a
                  href={`/portfolio?project=${project.id}`}
                  key={project.id}
                  aria-label={t("gallery.title")}
                  tabIndex={projects[active].id === project.id ? 0 : -1}
                >
                  <img
                    key={project.id}
                    src={`/images/${project.image}.webp`}
                    alt=""
                    width="480"
                    height="330"
                  />
                </a>
              ))}
            </div>
          </div>
          <div className="quote-mini-controls">
            <button
              type="button"
              onClick={() => {
                setPaused(true);
                setActive(
                  (value) => (value - 1 + projects.length) % projects.length,
                );
              }}
              aria-label={t("carousel.previous")}
            >
              <ArrowLeft size={17} />
            </button>
            <span aria-hidden="true">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(projects.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              disabled={reduced}
              onClick={() => setPaused((value) => !value)}
              aria-label={t(
                paused || reduced ? "carousel.play" : "carousel.pause",
              )}
            >
              {paused || reduced ? <Play size={17} /> : <Pause size={17} />}
            </button>
            <button
              className="quote-next"
              type="button"
              onClick={() => {
                setPaused(true);
                setActive((value) => (value + 1) % projects.length);
              }}
              aria-label={t("carousel.next")}
            >
              <ArrowRight size={17} />
            </button>
          </div>
          <p className="quote-dialog-demo">{t("demo")}</p>
        </aside>
        <div className="quote-dialog-form">
          <p className="eyebrow">{t("quote")}</p>
          <h1 id="quote-page-title">{t("contact.title")}</h1>
          <p>{t("contact.text")}</p>
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}
