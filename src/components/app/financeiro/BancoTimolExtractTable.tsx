import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { BancoTimolExtractRow } from "./mock-data";

interface Props {
  data: BancoTimolExtractRow[];
  currency: CurrencyConfig;
}

export function BancoTimolExtractTable({ data, currency }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-primary">🏦 Extrato Banco Timol</h3>
      <div className="rounded-md border border-app-card-border overflow-hidden max-w-3xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs px-2 py-2">Data</TableHead>
              <TableHead className="text-xs px-2 py-2">Descrição</TableHead>
              <TableHead className="text-xs px-2 py-2 text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">
                  Nenhuma movimentação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs whitespace-nowrap px-2 py-1.5">
                    {new Date(row.date).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-xs px-2 py-1.5">{row.description}</TableCell>
                  <TableCell className={`text-xs text-right font-medium px-2 py-1.5 ${row.value < 0 ? "text-destructive" : ""}`}>
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
