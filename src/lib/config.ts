function httpsUrl(value: string | undefined) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export const brochureUrl =
  httpsUrl(import.meta.env.VITE_BROCHURE_URL) ||
  "/documents/concretdesign-portfolio.pdf";
export const contacts = [
  {
    name: "Emilly Prado",
    phone: "+351 963 445 555",
    digits: "351963445555",
    email: "emillyprado@concretdesign.pt",
  },
  {
    name: "Alexandre Prado",
    phone: "+351 963 444 880",
    digits: "351963444880",
    email: "alexandreprado@concretdesign.pt",
  },
];
export const generalEmail = "geral@concretdesign.pt";

// Until the company number is available, route WhatsApp to Emilly.
const configuredWhatsAppNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.trim();
export const whatsappNumber =
  configuredWhatsAppNumber && /^[1-9]\d{7,14}$/.test(configuredWhatsAppNumber)
    ? configuredWhatsAppNumber
    : contacts[0].digits;
export const whatsappUrl = `https://wa.me/${whatsappNumber}`;
