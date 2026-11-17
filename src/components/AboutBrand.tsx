import { useI18n } from "../i18n/I18n";

export function AboutBrand() {
  const { t } = useI18n();
  return (
    <section
      className="about-story section-pad"
      id="sobre"
      aria-labelledby="about-title"
    >
      <div className="about-brand-panel">
        <div
          className="about-brand-art"
          role="img"
          aria-label="ConcretDesign — Revestimentos decorativos"
        >
          <div className="about-brand-emblem" aria-hidden="true">
            <img
              src="/images/brand-symbol.svg"
              width="454"
              height="424"
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="about-wordmark" aria-hidden="true">
            <span className="about-wordmark-name">
              CONCRET<span>DESIGN</span>
            </span>
            <span className="about-wordmark-tagline">
              REVESTIMENTOS DECORATIVOS
            </span>
          </div>
        </div>
      </div>
      <div className="about-story-copy">
        <p className="eyebrow">{t("nav.about")}</p>
        <h2 id="about-title">{t("about.title")}</h2>
        <p>{t("about.text")}</p>
        <p>{t("hero.text")}</p>
      </div>
    </section>
  );
}
