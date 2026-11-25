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
        <picture className="about-official-logo">
          <img
            src="/images/brand/official-light.webp"
            width="1000"
            height="860"
            alt="ConcretDesign — Revestimentos decorativos"
            loading="lazy"
          />
        </picture>
      </div>
      <div className="about-story-copy">
        <p className="eyebrow">{t("nav.about")}</p>
        <h2 id="about-title">{t("about.title")}</h2>
        <p>{t("about.text")}</p>
        <p>{t("about.team")}</p>
        <p>{t("about.partners")}</p>
        <a className="text-link about-invitation" href="/#contactos">
          {t("about.invitation")}
        </a>
      </div>
    </section>
  );
}
