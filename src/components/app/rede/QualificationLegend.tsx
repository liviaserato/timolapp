import { qualificationConfig } from "./mock-data";

export function QualificationLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2 border-t">
      {Object.values(qualificationConfig).map((q) => (
        <span key={q.label} className="flex items-center gap-1">
          <span style={{ color: q.color }}>{q.icon}</span> {q.label}
        </span>
      ))}
    </div>
  );
}
