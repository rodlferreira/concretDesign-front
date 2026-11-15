import { useState } from "react";
import { ArrowRight, MapPin, Building2 } from "lucide-react";
import { useI18n, type Key } from "../i18n/I18n";
import { projects, services, type Project } from "../lib/projects";
export function ProjectMeta({ project }: { project: Project }) {
  const { t } = useI18n();
  return (
    <p className="project-meta">
      <span>
        <MapPin size={16} />
        {project.city}
      </span>
      <span>
        <Building2 size={16} />
        {t(`category.${project.category}`)}
      </span>
    </p>
  );
}
export function ProjectCard({ project }: { project: Project }) {
  const { t } = useI18n();
  return (
    <a className="project-card" href={`/projects/${project.id}`}>
      <div className="image-wrap">
        <img
          src={`/images/${project.image}.webp`}
          alt={t(`project.${project.id}` as Key)}
          width="600"
          height="300"
          loading="lazy"
        />
        <span className="card-arrow">
          <ArrowRight size={18} />
        </span>
      </div>
      <h3>{t(`project.${project.id}` as Key)}</h3>
      <p>
        {project.city}
        <span> | </span>
        {t(`category.${project.category}`)}
        <span> | </span>
        {t(`service.${project.service}`)}
      </p>
    </a>
  );
}
export function Portfolio({ full = false }: { full?: boolean }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState("all");
  const items = full
    ? projects.filter((p) => filter === "all" || p.service === filter)
    : projects.slice(4);
  return (
    <section
      id="portfolio"
      className={
        full ? "portfolio portfolio-full section-pad" : "portfolio section-pad"
      }
    >
      <div className="portfolio-intro">
        <p className="eyebrow">{t("nav.portfolio")}</p>
        <h2>{t("portfolio.title")}</h2>
        <p>{t("portfolio.text")}</p>
        {!full && (
          <a className="text-link" href="/portfolio">
            {t("portfolio.all")}
            <ArrowRight size={20} />
          </a>
        )}
      </div>
      {full && (
        <div
          className="filters"
          role="group"
          aria-label={t("portfolio.filter")}
        >
          {["all", ...services.map((s) => s.id)].map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {id === "all" ? t("all") : t(`service.${id}` as Key)}
            </button>
          ))}
        </div>
      )}
      <div className="portfolio-grid">
        {items.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <p className="demo-note">{t("demo")}</p>
    </section>
  );
}
