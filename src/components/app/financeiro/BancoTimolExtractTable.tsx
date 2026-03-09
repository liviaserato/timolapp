import { useState, useMemo } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  function prevMonth() {
    setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
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
      return true;
    });
  }, [data, filterMode, monthRef, dateFrom, dateTo]);

  return (
    <div className="space-y-3">
      {/* Filter row */}
      <div className="flex items-center gap-2">
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

      <div className="rounded-md border border-app-card-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-app-table-header">
              <TableHead className="text-xs px-2 py-1.5">Data</TableHead>
              <TableHead className="text-xs px-2 py-1.5 text-left">Descrição</TableHead>
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
                    <TableCell className="text-xs whitespace-nowrap px-2 py-1">
                      {formatShortDate(row.date)}
                    </TableCell>
                    <TableCell className="text-xs px-2 py-1 text-left">{row.description}</TableCell>
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
  );
}
