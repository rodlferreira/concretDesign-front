import { useId, useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useI18n, type Key } from "../i18n/I18n";
import { coverageAreas, projectMapPoint } from "../lib/coverage";
import map from "../data/portugal-mainland.json";

export function CoverageMap() {
  const { t, locale } = useI18n();
  const [activeId, setActiveId] = useState(coverageAreas[0].id);
  const gradientId = useId();
  const active = coverageAreas.find((area) => area.id === activeId)!;
  const coveredDistricts = new Set(
    coverageAreas.flatMap((area) => area.districts),
  );
  const format = (value: number) =>
    new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 }).format(value);
  return (
    <section
      className="coverage-map-section section-pad"
      id="cobertura"
      aria-labelledby="coverage-title"
    >
      <figure className="coverage-map-figure">
        <div className="coverage-map-canvas">
          <span className="map-north" aria-hidden="true">
            <span>↑</span>N
          </span>
          <svg
            className="mainland-map"
            viewBox={map.viewBox}
            role="img"
            aria-label={t("coverage.title")}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#d9b18b" />
                <stop offset=".5" stopColor="#bd8b63" />
                <stop offset="1" stopColor="#91603e" />
              </linearGradient>
            </defs>
            {map.districts.map((district) => (
              <path
                key={district.id}
                d={district.path}
                fillRule="evenodd"
                className={`map-district ${coveredDistricts.has(district.id) ? "map-district--covered" : ""} ${active.districts.includes(district.id) ? "map-district--selected" : ""}`}
                style={
                  active.districts.includes(district.id)
                    ? { fill: `url(#${gradientId})` }
                    : undefined
                }
              >
                <title>{district.name}</title>
              </path>
            ))}
          </svg>
          {coverageAreas.map((area) => {
            const point = projectMapPoint(area.coordinates);
            return (
              <button
                key={area.id}
                className={`coverage-pin ${area.id === activeId ? "coverage-pin--active" : ""}`}
                style={{
                  left: `${(point.x / 350) * 100}%`,
                  top: `${(point.y / 560) * 100}%`,
                }}
                type="button"
                aria-label={`${area.name} · ${area.projects.length} ${t("gallery.results")}`}
                aria-pressed={area.id === activeId}
                aria-controls="coverage-projects"
                onClick={() => setActiveId(area.id)}
              >
                <MapPin size={29} strokeWidth={1.4} />
                <span className="coverage-pin-label" aria-hidden="true">
                  {area.shortName}
                </span>
              </button>
            );
          })}
        </div>
        <figcaption className="coverage-map-caption">
          <span>
            <MapPin size={14} />
            {t("coverage.title")}
          </span>
          <a
            href="https://www.geoboundaries.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            geoBoundaries · DGT
          </a>
        </figcaption>
      </figure>
      <div className="coverage-map-content">
        <p className="eyebrow">{t("coverage.regions")}</p>
        <h2 id="coverage-title">{t("coverage.title")}</h2>
        <p className="coverage-intro">{t("coverage.text")}</p>
        <div
          className="coverage-region-options"
          role="group"
          aria-label={t("coverage.regions")}
        >
          {coverageAreas.map((area) => (
            <button
              type="button"
              key={area.id}
              aria-pressed={area.id === activeId}
              aria-controls="coverage-projects"
              onClick={() => setActiveId(area.id)}
            >
              <span>{format(area.projects.length)}</span>
              {area.name}
            </button>
          ))}
        </div>
        <div className="coverage-projects" id="coverage-projects">
          <div className="coverage-selection" role="status" aria-live="polite">
            <h3>{active.name}</h3>
            <span>
              {t("gallery.results")} · {format(active.projects.length)}
            </span>
          </div>
          <p className="coverage-cities">{active.cities.join(" · ")}</p>
          <ul>
            {active.projects.map((project) => (
              <li key={project.id}>
                <a href={`/projects/${project.id}`}>
                  <img
                    src={`/images/${project.image}.webp`}
                    width="92"
                    height="64"
                    alt=""
                    loading="lazy"
                  />
                  <span>
                    <span>
                      {project.city} · {t(`service.${project.service}`)}
                    </span>
                    <strong>{t(`project.${project.id}` as Key)}</strong>
                  </span>
                  <ArrowUpRight size={18} strokeWidth={1.3} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="coverage-demo">{t("demo")}</p>
      </div>
    </section>
  );
}
