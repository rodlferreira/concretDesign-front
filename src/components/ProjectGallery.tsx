import { brochureUrl } from "../lib/config";
import { useState } from "react";
import {
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  ArrowLeft,
  FileDown,
} from "lucide-react";
import { useI18n, type Key } from "../i18n/I18n";
import { projects, services } from "../lib/projects";
import { projectDescriptionKey } from "../lib/projectCopy";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

export function ProjectGallery() {
  const { t, locale } = useI18n();
  const selectedId = new URLSearchParams(window.location.search).get("project");
  const initialProject = projects.find((project) => project.id === selectedId);
  const [finish, setFinish] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const items = projects.filter(
    (project) =>
      (finish === "all" || project.service === finish) &&
      (category === "all" || project.category === category) &&
      normalize(
        `${t(`project.${project.id}` as Key)} ${project.city} ${t(`service.${project.service}`)}`,
      ).includes(normalize(query.trim())),
  );
  const ordered = [...items].sort(
    (a, b) =>
      Number(b.id === initialProject?.id) - Number(a.id === initialProject?.id),
  );
  const clear = () => {
    setFinish("all");
    setCategory("all");
    setQuery("");
  };
  return (
    <section className="gallery-page" aria-labelledby="gallery-title">
      <header className="gallery-header">
        <div>
          <p className="eyebrow">ConcretDesign · {t("nav.portfolio")}</p>
          <h1 id="gallery-title">{t("gallery.title")}</h1>
        </div>
        <a className="text-link" href="/">
          <ArrowLeft size={17} />
          {t("back.home")}
        </a>
      </header>
      <div className="gallery-download">
        <a
          className="button outline"
          href={brochureUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileDown size={18} />
          {t("brochure.download")} · PDF
        </a>
      </div>
      <div className="gallery-shell">
        <aside className="gallery-sidebar" aria-label={t("portfolio.filter")}>
          <label className="gallery-search">
            <Search size={17} strokeWidth={1.5} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("gallery.search")}
              aria-label={t("gallery.search")}
            />
          </label>
          <fieldset className="gallery-finish-options">
            <legend>
              <SlidersHorizontal size={15} />
              {t("portfolio.filter")}
            </legend>
            {["all", ...services.map((service) => service.id)].map((id) => (
              <label className="gallery-finish-option" key={id}>
                <input
                  type="radio"
                  name="gallery-finish"
                  value={id}
                  checked={finish === id}
                  onChange={() => setFinish(id)}
                />
                <span>
                  {id === "all" ? t("all") : t(`service.${id}` as Key)}
                </span>
                <small aria-hidden="true">
                  {id === "all"
                    ? projects.length
                    : projects.filter((project) => project.service === id)
                        .length}
                </small>
              </label>
            ))}
          </fieldset>
          <label className="gallery-mobile-finish">
            {t("portfolio.filter")}
            <select
              value={finish}
              onChange={(event) => setFinish(event.target.value)}
            >
              {["all", ...services.map((service) => service.id)].map((id) => (
                <option key={id} value={id}>
                  {id === "all" ? t("all") : t(`service.${id}` as Key)}
                </option>
              ))}
            </select>
          </label>
          <label className="gallery-category">
            {t("detail.type")}
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">{t("all")}</option>
              {["hotel", "home", "retail", "corporate"].map((id) => (
                <option value={id} key={id}>
                  {t(`category.${id}` as Key)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="gallery-clear" onClick={clear}>
            {t("gallery.clear")}
          </button>
          <p className="gallery-demo">{t("demo")}</p>
        </aside>
        <div className="gallery-results">
          <p className="gallery-result-count" role="status">
            {t("gallery.results")}{" "}
            <span>
              {new Intl.NumberFormat(locale, {
                minimumIntegerDigits: 2,
              }).format(items.length)}
            </span>
          </p>
          {ordered.length ? (
            <div className="gallery-grid">
              {ordered.map((project) => (
                <a
                  key={project.id}
                  className={`gallery-card ${project.id === initialProject?.id ? "gallery-card--selected" : ""}`}
                  href={`/projects/${project.id}`}
                >
                  <div className="gallery-card-image">
                    <img
                      src={`/images/${project.image}.webp`}
                      width="700"
                      height="450"
                      loading="lazy"
                      alt={t(`project.${project.id}` as Key)}
                    />
                    <span className="gallery-card-material">
                      {t(`service.${project.service}`)}
                    </span>
                    <ArrowUpRight className="gallery-card-arrow" size={20} />
                  </div>
                  <div className="gallery-card-copy">
                    <span>
                      {project.city} · {t(`category.${project.category}`)}
                    </span>
                    <h3>{t(`project.${project.id}` as Key)}</h3>
                    <p>{t(projectDescriptionKey(project))}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <p>{t("gallery.empty")}</p>
              <button type="button" className="text-link" onClick={clear}>
                {t("gallery.clear")}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
