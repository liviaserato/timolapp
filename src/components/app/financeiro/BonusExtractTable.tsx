import { useState, useMemo, useRef } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CurrencyConfig, formatCurrencySplit } from "./currency-helpers";
import { BonusExtractRow, movementTypes, qualificationLabels } from "./mock-data";

interface Props {
  data: BonusExtractRow[];
  currency: CurrencyConfig;
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function getMonthRange(date: Date): { from: string; to: string } {
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  return {
    from: first.toISOString().slice(0, 10),
    to: last.toISOString().slice(0, 10),
  };
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

export function BonusExtractTable({ data, currency }: Props) {
  const [filterMode, setFilterMode] = useState<"month" | "custom">("month");
  const [monthRef, setMonthRef] = useState(new Date());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [searchId, setSearchId] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  function toggleType(type: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  function prevMonth() {
    setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.select();
    }
  }

  const filtered = useMemo(() => {
    let from: string, to: string;
    if (filterMode === "month") {
      const range = getMonthRange(monthRef);
      from = range.from;
      to = range.to;
    } else {
      from = dateFrom;
      to = dateTo;
    }

    return data.filter((row) => {
      if (from && row.date < from) return false;
      if (to && row.date > to) return false;
      if (selectedTypes.size > 0 && !selectedTypes.has(row.type)) return false;
      if (searchId && !row.id.includes(searchId) && !row.orderNumber.includes(searchId)) return false;
      return true;
    });
  }, [data, filterMode, monthRef, dateFrom, dateTo, selectedTypes, searchId]);

  return (
    <div className="space-y-3">
      {/* Filter row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex rounded-md border border-app-card-border overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => setFilterMode("month")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors min-w-[52px] text-center ${
                filterMode === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Mês
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("custom")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors min-w-[52px] text-center ${
                filterMode === "custom" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Período
            </button>
          </div>

          {filterMode === "month" ? (
            <div className="flex items-center gap-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium min-w-[120px] text-center">
                {getMonthLabel(monthRef)}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 items-center flex-1">
              <Input type="date" className="h-8 flex-1 text-xs" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <span className="text-xs text-muted-foreground">até</span>
              <Input type="date" className="h-8 flex-1 text-xs" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          )}
        </div>

        {/* Search field */}
        <div className="relative w-full sm:w-48 sm:shrink-0">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder="Buscar ID ou Pedido"
            className="h-8 pl-7 pr-7 text-xs"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchId && (
            <button
              type="button"
              onClick={() => { setSearchId(""); searchRef.current?.focus(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {movementTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => toggleType(type)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors ${
              selectedTypes.has(type)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-app-card-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border border-app-card-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-app-table-header">
              <TableHead className="text-xs px-2 py-1.5 hidden sm:table-cell">Data</TableHead>
              <TableHead className="text-xs px-2 py-1.5 text-left">Pedido</TableHead>
              <TableHead className="text-xs px-2 py-1.5 text-right">ID</TableHead>
              <TableHead className="text-xs px-2 py-1.5 text-center">Tipo</TableHead>
              <TableHead className="text-xs px-2 py-1.5 text-right">Pts</TableHead>
              <TableHead className="text-xs px-2 py-1.5 text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                  Nenhuma movimentação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row, i) => {
                const q = qualificationLabels[row.qualification];
                const { symbol, number: numStr } = formatCurrencySplit(row.value, currency);
                return (
                  <TableRow key={i}>
                    {/* Desktop: separate date cell */}
                    <TableCell className="text-xs whitespace-nowrap px-2 py-1 hidden sm:table-cell">
                      {formatShortDate(row.date)}
                    </TableCell>
                    {/* Order + date on mobile, icon before order */}
                    <TableCell className="text-xs font-mono px-2 py-1 text-left">
                      <span className="flex items-center gap-1">
                        {q && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-default text-xs leading-none" aria-label={q.label}>{q.icon}</span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">{q.label}</TooltipContent>
                          </Tooltip>
                        )}
                        <span>
                          {row.orderNumber}
                          <span className="block sm:hidden text-[10px] text-muted-foreground font-normal">
                            {formatShortDate(row.date)}
                          </span>
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono px-2 py-1 text-right">{row.id}</TableCell>
                    <TableCell className="text-xs px-2 py-1 text-center">{row.type}</TableCell>
                    <TableCell className="text-xs text-right px-2 py-1">{row.points ?? "—"}</TableCell>
                    <TableCell className={`text-xs text-right font-medium px-2 py-1 ${row.value < 0 ? "text-negative" : ""}`}>
                      <span className="inline-flex items-baseline justify-end gap-0.5 w-full">
                        <span className="text-[10px] font-normal">{symbol}</span>
                        <span>{numStr}</span>
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <div className="space-y-3 -mt-1">
        <p className="text-[10px] text-muted-foreground leading-tight">
          *O cálculo dos ganhos do Unilevel é baseado na sua qualificação atual. O ícone corresponde à sua qualificação no momento do pedido.
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {Object.entries(qualificationLabels).map(([key, q]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="text-[11px]">{q.icon}</span> {q.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
