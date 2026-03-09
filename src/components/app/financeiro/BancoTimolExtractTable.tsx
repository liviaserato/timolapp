import { useState, useMemo, useRef } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { CurrencyConfig, formatCurrencySplit } from "./currency-helpers";
import { BancoTimolExtractRow } from "./mock-data";

interface Props {
  data: BancoTimolExtractRow[];
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

export function BancoTimolExtractTable({ data, currency }: Props) {
  const [filterMode, setFilterMode] = useState<"month" | "custom">("month");
  const [monthRef, setMonthRef] = useState(new Date());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const isCurrentMonth = monthRef.getFullYear() === today.getFullYear() && monthRef.getMonth() === today.getMonth();

  function prevMonth() {
    setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    if (!isCurrentMonth) {
      setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
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
      if (searchTerm && !row.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [data, filterMode, monthRef, dateFrom, dateTo, searchTerm]);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-col gap-2">
        {/* Line 1: Mode toggle + search (mobile) */}
        <div className="flex flex-wrap items-center gap-2">
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
              onClick={() => { setFilterMode("custom"); setDateTo(todayStr); }}
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
              placeholder="Buscar..."
              className="h-8 pl-7 pr-7 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Line 2: Date controls + search (desktop) */}
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
              <Input type="date" className="h-8 w-[148px] text-xs" max={todayStr} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <span className="text-xs text-muted-foreground">até</span>
              <Input type="date" className="h-8 w-[148px] text-xs" max={todayStr} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          )}

          {/* Search - desktop/tablet */}
          <div className="relative hidden sm:block ml-auto w-48 shrink-0">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Buscar..."
              className="h-8 pl-7 pr-7 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(""); searchRef.current?.focus(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-app-card-border overflow-hidden">
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-app-table-header">
                 <TableHead className="text-xs px-2 py-1.5 text-center w-[72px]">Data</TableHead>
                 <TableHead className="text-xs pl-2 pr-2 py-1.5 text-left">Descrição</TableHead>
                <TableHead className="text-xs px-2 py-1.5 text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-8">
                    Nenhuma movimentação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row, i) => {
                  const { symbol, number: numStr } = formatCurrencySplit(row.value, currency);
                  return (
                    <TableRow key={i}>
                      <TableCell className="text-xs whitespace-nowrap px-2 py-1 text-center">
                        {formatShortDate(row.date)}
                      </TableCell>
                      <TableCell className="text-xs pl-2 pr-2 py-1 text-left">{row.description}</TableCell>
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
    </div>
  );
}
