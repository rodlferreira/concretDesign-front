import { ArrowRight, FileDown, Mail, Phone, MessageCircle } from "lucide-react";
import { useI18n } from "../i18n/I18n";
import {
  contacts,
  generalEmail,
  brochureUrl,
  whatsappUrl,
} from "../lib/config";

export function Contact() {
  const { t } = useI18n();
  return (
    <section className="contact section-pad" id="contactos">
      <div className="contact-portfolio">
        <div className="brochure-heading">
          <a
            className="contact-whatsapp-qr"
            href="https://wa.me/351963445555"
            aria-label={`${t("contact.whatsapp.open")} — Emilly Prado`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/whatsapp-emilly-qr.svg"
              width="224"
              height="262"
              alt="QR — WhatsApp da Emilly Prado, +351 963 445 555"
            />
            <span>WhatsApp · Emilly Prado</span>
          </a>
          <div>
            <p className="eyebrow">{t("nav.portfolio")}</p>
            <h2>{t("brochure.title")}</h2>
          </div>
        </div>
        <p>{t("brochure.text")}</p>
        <a className="text-link" href="/portfolio">
          {t("portfolio.all")}
          <ArrowRight size={18} />
        </a>
        {brochureUrl ? (
          <a
            className="text-link"
            href={brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("brochure.download")}
            <FileDown size={18} />
          </a>
        ) : (
          <p className="muted">{t("brochure.pending")}</p>
        )}
        <a className="contact-email" href={`mailto:${generalEmail}`}>
          <Mail size={17} />
          {generalEmail}
        </a>
      </div>
      <div className="contact-form">
        <p className="eyebrow">{t("quote")}</p>
        <h2>{t("contact.title")}</h2>
        <p>{t("contact.text")}</p>
        <a className="button" href="/orcamento">
          {t("quote")}
          <ArrowRight size={18} />
        </a>
      </div>
      <aside className="contact-people">
        <MessageCircle className="whatsapp-icon" size={35} strokeWidth={1.4} />
        <h2>{t("contact.whatsapp")}</h2>
        <p>{t("contact.whatsapp.text")}</p>
        {contacts.map((person) => (
          <address key={person.name}>
            <strong>{person.name}</strong>
            <a href={`tel:+${person.digits}`}>
              <Phone size={14} />
              {person.phone}
            </a>
            <a href={`mailto:${person.email}`}>
              <Mail size={14} />
              {person.email}
            </a>
          </address>
        ))}
        <a
          className="button outline whatsapp-button"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("contact.whatsapp.open")}
          <ArrowRight size={16} />
        </a>
      </aside>
    </section>
  );
}
