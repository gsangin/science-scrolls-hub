import { type Subject } from "@/lib/data";

interface SubjectCardProps {
  subject: Subject;
  isSelected: boolean;
  onClick: () => void;
}

const SubjectCard = ({ subject, isSelected, onClick }: SubjectCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-2 sm:gap-3 rounded-xl border p-4 sm:p-6 text-center transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] ${
        isSelected
          ? "border-primary bg-primary/5 shadow-[var(--shadow-card)]"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <div className={`flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br ${subject.color} text-foreground transition-transform group-hover:scale-110`}>
        {subject.icon}
      </div>
      <span className="font-heading text-sm sm:text-lg font-semibold text-card-foreground">
        {subject.name}
      </span>
      <span className="text-xs sm:text-sm text-muted-foreground">
        {subject.resourceCount} resources
      </span>
    </button>
  );
};

export default SubjectCard;
