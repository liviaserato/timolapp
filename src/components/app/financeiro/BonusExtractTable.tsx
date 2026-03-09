import { useState, useMemo } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { BonusExtractRow, movementTypes, qualificationLabels } from "./mock-data";

interface Props {
  data: BonusExtractRow[];
  currency: CurrencyConfig;
}

export function BonusExtractTable({ data, currency }: Props) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [searchId, setSearchId] = useState("");

  function toggleType(type: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (dateFrom && row.date < dateFrom) return false;
      if (dateTo && row.date > dateTo) return false;
      if (selectedTypes.size > 0 && !selectedTypes.has(row.type)) return false;
      if (searchId && !row.id.includes(searchId)) return false;
      return true;
    });
  }, [data, dateFrom, dateTo, selectedTypes, searchId]);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex gap-2 items-center">
          <Input type="date" className="h-8 w-36 text-xs" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span className="text-xs text-muted-foreground">até</span>
          <Input type="date" className="h-8 w-36 text-xs" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID"
            className="h-8 pl-7 text-xs"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>
      </div>
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
            <TableRow>
              <TableHead className="text-xs">Data</TableHead>
              <TableHead className="text-xs">ID</TableHead>
              <TableHead className="text-xs">Qualificação</TableHead>
              <TableHead className="text-xs">Tipo</TableHead>
              <TableHead className="text-xs text-right">Pontos</TableHead>
              <TableHead className="text-xs text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  Nenhuma movimentação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row, i) => {
                const q = qualificationLabels[row.qualification];
                return (
                  <TableRow key={i}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(row.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-xs font-mono">{row.id}</TableCell>
                    <TableCell>
                      {q && (
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${q.color}`}>
                          {q.label}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{row.type}</TableCell>
                    <TableCell className="text-xs text-right">{row.points ?? "—"}</TableCell>
                    <TableCell className={`text-xs text-right font-medium ${row.value < 0 ? "text-destructive" : ""}`}>
                      {formatCurrency(row.value, currency)}
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
