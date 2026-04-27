import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, GitFork, Network, Building2, SearchCode, History, Eraser } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BinaryTab } from "@/components/app/rede/BinaryTab";
import { UnilevelTab } from "@/components/app/rede/UnilevelTab";
import { qualificationConfig } from "@/components/app/rede/mock-data";

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

/** Normalize string for accent-insensitive search */
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

type RedeView = "binario" | "unilevel" | "";

const RECENT_KEY = "internal-rede-recent-ids";
const MAX_RECENT = 5;

export default function InternalRede() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FranchiseDirectoryEntry | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [view, setView] = useState<RedeView>("");
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, MAX_RECENT) : [];
    } catch {
      return [];
    }
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return FRANCHISE_DIRECTORY.filter(
      (f) =>
        normalize(f.franchiseId).includes(q) ||
        normalize(f.name).includes(q),
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

  // Persist recent IDs
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds));
    } catch {
      /* ignore */
    }
  }, [recentIds]);

  function pushRecent(id: string) {
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_RECENT);
      return next;
    });
  }

  function selectFranchise(entry: FranchiseDirectoryEntry, keepView = false) {
    setSelected(entry);
    setQuery(`${entry.franchiseId} - ${entry.name}`);
    setShowDropdown(false);
    if (!keepView) setView("");
    pushRecent(entry.franchiseId);
  }

  function selectRecent(id: string) {
    const entry = FRANCHISE_DIRECTORY.find((f) => f.franchiseId === id);
    if (!entry) return;
    // Keep current toggle view when picking from recents
    selectFranchise(entry, true);
  }

  function clearRecents() {
    setRecentIds([]);
  }

  function clearSelection() {
    setSelected(null);
    setQuery("");
    setView("");
    setShowDropdown(false);
    // Refocus input so user can start typing immediately
    requestAnimationFrame(() => inputRef.current?.focus());
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

      {/* Search + Summary in two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                ref={inputRef}
                value={query}
                readOnly={!!selected}
                onChange={(e) => {
                  if (selected) return;
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (!selected) setShowDropdown(true);
                }}
                onClick={(e) => {
                  if (selected) {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
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
              {!selected && showDropdown && results.length > 0 && (
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
              {!selected && showDropdown && query.trim() && results.length === 0 && (
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
      </div>

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
        <span className="shrink-0">Rede da Franquia</span>
      </legend>

      <div className="space-y-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Franquia</Label>
          <p className="text-sm font-semibold text-foreground truncate">
            <span className="font-mono tabular-nums">{entry.franchiseId}</span>
            <span className="text-muted-foreground"> - </span>
            <span>{entry.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tipo da Franquia</Label>
            <p className="text-sm font-semibold text-foreground truncate">{entry.planLabel}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Qualificação Atual</Label>
            <p className="text-sm font-semibold truncate flex items-center gap-1.5" style={{ color: q.color }}>
              <span aria-hidden>{q.icon}</span>
              <span className="truncate">{q.label}</span>
            </p>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
