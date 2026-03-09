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

const PAGE_SIZE = 30;

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

function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  const a = new Date(from);
  const b = new Date(to);
  return Math.ceil(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function BonusExtractTable({ data, currency }: Props) {
  const [filterMode, setFilterMode] = useState<"month" | "custom">("month");
  const [monthRef, setMonthRef] = useState(new Date());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [searchId, setSearchId] = useState("");
  const [page, setPage] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  function toggleType(type: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
    setPage(0);
  }

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const isCurrentMonth = monthRef.getFullYear() === today.getFullYear() && monthRef.getMonth() === today.getMonth();

  function prevMonth() {
    setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    setPage(0);
  }
  function nextMonth() {
    if (!isCurrentMonth) {
      setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
      setPage(0);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.select();
    }
  }

  // Check if pagination is needed (custom period > 31 days)
  const needsPagination = filterMode === "custom" && dateFrom && dateTo && daysBetween(dateFrom, dateTo) > 31;

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

  const totalPages = needsPagination ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : 1;
  const displayedRows = needsPagination ? filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) : filtered;

  return (
    <div className="space-y-3">
      {/* Filters */}
      {/* Line 1: Mode toggle + type chips (desktop/tablet) | Mode toggle + search (mobile) */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-md border border-app-card-border overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => { setFilterMode("month"); setPage(0); }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors min-w-[52px] text-center ${
                filterMode === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Mês
            </button>
            <button
              type="button"
              onClick={() => { setFilterMode("custom"); setDateTo(todayStr); setPage(0); }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors min-w-[52px] text-center ${
                filterMode === "custom" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Período
            </button>
          </div>

          {/* Search - mobile: fills remaining space on line 1 */}
          <div className="relative flex-1 min-w-0 sm:hidden">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="ID ou Pedido"
              className="h-8 pl-7 pr-7 text-xs"
              value={searchId}
              onChange={(e) => { setSearchId(e.target.value); setPage(0); }}
              onKeyDown={handleSearchKeyDown}
            />
            {searchId && (
              <button
                type="button"
                onClick={() => { setSearchId(""); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Type chips - hidden on mobile, pushed right on sm+ */}
          <div className="hidden sm:flex flex-wrap gap-1.5 ml-auto">
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
        </div>

        {/* Line 2: Date controls + search (desktop/tablet) | Date controls (mobile) */}
        <div className="flex items-center gap-2">
          {filterMode === "month" ? (
            <div className="flex items-center gap-0 shrink-0 h-8">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium min-w-[120px] text-center">
                {getMonthLabel(monthRef)}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth} disabled={isCurrentMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 items-center shrink-0">
              <Input type="date" className="h-8 w-[148px] text-xs" max={todayStr} value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} />
              <span className="text-xs text-muted-foreground">até</span>
              <Input type="date" className="h-8 w-[148px] text-xs" max={todayStr} value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} />
            </div>
          )}

          {/* Search - hidden on mobile, shown on sm+ */}
          <div className="relative hidden sm:block ml-auto w-48 shrink-0">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="ID ou Pedido"
              className="h-8 pl-7 pr-7 text-xs"
              value={searchId}
              onChange={(e) => { setSearchId(e.target.value); setPage(0); }}
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

        {/* Line 3 (mobile only): Type chips - distributed full width */}
        <div className="flex sm:hidden flex-wrap gap-1.5 justify-between">
          {movementTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors flex-1 min-w-0 text-center ${
                selectedTypes.has(type)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-app-card-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-app-card-border overflow-hidden">
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
             <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-app-table-header">
                <TableHead className="text-xs px-2 py-1.5 text-center w-[72px] hidden sm:table-cell">Data</TableHead>
                <TableHead className="text-xs px-2 py-1.5 text-left">Pedido</TableHead>
                <TableHead className="text-xs px-2 py-1.5 text-left hidden lg:table-cell">Qualificação</TableHead>
                <TableHead className="text-xs px-2 py-1.5 text-center">ID</TableHead>
                <TableHead className="text-xs px-2 py-1.5 text-center">Tipo</TableHead>
                <TableHead className="text-xs px-2 py-1.5 text-right">Pts</TableHead>
                <TableHead className="text-xs px-2 py-1.5 text-right w-[88px]">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">
                    Nenhuma movimentação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                displayedRows.map((row, i) => {
                  const q = qualificationLabels[row.qualification];
                  const { symbol, number: numStr } = formatCurrencySplit(row.value, currency);
                  return (
                    <TableRow key={i}>
                      <TableCell className="text-xs whitespace-nowrap px-2 py-1 text-center hidden sm:table-cell">
                        {formatShortDate(row.date)}
                      </TableCell>
                      <TableCell className="text-xs font-mono px-2 py-1 text-left">
                        <span className="flex items-center gap-1">
                          {/* Icons only on tablet/mobile */}
                          {q && (
                            <span className="lg:hidden">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-default text-xs leading-none" aria-label={q.label}>{q.icon}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">{q.label}</TooltipContent>
                              </Tooltip>
                            </span>
                          )}
                          <span>
                            {row.orderNumber}
                            <span className="block sm:hidden text-[10px] text-muted-foreground font-normal">
                              {formatShortDate(row.date)}
                            </span>
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-xs px-2 py-1 text-left hidden lg:table-cell">
                        {q ? q.label : row.qualification}
                      </TableCell>
                      <TableCell className="text-xs font-mono px-2 py-1 text-center">{row.id}</TableCell>
                      <TableCell className="text-xs px-2 py-1 text-center">{row.type}</TableCell>
                      <TableCell className="text-xs text-right px-2 py-1">{row.points ?? "-"}</TableCell>
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
      </div>

      {/* Pagination */}
      {needsPagination && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Página {page + 1} de {totalPages} ({filtered.length} registros)
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="space-y-1.5 -mt-1">
        {/* Icon legend - tablet/mobile only */}
        <div className="flex lg:hidden flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {Object.entries(qualificationLabels).map(([key, q]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="text-[11px]">{q.icon}</span> {q.label}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight">
          *O cálculo dos ganhos do Unilevel é baseado na sua qualificação atual. O ícone corresponde à sua qualificação no momento do pedido.
        </p>
      </div>
    </div>
  );
}
