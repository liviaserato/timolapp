import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getCurrencyConfig, formatCurrency } from "@/components/app/financeiro/currency-helpers";

const FRANCHISE_COUNTRY = "BR";
const FRANCHISE_CURRENCY = "BRL";

type FinancialType = "Banco" | "PIX" | "PagSeguro";

interface BonusPayment {
  id: string;
  name: string;
  value: number;
  financialType: FinancialType;
  financialDetails: string;
  verified: boolean;
}

// Mock data per friday (yyyy-mm-dd)
const mockPaymentsByDate: Record<string, BonusPayment[]> = {};

function seedMock() {
  const samples: Omit<BonusPayment, "value">[] = [
    { id: "100231", name: "Lívia Serato", financialType: "PIX", financialDetails: "CPF • 123.***.***-09", verified: true },
    { id: "100237", name: "Maria Silva Santos", financialType: "Banco", financialDetails: "Itaú • Ag 1234 • CC 56789-0", verified: true },
    { id: "200587", name: "João Pedro Oliveira", financialType: "PagSeguro", financialDetails: "joao.oliveira@email.com", verified: false },
    { id: "300142", name: "Ana Paula Costa", financialType: "PIX", financialDetails: "E-mail • ana@email.com", verified: true },
    { id: "400321", name: "Roberto Almeida Filho", financialType: "Banco", financialDetails: "Bradesco • Ag 0987 • CC 12345-6", verified: false },
    { id: "500110", name: "Fernanda Oliveira", financialType: "PIX", financialDetails: "Telefone • +55 11 9****-1234", verified: true },
    { id: "600221", name: "Carlos Mendes", financialType: "PagSeguro", financialDetails: "carlos.mendes@email.com", verified: true },
    { id: "700333", name: "Patrícia Souza", financialType: "Banco", financialDetails: "Santander • Ag 4321 • CC 98765-4", verified: false },
  ];
  return samples;
}

