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
      <h3 className="text-sm font-bold text-primary">Extrato Saldo Timol</h3>
      <div className="rounded-md border border-app-card-border overflow-hidden max-w-3xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Data</TableHead>
              <TableHead className="text-xs">Descrição</TableHead>
              <TableHead className="text-xs text-right">Valor</TableHead>
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
                  <TableCell className="text-xs whitespace-nowrap">
                    {new Date(row.date).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-xs">{row.description}</TableCell>
                  <TableCell className={`text-xs text-right font-medium ${row.value < 0 ? "text-destructive" : ""}`}>
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
