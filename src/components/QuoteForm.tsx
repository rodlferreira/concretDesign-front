import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { useI18n, type Key } from "../i18n/I18n";
import { services } from "../lib/projects";
export function QuoteForm() {
  const { locale, t } = useI18n();
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error" | "rate"
  >("idle");
  const [reference, setReference] = useState("");
  const request = useRef<{ body: string; key: string } | null>(null);
  const pending = useRef(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setStatus("sending");
    const form = e.currentTarget;
    const fields = new FormData(form);
    const body = JSON.stringify({
      ...Object.fromEntries(fields),
      consent: fields.get("consent") === "on",
      locale,
    });
    if (request.current?.body !== body)
      request.current = { body, key: crypto.randomUUID() };
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": request.current!.key,
        },
        body,
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        setStatus(response.status === 429 ? "rate" : "error");
        return;
      }
      const result = await response.json();
      setReference(result.reference);
      setStatus("sent");
      form.reset();
      request.current = null;
    } catch {
      setStatus("error");
    } finally {
      pending.current = false;
    }
  }
  const fields = [
    ["name", "text", "name", 100],
    ["company", "text", "organization", 150],
    ["email", "email", "email", 254],
    ["phone", "tel", "tel", 30],
    ["location", "text", "address-level2", 150],
  ] as const;
  return (
    <form className="quote-form" onSubmit={submit} aria-label={t("quote")}>
      <p className="required-note">{t("form.required")}</p>
      <div className="form-grid">
        {fields.map(([name, type, auto, max]) => (
          <label key={name}>
            {t(`form.${name}` as Key)}
            {name !== "phone" ? " *" : ""}
            <input
              name={name}
              type={type}
              autoComplete={auto}
              required={name !== "phone"}
              minLength={name !== "email" && name !== "phone" ? 2 : undefined}
              maxLength={max}
            />
          </label>
        ))}
        <label>
          {t("form.service")} *
          <select name="service" required defaultValue="">
            <option value="" disabled>
              {t("form.select")}
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {t(`service.${s.id}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        {t("form.message")}
        <textarea name="message" rows={3} maxLength={2000} />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          {t("form.consent")} <a href="/privacy">{t("privacy")}</a>
        </span>
      </label>
      <button className="button" type="submit" disabled={status === "sending"}>
        {status === "sending" ? t("form.sending") : t("quote")}
        {status === "sending" ? (
          <LoaderCircle className="spin" size={18} />
        ) : (
          <ArrowRight size={18} />
        )}
      </button>
      <div role="status" aria-live="polite" className={`form-status ${status}`}>
        {status === "sent" && (
          <>
            <CheckCircle2 size={20} />
            <p>
              {t("form.success")} <strong>{reference}</strong>
            </p>
          </>
        )}
        {status === "error" && t("form.error")}
        {status === "rate" && t("form.rate")}
      </div>
    </form>
  );
}
