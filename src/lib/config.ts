function httpsUrl(value: string | undefined) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export const brochureUrl = httpsUrl(import.meta.env.VITE_BROCHURE_URL);
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
