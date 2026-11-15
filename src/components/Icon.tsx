import {
  Layers,
  Waves,
  PanelsTopLeft,
  Paintbrush,
  AlignVerticalJustifyCenter,
  ClipboardList,
  Calculator,
  Check,
  ShieldCheck,
} from "lucide-react";
const icons = {
  layers: Layers,
  lines: AlignVerticalJustifyCenter,
  trowel: Paintbrush,
  waves: Waves,
  grid: PanelsTopLeft,
  visit: ClipboardList,
  quote: Calculator,
  work: Layers,
  delivery: Check,
  warranty: ShieldCheck,
};
export function Icon({ name }: { name: string }) {
  const Component = icons[name as keyof typeof icons] ?? Layers;
  return <Component aria-hidden="true" strokeWidth={1.35} />;
}
