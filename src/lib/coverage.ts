import map from "../data/portugal-mainland.json";
import { projects } from "./projects";

export const coverageAreas = [
  {
    id: "norte",
    name: "Norte",
    shortName: "Norte",
    cities: ["Porto", "Braga"],
    districts: ["PT-03", "PT-13"],
    coordinates: [-8.55, 41.34],
  },
  {
    id: "lisboa",
    name: "Lisboa e Vale do Tejo",
    shortName: "Lisboa",
    cities: ["Lisboa", "Cascais"],
    districts: ["PT-11"],
    coordinates: [-9.14, 38.73],
  },
  {
    id: "algarve",
    name: "Algarve",
    shortName: "Algarve",
    cities: ["Algarve"],
    districts: ["PT-08"],
    coordinates: [-7.93, 37.04],
  },
]
  .map((area) => ({
    ...area,
    projects: projects.filter((project) => area.cities.includes(project.city)),
  }))
  .filter((area) => area.projects.length > 0);

export function projectMapPoint(coordinates: number[]) {
  const p = map.projection;
  return {
    x: p.offsetX + (coordinates[0] - p.minLon) * p.cos * p.scale,
    y: p.offsetY + (p.maxLat - coordinates[1]) * p.scale,
  };
}
