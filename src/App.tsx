import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronRight, ArrowLeft } from "lucide-react";
import { Header } from "./components/Header";
import { ContrastToggle } from "./components/ContrastToggle";
import { Icon } from "./components/Icon";
import { Contact } from "./components/Contact";
import { Portfolio, ProjectMeta } from "./components/Portfolio";
import { useI18n, type Key } from "./i18n/I18n";
import { projects, services } from "./lib/projects";
import { useReveal } from "./hooks/useReveal";
function Home() {
  const { t } = useI18n();
  return (
    <>
      <section className="hero" id="inicio">
        <div
          className="hero-image"
          role="img"
          aria-label={t("project.hotel")}
        />
        <div className="hero-content">
          <p className="eyebrow">{t("hero.eyebrow")}</p>
          <h1>
            {t("hero.title")} <em>{t("hero.accent")}</em>
          </h1>
          <p className="hero-description">{t("hero.text")}</p>
          <div className="hero-buttons">
            <a className="button" href="#contactos">
              {t("quote")}
              <ArrowRight size={19} />
            </a>
            <a className="button outline" href="/portfolio">
              {t("portfolio.view")}
            </a>
          </div>
        </div>
        <a
          href="#servicos"
          className="hero-scroll"
          aria-label={t("nav.services")}
        >
          ↓
        </a>
      </section>
      <section className="services section-pad" id="servicos">
        <h2>
          {t("services.title")}
          <span className="small-rule" />
        </h2>
        <div className="service-list">
          {services.map((service) => (
            <a href={`/#contactos`} key={service.id} className="service">
              <Icon name={service.icon} />
              <h3>{t(`service.${service.id}`)}</h3>
              <p>{t(`service.${service.id}.text`)}</p>
            </a>
          ))}
        </div>
      </section>
      <section className="featured" aria-label={t("project.featured")}>
        {projects.slice(0, 4).map((project, index) => (
          <article
            key={project.id}
            className={`featured-row ${index % 2 ? "reverse" : ""}`}
          >
            <a className="featured-image" href={`/projects/${project.id}`}>
              <img
                src={`/images/${project.image}.webp`}
                width="800"
                height="320"
                alt={t(`project.${project.id}` as Key)}
                loading="lazy"
              />
            </a>
            <div className="featured-copy">
              <p className="eyebrow">{t("project.featured")}</p>
              <h2>{t(`project.${project.id}` as Key)}</h2>
              <ProjectMeta project={project} />
              <p>{t(`project.${project.id}.text` as Key)}</p>
              <a className="text-link" href={`/projects/${project.id}`}>
                {t("project.view")}
                <ArrowRight size={23} />
              </a>
            </div>
          </article>
        ))}
      </section>
      <Portfolio />
      <section className="materials section-pad">
        <div>
          <h2>{t("materials.title")}</h2>
          <p>{t("materials.text")}</p>
        </div>
        <div className="partners">
          <h3>{t("materials.partners")}</h3>
          <div className="partner-marks" aria-hidden="true">
            {["grid", "waves", "lines", "layers", "trowel"].map((name) => (
              <Icon key={name} name={name} />
            ))}
          </div>
          <p className="muted">{t("materials.pending")}</p>
        </div>
      </section>
      <section className="process section-pad" id="processo">
        <div>
          <h2>{t("process.title")}</h2>
          <p>{t("process.text")}</p>
        </div>
        <ol>
          {["visit", "quote", "work", "delivery", "warranty"].map(
            (step, index) => (
              <li key={step}>
                <span className="step-icon">
                  <Icon name={step} />
                </span>
                <h3>
                  {index + 1}. {t(`step.${step}` as Key)}
                </h3>
                <p>{t(`step.${step}.text` as Key)}</p>
                {index < 4 && <ChevronRight className="step-arrow" size={20} />}
              </li>
            ),
          )}
        </ol>
      </section>
      <section className="coverage section-pad">
        <svg className="portugal" viewBox="0 0 100 150" aria-hidden="true">
          <path d="m45 7 14 6 9-2 3 11 10 2-4 14-8 9 1 10-12 8 4 13-11 10-2 14-10 11-1 11-9 9 1 11-22-5 6-14 4-18 4-12-2-12 7-15-1-14 6-13-1-13 7-7z" />
          <path
            className="map-lines"
            d="m32 32 38 9m-40 9 30 15m-38 9 31 9m-35 15 30 8m-31 16 22 9M45 16 33 140"
          />
        </svg>
        <div>
          <h2>{t("coverage.title")}</h2>
          <p>{t("coverage.text")}</p>
        </div>
        <div className="regions">
          <h3>{t("coverage.regions")}</h3>
          <p>{t("coverage.list")}</p>
        </div>
      </section>
      <section className="about section-pad" id="sobre">
        <p className="eyebrow">{t("nav.about")}</p>
        <h2>{t("about.title")}</h2>
        <p>{t("about.text")}</p>
      </section>
      <Contact />
    </>
  );
}
function Detail() {
  const { t } = useI18n();
  const id = window.location.pathname.split("/")[2];
  const project = projects.find((p) => p.id === id);
  const [position, setPosition] = useState(50);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (project)
      document.title = `${t(`project.${project.id}` as Key)} | ConcretDesign`;
  }, [project, t]);
  if (!project)
    return (
      <section className="section-pad missing">
        <h1>{t("notfound")}</h1>
        <a href="/portfolio">{t("back")}</a>
      </section>
    );
  return (
    <>
      <section className="detail section-pad">
        <a className="text-link" href="/portfolio">
          <ArrowLeft size={18} />
          {t("back")}
        </a>
        <p className="eyebrow">{t("nav.portfolio")}</p>
        <h1 ref={heading}>{t(`project.${id}` as Key)}</h1>
        <ProjectMeta project={project} />
        <p className="demo-note">{t("demo")}</p>
        <img
          className="detail-hero"
          src={`/images/${project.image}.webp`}
          alt={t(`project.${id}` as Key)}
          width="1200"
          height="500"
        />
        <div className="detail-info">
          <div>
            <h2>{t("detail.about")}</h2>
            <p>
              {t(
                `project.${projects.slice(0, 4).some((p) => p.id === id) ? id : project.service === "micro" ? "hotel" : "living"}.text` as Key,
              )}
            </p>
          </div>
          <dl>
            {[
              ["detail.material", t(`service.${project.service}`)],
              ["detail.location", project.city],
              ["detail.type", t(`category.${project.category}`)],
              ["detail.area", t("detail.pending")],
            ].map(([key, value]) => (
              <div key={key}>
                <dt>{t(key as Key)}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="comparison">
          <h2>{t("comparison")}</h2>
          <div className="comparison-image">
            <img
              src={`/images/${project.image}.webp`}
              alt=""
              width="800"
              height="320"
            />
            <div
              className="comparison-before"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              <img
                src={`/images/${project.image}.webp`}
                alt=""
                width="800"
                height="320"
              />
            </div>
            <div
              className="comparison-divider"
              style={{ left: `${position}%` }}
            >
              <span>↔</span>
            </div>
            <span className="before-label">{t("before")}</span>
            <span className="after-label">{t("after")}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={position}
              aria-label={t("comparison")}
              onChange={(e) => setPosition(Number(e.target.value))}
            />
          </div>
          <p className="muted">{t("comparison.note")}</p>
        </div>
        <a className="button" href="/#contactos">
          {t("detail.request")}
          <ArrowRight size={18} />
        </a>
      </section>
      <Portfolio />
    </>
  );
}
function Privacy() {
  const { t } = useI18n();
  return (
    <section className="privacy section-pad">
      <a className="text-link" href="/">
        ← {t("nav.home")}
      </a>
      <h1>{t("privacy.title")}</h1>
      <p>{t("privacy.text")}</p>
      <p>{t("preferences")}</p>
      <p>
        <a href="mailto:geral@concretdesign.pt">geral@concretdesign.pt</a>
      </p>
    </section>
  );
}
export default function App() {
  useReveal();
  const { t } = useI18n();
  const path = window.location.pathname;
  return (
    <>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        {path === "/" ? (
          <Home />
        ) : path === "/portfolio" ? (
          <>
            <Portfolio full />
            <Contact />
          </>
        ) : path.startsWith("/projects/") ? (
          <Detail />
        ) : path === "/privacy" ? (
          <Privacy />
        ) : (
          <section className="section-pad missing">
            <h1>{t("notfound")}</h1>
            <a href="/">{t("nav.home")}</a>
          </section>
        )}
      </main>
      <footer className="footer section-pad">
        <span>
          © {new Date().getFullYear()} ConcretDesign. {t("footer.rights")}
        </span>
        <div className="footer-preferences">
          <ContrastToggle />
          <a href="/privacy">{t("privacy")}</a>
        </div>
      </footer>
    </>
  );
}
