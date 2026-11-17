import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useI18n, type Key } from "../i18n/I18n";
import { projects } from "../lib/projects";
import { projectDescriptionKey } from "../lib/projectCopy";
import { useMediaQuery } from "../hooks/useMediaQuery";

const DWELL_MS = 6500;
const slides = [projects[projects.length - 1], ...projects, projects[0]];

export function ProjectCarousel() {
  const { t, locale } = useI18n();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const regionRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [moving, setMoving] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(!document.hidden);
  const pointerStart = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const frameRef = useRef<number[]>([]);
  const logicalIndex = (position - 1 + projects.length) % projects.length;
  const current = projects[logicalIndex];
  const canPlay =
    !reducedMotion &&
    !moving &&
    animate &&
    !userPaused &&
    !interacting &&
    inView &&
    visible;
  const format = (value: number) =>
    new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 }).format(value);
  function move(direction: number) {
    if (moving || !animate) return;
    if (reducedMotion) {
      setPosition(
        ((logicalIndex + direction + projects.length) % projects.length) + 1,
      );
      return;
    }
    setMoving(true);
    setPosition((previous) => previous + direction);
  }
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 },
    );
    if (regionRef.current) observer.observe(regionRef.current);
    const change = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", change);
      frameRef.current.forEach(cancelAnimationFrame);
    };
  }, []);
  useEffect(() => {
    if (!canPlay || moving) return;
    const timer = window.setTimeout(() => move(1), DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [canPlay, position, moving]);
  useEffect(() => {
    if (!reducedMotion) return;
    setPosition(
      (previous) => ((previous - 1 + projects.length) % projects.length) + 1,
    );
    setMoving(false);
  }, [reducedMotion]);
  function settle() {
    setMoving(false);
    if (position !== 0 && position !== projects.length + 1) return;
    setAnimate(false);
    setPosition(position === 0 ? projects.length : 1);
    frameRef.current.forEach(cancelAnimationFrame);
    frameRef.current = [
      requestAnimationFrame(() => {
        frameRef.current = [requestAnimationFrame(() => setAnimate(true))];
      }),
    ];
  }
  return (
    <>
      <section
        ref={regionRef}
        className="project-carousel"
        style={
          {
            "--zoom-play-state": canPlay ? "running" : "paused",
          } as CSSProperties
        }
        aria-label={t("carousel.label")}
        aria-roledescription={t("carousel.label")}
        onFocusCapture={(event) => {
          if (!(event.target as HTMLElement).closest(".carousel-play"))
            setUserPaused(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            setUserPaused(true);
            move(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            setUserPaused(true);
            move(1);
          }
        }}
      >
        <div
          className="carousel-viewport"
          onPointerDown={(event) => {
            if (event.pointerType === "touch")
              pointerStart.current = event.clientX;
          }}
          onPointerCancel={() => {
            pointerStart.current = null;
          }}
          onPointerUp={(event) => {
            if (
              pointerStart.current !== null &&
              Math.abs(event.clientX - pointerStart.current) > 45
            ) {
              suppressClick.current = true;
              setUserPaused(true);
              move(event.clientX < pointerStart.current ? 1 : -1);
            }
            pointerStart.current = null;
          }}
          onClickCapture={(event) => {
            if (suppressClick.current) {
              event.preventDefault();
              event.stopPropagation();
              suppressClick.current = false;
            }
          }}
        >
          <div
            className={`carousel-track ${animate && !reducedMotion ? "carousel-track--animated" : ""}`}
            style={{ "--slide-position": position } as CSSProperties}
            onTransitionEnd={(event) => {
              if (
                event.target === event.currentTarget &&
                event.propertyName === "transform"
              )
                settle();
            }}
          >
            {slides.map((project, index) => {
              const active = index === position;
              return (
                <article
                  key={`${project.id}-${index}`}
                  className={`carousel-slide ${active ? "carousel-slide--active" : ""}`}
                  aria-hidden={!active}
                  inert={!active}
                >
                  <a
                    className="carousel-image-link"
                    href={`/portfolio?project=${project.id}`}
                    tabIndex={active ? 0 : -1}
                  >
                    <img
                      key={`${project.id}-${active}`}
                      className="carousel-photo"
                      src={`/images/${project.image}.webp`}
                      alt={active ? t(`project.${project.id}` as Key) : ""}
                      width="1200"
                      height="600"
                      loading={
                        index <= 2 || index === slides.length - 1
                          ? "eager"
                          : "lazy"
                      }
                      draggable={false}
                    />
                  </a>
                  <a
                    href={`/portfolio?project=${project.id}`}
                    className="carousel-caption"
                    onMouseEnter={() => setInteracting(true)}
                    onMouseLeave={() => setInteracting(false)}
                    tabIndex={active ? 0 : -1}
                  >
                    <span className="carousel-kicker">
                      {project.city} <span aria-hidden="true">/</span>{" "}
                      {t(`service.${project.service}`)}
                    </span>
                    <h2>
                      {t(`project.${project.id}` as Key).split(/\s[—–]\s/)[0]}
                    </h2>
                    <p>{t(projectDescriptionKey(project))}</p>
                  </a>
                </article>
              );
            })}
          </div>
          <button
            type="button"
            className="carousel-arrow carousel-arrow--previous"
            aria-label={t("carousel.previous")}
            disabled={moving || !animate}
            onClick={() => move(-1)}
          >
            <ArrowLeft size={23} strokeWidth={1.4} />
          </button>
          <button
            type="button"
            className="carousel-arrow carousel-arrow--next"
            aria-label={t("carousel.next")}
            disabled={moving || !animate}
            onClick={() => move(1)}
          >
            <ArrowRight size={23} strokeWidth={1.4} />
          </button>
        </div>
        <div className="carousel-footer">
          <span
            className="carousel-position"
            aria-live={userPaused || reducedMotion ? "polite" : "off"}
            aria-atomic="true"
          >
            {format(logicalIndex + 1)} <span>/ {format(projects.length)}</span>
            <span className="sr-only">
              {" "}
              · {t(`project.${current.id}` as Key)}
            </span>
          </span>
          <div className="carousel-dots">
            {projects.map((project, index) => (
              <button
                key={project.id}
                type="button"
                aria-label={`${t("carousel.goto")}: ${t(`project.${project.id}` as Key)}`}
                aria-current={index === logicalIndex ? "true" : undefined}
                disabled={moving || !animate}
                onClick={() => {
                  if (!moving && animate) setPosition(index + 1);
                }}
              >
                <span />
              </button>
            ))}
          </div>
          {!reducedMotion && (
            <button
              type="button"
              className="carousel-play"
              aria-label={t(userPaused ? "carousel.play" : "carousel.pause")}
              onClick={() => setUserPaused(!userPaused)}
            >
              {userPaused ? <Play size={15} /> : <Pause size={15} />}
            </button>
          )}
        </div>
      </section>
    </>
  );
}
