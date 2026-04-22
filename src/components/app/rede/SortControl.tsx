import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SortField = "status" | "points" | "qualification" | "date" | "name";
export type SortDir = "neutral" | "asc" | "desc";

/** Internal legacy mode used by sort utilities and UnilevelOrgChart */
export type LegacySortMode =
  | "default"
  | "points"
  | "date_newest"
  | "date_oldest"
  | "status"
  | "qualification"
  | "name_asc"
  | "name_desc"
  | "points_asc"
  | "qualification_asc"
  | "status_inactive_first";

export const SORT_FIELD_OPTIONS: { value: SortField; label: string }[] = [
  { value: "status", label: "Status" },
  { value: "points", label: "Pontuação" },
  { value: "qualification", label: "Qualificação" },
  { value: "date", label: "Data de cadastro" },
  { value: "name", label: "Nome" },
];

/**
 * Map (field, dir) -> legacy SortMode consumed by sortMembers / UnilevelOrgChart.
 * `neutral` direction means "default" sorting.
 */
export function toLegacySortMode(field: SortField | "", dir: SortDir): LegacySortMode {
  if (!field || dir === "neutral") return "default";

  switch (field) {
    case "points":
      return dir === "desc" ? "points" : "points_asc";
    case "date":
      return dir === "desc" ? "date_newest" : "date_oldest";
    case "qualification":
      return dir === "desc" ? "qualification" : "qualification_asc";
    case "status":
      return dir === "desc" ? "status" : "status_inactive_first";
    case "name":
      return dir === "asc" ? "name_asc" : "name_desc";
    default:
      return "default";
  }
}

/** Tooltip describing what the direction button will do for the current field */
export function getDirectionTooltip(field: SortField | "", dir: SortDir): string {
  if (!field) return "Selecione um campo para classificar";

  const mapDesc: Record<SortField, string> = {
    points: "Maior → Menor",
    date: "Mais recentes → Mais antigos",
    qualification: "Maior → Menor",
    status: "Ativos primeiro",
    name: "Z → A",
  };
  const mapAsc: Record<SortField, string> = {
    points: "Menor → Maior",
    date: "Mais antigos → Mais recentes",
    qualification: "Menor → Maior",
    status: "Inativos primeiro",
    name: "A → Z",
  };

  if (dir === "neutral") return "Classificação padrão";
  if (dir === "asc") return mapAsc[field];
  return mapDesc[field];
}

interface SortControlProps {
  field: SortField | "";
  dir: SortDir;
  onFieldChange: (field: SortField) => void;
  onDirChange: (dir: SortDir) => void;
  className?: string;
  triggerClassName?: string;
  /** Width of the select trigger, e.g. "w-[140px]" */
  width?: string;
}

/**
 * Generic sort control: direction button + field dropdown.
 * Mirrors the pattern used in /internal/produtos.
 */
export function SortControl({
  field,
  dir,
  onFieldChange,
  onDirChange,
  className,
  triggerClassName,
  width = "w-[150px]",
}: SortControlProps) {
  const cycleDir = () => {
    onDirChange(dir === "neutral" ? "desc" : dir === "desc" ? "asc" : "desc");
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 rounded-r-none border-r-0"
        onClick={cycleDir}
        title={getDirectionTooltip(field, dir)}
        disabled={!field}
      >
        {dir === "neutral" ? (
          <ArrowUpDown className="h-3.5 w-3.5" />
        ) : dir === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )}
      </Button>
      <Select value={field || undefined} onValueChange={(v) => onFieldChange(v as SortField)}>
        <SelectTrigger
          className={cn(
            "h-8 text-[11px] rounded-l-none",
            width,
            triggerClassName,
          )}
        >
          <SelectValue placeholder="Classificar" />
        </SelectTrigger>
        <SelectContent>
          {SORT_FIELD_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
