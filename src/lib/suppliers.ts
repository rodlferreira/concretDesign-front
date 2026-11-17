export type Supplier = {
  name: string;
  website: string;
  logo: string;
  logoBackground?: "dark";
};

// Original assets from the official sites supplied by the client.
// Source URLs are recorded in public/images/suppliers/sources.json.
export const suppliers: Supplier[] = [
  {
    name: "Gordillos Cal de Morón",
    website: "https://www.gordilloscaldemoron.com/",
    logo: "/images/suppliers/gordillos.png",
  },
  {
    name: "Colorificio Veneziano",
    website: "https://www.colorificioveneziano.com/",
    logo: "/images/suppliers/veneziano.png",
    logoBackground: "dark",
  },
  {
    name: "Lissonia",
    website: "https://www.lissonia.pt/",
    logo: "/images/suppliers/lissonia-display.svg",
    logoBackground: "dark",
  },
  {
    name: "Ecomateria",
    website: "https://ecomateria.pt/",
    logo: "/images/suppliers/ecomateria.jpg",
  },
  {
    name: "Diasen Ibérica",
    website: "https://diaseniberica.pt/",
    logo: "/images/suppliers/diasen.png",
  },
];
