import { useEffect, useState } from "react";
import { useI18n, stored, persist } from "../i18n/I18n";
export function ContrastToggle() {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(
    () => stored("concret.contrast") === "true",
  );
  useEffect(() => {
    document.documentElement.dataset.contrast = String(enabled);
    persist("concret.contrast", String(enabled));
  }, [enabled]);
  return (
    <button
      className="contrast-preference"
      type="button"
      aria-pressed={enabled}
      onClick={() => setEnabled(!enabled)}
    >
      {t("contrast")}
    </button>
  );
}
