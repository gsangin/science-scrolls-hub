import { Atom, FlaskConical, Dna, Calculator } from "lucide-react";

export interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  resourceCount: number;
}

export const subjects: Subject[] = [
  { id: "physics", name: "Physics", icon: <Atom className="w-6 h-6" />, color: "from-blue-500/20 to-blue-600/10", resourceCount: 0 },
  { id: "chemistry", name: "Chemistry", icon: <FlaskConical className="w-6 h-6" />, color: "from-emerald-500/20 to-emerald-600/10", resourceCount: 0 },
  { id: "biology", name: "Biology", icon: <Dna className="w-6 h-6" />, color: "from-rose-500/20 to-rose-600/10", resourceCount: 0 },
  { id: "mathematics", name: "Mathematics", icon: <Calculator className="w-6 h-6" />, color: "from-amber-500/20 to-amber-600/10", resourceCount: 0 },
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
}
