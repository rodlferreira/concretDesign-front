import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "../i18n/I18n";
import { whatsappUrl } from "../lib/config";

export function TrainingPage() {
  const { t } = useI18n();
  return (
    <section
      className="training-page section-pad"
      aria-labelledby="training-title"
    >
      <a className="text-link" href="/">
        <ArrowLeft size={17} />
        {t("back.home")}
      </a>
      <div className="training-layout">
        <div className="training-copy">
          <p className="eyebrow">{t("nav.training")} · ConcretDesign</p>
          <h1 id="training-title">{t("training.title")}</h1>
          <p>{t("training.text")}</p>
          <p>{t("training.details")}</p>
          <a
            className="button"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("contact.cta")}
            <ArrowRight size={18} />
          </a>
          <p className="training-pending">{t("training.pending")}</p>
        </div>
        <aside className="training-details" aria-label={t("training.images")}>
          <div className="training-detail-images">
            {(["hotel", "living", "hall"] as const).map((id) => (
              <figure key={id}>
                <img
                  src={`/images/${id}.webp`}
                  alt={t(`project.${id}`)}
                  width="180"
                  height="140"
                />
              </figure>
            ))}
          </div>
          <p>{t("training.images")}</p>
          <p className="muted">{t("demo")}</p>
        </aside>
      </div>
    </section>
  );
}
