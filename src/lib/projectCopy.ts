import type { Key } from "../i18n/I18n";
import type { Project } from "./projects";

export function projectDescriptionKey(project: Project): Key {
  const descriptions: Record<string, Key> = {
    hotel: "project.hotel.text",
    living: "project.living.text",
    retail: "project.retail.text",
    hall: "project.hall.text",
  };
  return descriptions[project.id] ?? `service.${project.service}.text`;
}
