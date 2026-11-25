import { SunIcon } from "@phosphor-icons/react/dist/csr/Sun";
import { MoonIcon } from "@phosphor-icons/react/dist/csr/Moon";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, Search } from "lucide-react";
import { languages, persist, stored, useI18n } from "../i18n/I18n";
export function Header({ overlay = false }: { overlay?: boolean }) {
  const { locale, t, change, loading } = useI18n();
  const [menu, setMenu] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(() => stored("concret.theme") ?? "dark");
  const languageRef = useRef<HTMLDivElement>(null);
  const langButton = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    persist("concret.theme", theme);
  }, [theme]);
  useEffect(() => {
    if (langOpen) searchRef.current?.focus();
  }, [langOpen]);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!languageRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (langOpen) {
          setLangOpen(false);
          langButton.current?.focus();
        }
        if (menu) {
          setMenu(false);
          menuButton.current?.focus();
        }
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
    };
  }, [langOpen, menu]);
  const current = languages.find((l) => l.code === locale)!;
  const links = [
    ["home", "/"],
    ["services", "/#servicos"],
    ["portfolio", "/portfolio"],
    ["training", "/formacoes"],
    ["about", "/#sobre"],
    ["contact", "/#contactos"],
  ];
  return (
    <>
      <a className="skip" href="#conteudo">
        {t("skip")}
      </a>
      <header className={overlay ? "header header--overlay" : "header"}>
        <a className="brand" href="/" aria-label="ConcretDesign">
          <img
            className="brand-symbol"
            src="/images/brand-symbol.svg"
            width="92"
            height="92"
            alt=""
          />
          <span className="brand-copy" aria-hidden="true">
            <span className="brand-name">
              CONCRET<span>DESIGN</span>
            </span>
            <span className="brand-tagline">REVESTIMENTOS DECORATIVOS</span>
          </span>
        </a>
        <nav
          className={menu ? "navigation is-open" : "navigation"}
          aria-label={t("menu")}
          id="navigation"
        >
          {links.map(([key, url]) => (
            <a key={key} href={url} onClick={() => setMenu(false)}>
              {t(`nav.${key}` as Parameters<typeof t>[0])}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="theme-toggle"
            type="button"
            role="switch"
            aria-checked={theme === "light"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={t("theme")}
            title={t("theme")}
            data-state={theme}
          >
            <span className="theme-track" aria-hidden="true">
              <MoonIcon size={15} weight="light" />
              <SunIcon size={15} weight="light" />
              <span className="theme-thumb">
                {theme === "light" ? (
                  <SunIcon size={15} weight="duotone" />
                ) : (
                  <MoonIcon size={15} weight="duotone" />
                )}
              </span>
            </span>
          </button>
          <div className="language" ref={languageRef}>
            <button
              ref={langButton}
              className="language-toggle"
              type="button"
              aria-label={t("language")}
              aria-expanded={langOpen}
              aria-controls="languages"
              onClick={() => setLangOpen(!langOpen)}
            >
              <img
                className="language-flag"
                src={current.flagImage}
                alt=""
                width="24"
                height="18"
              />
              <span className="locale-code">
                {locale.split("-")[0].toUpperCase()}
              </span>
              <ChevronDown size={12} />
            </button>
            {langOpen && (
              <div className="language-panel" id="languages">
                <label className="language-search">
                  <Search size={16} />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("language.search")}
                    aria-label={t("language.search")}
                  />
                </label>
                <div className="language-grid">
                  {languages
                    .filter((l) =>
                      (l.name + " " + l.code)
                        .toLocaleLowerCase()
                        .includes(query.toLocaleLowerCase()),
                    )
                    .map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        lang={l.code}
                        aria-label={l.name}
                        title={l.name}
                        aria-pressed={locale === l.code}
                        disabled={loading}
                        onClick={async () => {
                          await change(l.code);
                          setLangOpen(false);
                          setQuery("");
                          langButton.current?.focus();
                        }}
                      >
                        <img
                          className="language-flag"
                          src={l.flagImage}
                          alt=""
                          width="28"
                          height="21"
                          loading="lazy"
                        />
                        <span>{l.name}</span>
                      </button>
                    ))}
                </div>
                {!languages.some((l) =>
                  (l.name + " " + l.code)
                    .toLocaleLowerCase()
                    .includes(query.toLocaleLowerCase()),
                ) && <p>{t("language.empty")}</p>}
              </div>
            )}
          </div>
          <a className="button header-quote" href="/orcamento">
            {t("quote")}
          </a>
          <button
            ref={menuButton}
            className="icon-button menu-toggle"
            aria-label={menu ? t("close") : t("menu")}
            aria-expanded={menu}
            aria-controls="navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}
