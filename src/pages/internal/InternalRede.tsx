import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, GitFork, Network, Building2, User, Award, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BinaryTab } from "@/components/app/rede/BinaryTab";
import { UnilevelTab } from "@/components/app/rede/UnilevelTab";
import { qualificationConfig } from "@/components/app/rede/mock-data";
import { cn } from "@/lib/utils";

/* ── Mock franchise directory (Staff search) ── */
interface FranchiseDirectoryEntry {
  franchiseId: string;
  name: string;
  planLabel: string;
  qualification: string;
  sponsorId: string;
  sponsorName: string;
}

const FRANCHISE_DIRECTORY: FranchiseDirectoryEntry[] = [
  { franchiseId: "100231", name: "Lívia Serato", planLabel: "Ouro", qualification: "esmeralda", sponsorId: "99001", sponsorName: "Maria Silva" },
  { franchiseId: "100232", name: "Carlos Eduardo Mendes", planLabel: "Platina", qualification: "rubi", sponsorId: "100231", sponsorName: "Lívia Serato" },
  { franchiseId: "100233", name: "Ana Paula Costa", planLabel: "Bronze", qualification: "consultor", sponsorId: "100232", sponsorName: "Carlos Mendes" },
  { franchiseId: "100234", name: "Roberto Almeida Filho", planLabel: "Prata", qualification: "distribuidor", sponsorId: "100233", sponsorName: "Ana Costa" },
  { franchiseId: "100235", name: "Fernanda Oliveira Santos", planLabel: "Ouro", qualification: "lider", sponsorId: "100234", sponsorName: "Roberto Almeida" },
  { franchiseId: "100236", name: "Pedro Henrique Lima", planLabel: "Bronze", qualification: "consultor", sponsorId: "100235", sponsorName: "Fernanda Santos" },
  { franchiseId: "100237", name: "Maria Silva", planLabel: "Platina", qualification: "diamante", sponsorId: "00001", sponsorName: "Timol" },
  { franchiseId: "100238", name: "Juan García López", planLabel: "Ouro", qualification: "esmeralda", sponsorId: "99001", sponsorName: "Maria Silva" },
  { franchiseId: "100299", name: "Maria Silva", planLabel: "Ouro", qualification: "rubi", sponsorId: "100232", sponsorName: "Carlos Mendes" },
  { franchiseId: "200501", name: "Juliana Ferreira Costa", planLabel: "Ouro", qualification: "consultor", sponsorId: "100231", sponsorName: "Lívia Serato" },
  { franchiseId: "200502", name: "Ricardo Alves Santos", planLabel: "Platina", qualification: "consultor", sponsorId: "100232", sponsorName: "Carlos Mendes" },
  { franchiseId: "200587", name: "Lívia Serato", planLabel: "Prata", qualification: "distribuidor", sponsorId: "100231", sponsorName: "Lívia Serato" },
  { franchiseId: "300142", name: "Lívia Serato", planLabel: "Bronze", qualification: "consultor", sponsorId: "200587", sponsorName: "Lívia Serato" },
];

type RedeView = "binario" | "unilevel" | "";

export default function InternalRede() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FranchiseDirectoryEntry | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [view, setView] = useState<RedeView>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return FRANCHISE_DIRECTORY.filter(
      (f) =>
        f.franchiseId.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q),
    ).slice(0, 12);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectFranchise(entry: FranchiseDirectoryEntry) {
    setSelected(entry);
    setQuery(`${entry.franchiseId} - ${entry.name}`);
    setShowDropdown(false);
    setView("");
  }

  function clearSelection() {
    setSelected(null);
    setQuery("");
    setView("");
    setShowDropdown(false);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Rede</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Consulte e analise a estrutura e o desempenho da rede de qualquer franquia
        </p>
      </div>

      {/* Search card */}
      <fieldset className="relative rounded-[10px] border border-border bg-card p-4 shadow-sm">
        <legend className="flex items-center gap-2 px-1 text-base font-bold text-primary">
          <Search className="h-5 w-5 shrink-0" />
          <span className="shrink-0">Busca</span>
        </legend>

        <div className="space-y-1.5" ref={containerRef}>
          <Label className="text-xs text-muted-foreground">Franquia</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
                if (selected) setSelected(null);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Buscar por ID ou nome da franquia"
              className="pl-9 pr-9 h-9"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={clearSelection}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}

            {/* Autocomplete dropdown */}
            {showDropdown && results.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
                {results.map((entry) => (
                  <button
                    key={entry.franchiseId}
                    type="button"
                    onClick={() => selectFranchise(entry)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {entry.franchiseId}
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span className="font-medium truncate">{entry.name}</span>
                  </button>
                ))}
              </div>
            )}
            {showDropdown && query.trim() && results.length === 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 rounded-md border border-border bg-popover shadow-md">
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Nenhuma franquia encontrada
                </p>
              </div>
            )}
          </div>
        </div>
      </fieldset>

      {/* Summary card */}
      {selected && <FranchiseSummaryCard entry={selected} />}

      {/* Toggle group + content */}
      {selected && (
        <>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => setView((v as RedeView) || "")}
            className="grid grid-cols-2 gap-2 w-full"
          >
            <ToggleGroupItem
              value="binario"
              className="h-11 w-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-border rounded-md gap-2"
            >
              <GitFork className="h-4 w-4" />
              <span className="text-sm font-medium">Rede Binária</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="unilevel"
              className="h-11 w-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-border rounded-md gap-2"
            >
              <Network className="h-4 w-4" />
              <span className="text-sm font-medium">Rede Unilevel</span>
            </ToggleGroupItem>
          </ToggleGroup>

          {view === "binario" && <BinaryTab hideBonusCard />}
          {view === "unilevel" && <UnilevelTab searchQuery="" hideBonusCard />}
        </>
      )}
    </div>
  );
}

/* ── Franchise summary card ── */
function FranchiseSummaryCard({ entry }: { entry: FranchiseDirectoryEntry }) {
  const q = qualificationConfig[entry.qualification] ?? qualificationConfig.consultor;
  return (
    <fieldset className="relative rounded-[10px] border border-border bg-card p-4 shadow-sm">
      <legend className="flex items-center gap-2 px-1 text-base font-bold text-primary">
        <Building2 className="h-5 w-5 shrink-0" />
        <span className="shrink-0">Resumo da Franquia</span>
      </legend>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryItem icon={<Building2 className="h-4 w-4 text-primary" />} label="ID" value={entry.franchiseId} mono />
        <SummaryItem icon={<User className="h-4 w-4 text-primary" />} label="Nome" value={entry.name} />
        <SummaryItem icon={<Award className="h-4 w-4 text-primary" />} label="Tipo de franquia" value={entry.planLabel} />
        <SummaryItem
          icon={<span style={{ color: q.color }} className="text-base leading-none">{q.icon}</span>}
          label="Qualificação"
          value={q.label}
        />
        <SummaryItem
          icon={<Users className="h-4 w-4 text-primary" />}
          label="Patrocinador"
          value={`${entry.sponsorId} - ${entry.sponsorName}`}
        />
      </div>
    </fieldset>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1 min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase tracking-wide">
        {icon}
        <span>{label}</span>
      </div>
      <p className={cn("text-sm font-semibold text-foreground truncate", mono && "font-mono tabular-nums")}>
        {value}
      </p>
    </div>
  );
}
