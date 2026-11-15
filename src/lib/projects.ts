export const services = [
  { id: "micro", icon: "layers" },
  { id: "marmorino", icon: "lines" },
  { id: "render", icon: "trowel" },
  { id: "mass", icon: "waves" },
  { id: "finish", icon: "grid" },
] as const;
export type Service = (typeof services)[number]["id"];
export type Project = {
  id: string;
  city: string;
  category: "hotel" | "home" | "retail" | "corporate";
  service: Service;
  image: string;
};
export const projects: Project[] = [
  {
    id: "hotel",
    city: "Lisboa",
    category: "hotel",
    service: "micro",
    image: "hotel",
  },
  {
    id: "living",
    city: "Cascais",
    category: "home",
    service: "marmorino",
    image: "living",
  },
  {
    id: "retail",
    city: "Porto",
    category: "retail",
    service: "finish",
    image: "retail",
  },
  {
    id: "hall",
    city: "Braga",
    category: "corporate",
    service: "render",
    image: "hall",
  },
  {
    id: "apartment",
    city: "Lisboa",
    category: "home",
    service: "micro",
    image: "apartment",
  },
  {
    id: "restaurant",
    city: "Porto",
    category: "retail",
    service: "mass",
    image: "restaurant",
  },
  {
    id: "house",
    city: "Algarve",
    category: "home",
    service: "marmorino",
    image: "house",
  },
];
