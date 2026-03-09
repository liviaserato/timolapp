import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { BancoTimolExtractRow } from "./mock-data";

interface Props {
  data: BancoTimolExtractRow[];
  currency: CurrencyConfig;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

export function BancoTimolExtractTable({ data, currency }: Props) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-app-card-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px] px-1.5 py-1.5">Data</TableHead>
              <TableHead className="text-[11px] px-1.5 py-1.5">Descrição</TableHead>
              <TableHead className="text-[11px] px-1.5 py-1.5 text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-8">
                  Nenhuma movimentação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="text-[11px] whitespace-nowrap px-1.5 py-1">
                    {formatShortDate(row.date)}
                  </TableCell>
                  <TableCell className="text-[11px] px-1.5 py-1">{row.description}</TableCell>
                  <TableCell className={`text-[11px] text-right font-medium px-1.5 py-1 ${row.value < 0 ? "text-[hsl(var(--negative))]" : ""}`}>
                    {formatCurrency(row.value, currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
