import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import pt from "./pt-PT.json";
import languages from "./languages.json";
export { languages };
export type Key = keyof typeof pt;
type Catalog = Record<Key, string>;
const loaders = import.meta.glob<Catalog>(
  ["./*.json", "!./pt-PT.json", "!./languages.json"],
  { import: "default" },
);
const Context = createContext({
  locale: "pt-PT",
  t: (key: Key): string => pt[key],
  change: async (_code: string) => {},
  loading: false,
});
export function stored(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Preferences remain usable without storage. */
  }
}
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState("pt-PT");
  const [catalog, setCatalog] = useState<Catalog>(pt);
  const [loading, setLoading] = useState(false);
  async function change(code: string) {
    if (!languages.some((l) => l.code === code)) return;
    setLoading(true);
    try {
      const next = code === "pt-PT" ? pt : await loaders[`./${code}.json`]();
      setCatalog(next);
      setLocale(code);
      persist("concret.locale", code);
      document.documentElement.lang = code;
      document.documentElement.dir = "ltr";
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const code = stored("concret.locale");
    if (code) void change(code);
  }, []);
  const t = (key: Key) => catalog[key];
  useEffect(() => {
    document.title = t("seo.title");
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t("seo.description"));
  }, [catalog]);
  return (
    <Context.Provider value={{ locale, t, change, loading }}>
      {children}
    </Context.Provider>
  );
}
export const useI18n = () => useContext(Context);