function getFridaysOfMonth(year: number, month: number): Date[] {
  const result: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    if (d.getDay() === 5) result.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return result;
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMonthLabel(date: Date): string {
  const m = date.toLocaleDateString("pt-BR", { month: "long" });
  return `${m} ${date.getFullYear()}`;
}

type SortKey = "id" | "name" | "value" | "financialType";

export default function InternalPagamentoBonus() {
  const navigate = useNavigate();
  const currency = getCurrencyConfig(FRANCHISE_COUNTRY, FRANCHISE_CURRENCY);

  const today = new Date();
  const todayIso = isoDate(today);

  const [monthRef, setMonthRef] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const fridays = useMemo(() => getFridaysOfMonth(monthRef.getFullYear(), monthRef.getMonth()), [monthRef]);

  // Default selected: closest friday in the month (current/next, else first)
  const defaultFridayIso = useMemo(() => {
    if (fridays.length === 0) return "";
    const upcoming = fridays.find(d => isoDate(d) >= todayIso);
    return isoDate(upcoming ?? fridays[0]);
  }, [fridays, todayIso]);

  const [selectedFriday, setSelectedFriday] = useState<string>(defaultFridayIso);

  // Reset selected friday when month changes
  useMemo(() => {
    if (!fridays.find(d => isoDate(d) === selectedFriday)) {
      setSelectedFriday(defaultFridayIso);
    }
  }, [defaultFridayIso, fridays, selectedFriday]);

  // Generate deterministic data per friday
  const payments: BonusPayment[] = useMemo(() => {
    if (!selectedFriday) return [];
    if (!mockPaymentsByDate[selectedFriday]) {
      const seed = seedMock();
      mockPaymentsByDate[selectedFriday] = seed.map((s, i) => ({
        ...s,
        value: Math.round((50 + (i + 1) * 37.5 + (selectedFriday.charCodeAt(8) % 5) * 12) * 100) / 100,
      }));
    }
    return mockPaymentsByDate[selectedFriday];
  }, [selectedFriday]);

  const isPast = selectedFriday < todayIso;
  const titlePrefix = isPast ? "Bônus Pagos dia" : "Bônus a Pagar dia";
  const selectedDateLabel = selectedFriday
    ? new Date(selectedFriday + "T00:00:00").toLocaleDateString("pt-BR")
    : "—";

  // Filters
  const [showVerified, setShowVerified] = useState(true);
  const [showUnverified, setShowUnverified] = useState(true);

  const counts = useMemo(() => ({
    verified: payments.filter(p => p.verified).length,
    unverified: payments.filter(p => !p.verified).length,
  }), [payments]);

  const filtered = useMemo(() => {
    return payments.filter(p => (p.verified ? showVerified : showUnverified));
  }, [payments, showVerified, showUnverified]);

  // Sort
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"neutral" | "asc" | "desc">("neutral");

  const sorted = useMemo(() => {
    if (sortDir === "neutral") return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "value") cmp = a.value - b.value;
      else cmp = String(a[sortBy]).localeCompare(String(b[sortBy]), "pt-BR");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  const total = useMemo(() => sorted.reduce((s, p) => s + p.value, 0), [sorted]);

  const isCurrentOrFutureMonth =
    monthRef.getFullYear() > today.getFullYear() ||
    (monthRef.getFullYear() === today.getFullYear() && monthRef.getMonth() >= today.getMonth());

  return (
    <div>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => navigate("/internal/financeiro")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-primary truncate">Pagamento Semanal de Bônus</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Bônus liberados semanalmente nas sextas-feiras</p>
          </div>
        </div>
      </header>

      {/* Month selector */}
      <div className="flex items-center justify-center gap-1 mb-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setMonthRef(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[160px] text-center capitalize">
          {getMonthLabel(monthRef)}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setMonthRef(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          disabled={isCurrentOrFutureMonth && monthRef.getMonth() === today.getMonth() && monthRef.getFullYear() === today.getFullYear() ? false : false}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Friday toggle */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {fridays.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Nenhuma sexta-feira no mês.</p>
        )}
        {fridays.map(d => {
          const iso = isoDate(d);
          const active = iso === selectedFriday;
          const past = iso < todayIso;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSelectedFriday(iso)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : past
                    ? "border-app-card-border bg-muted/40 text-muted-foreground hover:border-primary/30"
                    : "border-app-card-border bg-card text-foreground hover:border-primary/30"
              )}
            >
              <span className="block leading-tight">{d.getDate().toString().padStart(2, "0")}/{(d.getMonth() + 1).toString().padStart(2, "0")}</span>
              <span className={cn("block text-[10px] leading-tight", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {past ? "pago" : "a pagar"}
              </span>
            </button>
          );
        })}
      </div>

      {selectedFriday && (
        <>
          {/* Title + counts */}
          <div className="space-y-1.5 px-1 mb-3">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-semibold text-foreground text-lg whitespace-nowrap">
                  {titlePrefix} {selectedDateLabel}
                </h2>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  ({sorted.length} {sorted.length === 1 ? "resultado encontrado" : "resultados encontrados"})
                </span>
              </div>

              <div className="flex flex-nowrap items-center justify-end gap-1 sm:gap-2 ml-auto">
                {/* Verified filters */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button
                    onClick={() => { if (showVerified && !showUnverified) return; setShowVerified(v => !v); }}
                    title={showVerified ? `${counts.verified} verificadas` : "Mostrar verificadas"}
                    className={cn(
                      "inline-flex items-center justify-center gap-1 rounded-full px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-medium transition-all border whitespace-nowrap",
                      showVerified
                        ? "bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm"
                        : "bg-transparent text-emerald-600/70 border-transparent hover:bg-emerald-50 hover:border-emerald-200"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", showVerified ? "bg-emerald-500" : "bg-emerald-400/50")} />
                    {showVerified ? `${counts.verified}` : ""}
                    <span className="hidden sm:inline">{showVerified ? " verificadas" : "verificadas"}</span>
                  </button>
                  <button
                    onClick={() => { if (showUnverified && !showVerified) return; setShowUnverified(v => !v); }}
                    title={showUnverified ? `${counts.unverified} não verificadas` : "Mostrar não verificadas"}
                    className={cn(
                      "inline-flex items-center justify-center gap-1 rounded-full px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-medium transition-all border whitespace-nowrap",
                      showUnverified
                        ? "bg-red-100 text-red-700 border-red-300 shadow-sm"
                        : "bg-transparent text-red-500/70 border-transparent hover:bg-red-50 hover:border-red-200"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", showUnverified ? "bg-red-500" : "bg-red-400/50")} />
                    {showUnverified ? `${counts.unverified}` : ""}
                    <span className="hidden sm:inline">{showUnverified ? " não verificadas" : "não verificadas"}</span>
                  </button>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-dashed rounded-r-none shrink-0"
                    onClick={() => setSortDir(d => d === "neutral" ? "asc" : d === "asc" ? "desc" : "asc")}
                    title={sortDir === "neutral" ? "Ordenação padrão" : sortDir === "asc" ? "Ascendente" : "Descendente"}
                  >
                    {sortDir === "neutral"
                      ? <ArrowUpDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      : sortDir === "asc"
                        ? <ArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        : <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    }
                  </Button>
                  <Select
                    value={sortBy}
                    onValueChange={v => { setSortBy(v as SortKey); if (sortDir === "neutral") setSortDir("asc"); }}
                  >
                    <SelectTrigger className="h-7 sm:h-8 text-[11px] sm:text-xs sm:min-w-[140px] px-2 border-dashed rounded-l-none">
                      {sortDir === "neutral"
                        ? <span className="text-muted-foreground">Classificar</span>
                        : <SelectValue placeholder="Classificar" />
                      }
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">ID</SelectItem>
                      <SelectItem value="name">Nome</SelectItem>
                      <SelectItem value="value">Valor</SelectItem>
                      <SelectItem value="financialType">Dado financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-app-card-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs px-3 py-2 w-[90px]">ID</TableHead>
                  <TableHead className="text-xs px-3 py-2">Nome</TableHead>
                  <TableHead className="text-xs px-3 py-2 text-right w-[120px]">Valor</TableHead>
                  <TableHead className="text-xs px-3 py-2">Dados Financeiros</TableHead>
                  <TableHead className="text-xs px-3 py-2 text-center w-[140px]">Verificação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                ) : sorted.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-mono px-3 py-2">{p.id}</TableCell>
                    <TableCell className="text-xs px-3 py-2">{p.name}</TableCell>
                    <TableCell className="text-xs px-3 py-2 text-right font-medium">{formatCurrency(p.value, currency)}</TableCell>
                    <TableCell className="text-xs px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{p.financialType}</span>
                        <span className="text-[11px] text-muted-foreground truncate">{p.financialDetails}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs px-3 py-2 text-center">
                      {p.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 px-2 py-0.5 text-[11px] font-medium">
                          <CheckCircle2 className="h-3 w-3" /> Verificada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 text-[11px] font-medium">
                          <XCircle className="h-3 w-3" /> Não verificada
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Total */}
          <div className="mt-3 flex justify-end px-1">
            <div className="text-sm">
              <span className="text-muted-foreground">Valor total: </span>
              <span className="font-bold text-primary">{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
