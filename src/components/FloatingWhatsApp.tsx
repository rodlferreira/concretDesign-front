import { WhatsappLogoIcon } from "@phosphor-icons/react/dist/csr/WhatsappLogo";
import { useI18n } from "../i18n/I18n";
import { whatsappUrl } from "../lib/config";

export function FloatingWhatsApp() {
  const { t } = useI18n();
  return (
    <div className="floating-whatsapp">
      <a
        className="floating-whatsapp-toggle"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("contact.whatsapp.open")}
        title={t("contact.whatsapp")}
      >
        <WhatsappLogoIcon size={30} weight="regular" aria-hidden="true" />
      </a>
    </div>
  );
}
