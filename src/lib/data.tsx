import type { ElementType } from "react";
import { Atom, FlaskConical, Dna, Calculator } from "lucide-react";

export interface Subject {
  id: string;
  name: string;
  icon: ElementType;
  color: string;
  resourceCount: number;
}

export const classLevelOptions = [
  { value: "12", label: "Class 12" },
  { value: "11", label: "Class 11" },
  { value: "diploma-1", label: "Eng. I" },
  { value: "diploma-2", label: "Eng. II" },
];

export const physicsPortions = [
  { value: "mechanics", label: "Mechanics" },
  { value: "heat-thermodynamics", label: "Heat and Thermodynamics" },
  { value: "wave-optics", label: "Wave and Optics" },
  { value: "electricity-magnetism", label: "Electricity and Magnetism" },
  { value: "modern-physics", label: "Modern Physics" },
];

export const chemistryPortions = [
  { value: "physical", label: "Physical" },
  { value: "inorganic", label: "Inorganic" },
  { value: "organic", label: "Organic" },
  { value: "applied", label: "Applied" },
];

export const subjects: Subject[] = [
  { id: "physics", name: "Physics", icon: Atom, color: "from-blue-500/20 to-blue-600/10", resourceCount: 0 },
  { id: "chemistry", name: "Chemistry", icon: FlaskConical, color: "from-emerald-500/20 to-emerald-600/10", resourceCount: 0 },
  { id: "biology", name: "Biology", icon: Dna, color: "from-rose-500/20 to-rose-600/10", resourceCount: 0 },
  { id: "mathematics", name: "Mathematics", icon: Calculator, color: "from-amber-500/20 to-amber-600/10", resourceCount: 0 },
];

export interface Resource {
  id: string;
  title: string;
  subject: string;
  class_level: string;
  type: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
  user_id: string;
  portion: string | null;
  downloadable: boolean;
}
