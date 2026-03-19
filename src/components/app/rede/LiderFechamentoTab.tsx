import { useState } from "react";
import { Trophy, HandHelping, Search, X, Check, Gift, Link2, Copy, Clock } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import { InviteRequestCard, type InviteRequest } from "./InviteRequestCard";

/* ─── Mock data ────────────────────────────────────────────── */

interface ClosingRecord {
  id: string;
  sponsorId: string;
  sponsorName: string;
  guestDisplay: string;
  guestSub: string;
  date: string;
  franchiseType: string;
  confirmed: boolean | null; // null = pending
}

const initialRecords: ClosingRecord[] = [
  { id: "1", sponsorId: "TML-4521", sponsorName: "Carlos Mendes", guestDisplay: "Ana Paula Ferreira", guestSub: "TML-8832", date: "2025-12-10", franchiseType: "Ouro", confirmed: true },
  { id: "2", sponsorId: "TML-4521", sponsorName: "Carlos Mendes", guestDisplay: "Roberto Silva", guestSub: "TML-9011", date: "2026-01-15", franchiseType: "Prata", confirmed: true },
  { id: "3", sponsorId: "TML-4521", sponsorName: "Carlos Mendes", guestDisplay: "Juliana Costa", guestSub: "TML-9201", date: "2026-02-20", franchiseType: "Bronze", confirmed: false },
  { id: "4", sponsorId: "TML-4521", sponsorName: "Carlos Mendes", guestDisplay: "Marcos Oliveira", guestSub: "TML-9350", date: "2026-03-05", franchiseType: "Platina", confirmed: true },
  { id: "5", sponsorId: "TML-4521", sponsorName: "Carlos Mendes", guestDisplay: "Fernanda Lima", guestSub: "TML-9402", date: "2026-03-12", franchiseType: "Ouro", confirmed: false },
];

const initialInvites: InviteRequest[] = [
  { id: "inv-1", sponsorId: "TML-6102", sponsorName: "Luciana Braga", sponsorPhone: "+55 11 98765-4321", requestedAt: "2026-03-18" },
  { id: "inv-2", sponsorId: "TML-7744", sponsorName: "Eduardo Martins", sponsorPhone: "+55 21 91234-5678", requestedAt: "2026-03-19" },
];

const qualificationRequirements = [
  { label: "Estar com a franquia ativa", met: true },
  { label: "Manter 3 diretos ativos, cada um com pelo menos 150 pontos", met: true },
  { label: "Ter concluído o curso Líder de Fechamento", met: false },
];

/* ─── Component ────────────────────────────────────────────── */

export function LiderFechamentoTab() {
  const [requestOpen, setRequestOpen] = useState(false);
  const [leaderId, setLeaderId] = useState("");
  const [leaderValidated, setLeaderValidated] = useState<null | { name: string; qualified: boolean }>(null);
  const [searching, setSearching] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [invites, setInvites] = useState<InviteRequest[]>(initialInvites);
  const [records, setRecords] = useState<ClosingRecord[]>(initialRecords);

  const allMet = qualificationRequirements.every((r) => r.met);
  const mockLink = "indiquei.timol/id4521&lider7890";

  const handleValidateLeader = () => {
    if (!leaderId.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      const trimmed = leaderId.trim();
      if (trimmed === "123" || trimmed.toUpperCase().includes("TML")) {
        setLeaderValidated({ name: "Patrícia Andrade", qualified: true });
      } else {
        setLeaderValidated({ name: "Usuário Teste", qualified: false });
      }
    }, 800);
  };

  const handleSendRequest = () => {
    setRequestSent(true);
    toast.success("Solicitação enviada ao líder de fechamento!");
  };

  const resetModal = () => {
    setLeaderId("");
    setLeaderValidated(null);
    setSearching(false);
    setRequestSent(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${mockLink}`);
    setLinkCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleAcceptInvite = (invite: InviteRequest, link: string) => {
    setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    // Add pending record to history
    const newRecord: ClosingRecord = {
      id: `accepted-${invite.id}`,
      sponsorId: invite.sponsorId,
      sponsorName: invite.sponsorName,
      guestDisplay: link,
      guestSub: "Aguardando cadastro",
      date: new Date().toISOString().split("T")[0],
      franchiseType: "—",
      confirmed: null,
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleRejectInvite = (inviteId: string) => {
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  };

  return (
    <div className="space-y-4">
      {/* Why become a leader card */}
      <DashboardCard icon={Gift} title="Por que ser um Líder de Fechamento?">
        <div className="mt-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Além de ajudar outras pessoas a se desenvolverem no negócio, você é reconhecido com um 🎁 <strong>presente exclusivo</strong> a cada fechamento realizado com sucesso. Dependendo da franquia adquirida pelo convidado, você recebe de presente um <strong>Combo Mini</strong> ou um <strong>Combo Mega</strong>.
          </p>
        </div>
      </DashboardCard>

      {/* Invite requests card */}
      <InviteRequestCard
        invites={invites}
        onAccept={handleAcceptInvite}
        onReject={handleRejectInvite}
      />

      {/* Top cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Qualification card */}
        <DashboardCard icon={Trophy} title="Qualificação">
          <div className="space-y-3 mt-2">
            <p className="text-sm text-muted-foreground">
              Para ser reconhecido como <strong>Líder de Fechamento</strong>, é necessário cumprir todos os requisitos abaixo:
            </p>
            <div className="space-y-2.5">
              {qualificationRequirements.map((req, i) => (
                <label key={i} className="flex items-start gap-2.5 cursor-default">
                  <Checkbox checked={req.met} disabled className="mt-0.5" />
                  <span className={`text-sm ${req.met ? "text-foreground" : "text-muted-foreground"}`}>
                    {req.label}
                  </span>
                </label>
              ))}
            </div>
            <div className="pt-1">
              {allMet ? (
                <Badge className="bg-success text-success-foreground">Qualificada ✓</Badge>
              ) : (
                <Badge variant="outline" className="border-warning text-warning">
                  Pendente — complete os requisitos acima
                </Badge>
              )}
            </div>
          </div>
        </DashboardCard>

        {/* Request support card */}
        <div className="space-y-4">
          <DashboardCard icon={HandHelping} title="Solicitar Apoio">
            <div className="space-y-3 mt-2 flex flex-col h-full">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Precisa de ajuda para fechar uma franquia?{" "}
                Um <strong>Líder de Fechamento</strong> qualificado pode te apoiar no processo.
              </p>
              <div className="pt-1 mt-auto">
                <Button
                  onClick={() => { resetModal(); setRequestOpen(true); }}
                  className="w-full sm:w-auto"
                >
                  <HandHelping className="h-4 w-4 mr-1" />
                  Solicitar apoio de um líder
                </Button>
              </div>
            </div>
          </DashboardCard>

          {/* Active link card */}
          <DashboardCard icon={Link2} title="Link Ativo">
            <div className="mt-2 space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-success text-success-foreground text-xs">Confirmado</Badge>
                <span className="text-xs text-muted-foreground">Líder: <strong>Patrícia Andrade</strong></span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2.5">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-mono text-foreground truncate flex-1">{mockLink}</span>
                <Button variant="ghost" size="sm" className="h-7 px-2 shrink-0" onClick={handleCopyLink}>
                  {linkCopied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Válido por <strong>24 horas</strong> • Apenas <strong>1 cadastro</strong></span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Closing history table */}
      <DashboardCard icon={Trophy} title="Histórico de Fechamentos">
        <div className="mt-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-table-header">
                <TableHead>Patrocinador</TableHead>
                <TableHead>Convidado</TableHead>
                <TableHead className="hidden sm:table-cell">Data</TableHead>
                <TableHead className="hidden sm:table-cell">Franquia</TableHead>
                <TableHead className="text-center">Adquiriu?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="text-xs">
                      <span className="font-medium text-foreground">{r.sponsorName}</span>
                      <br />
                      <span className="text-muted-foreground">{r.sponsorId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {r.confirmed === null ? (
                        <>
                          <span className="font-mono text-primary truncate block max-w-[180px]">{r.guestDisplay}</span>
                          <span className="text-muted-foreground italic">{r.guestSub}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-foreground">{r.guestDisplay}</span>
                          <br />
                          <span className="text-muted-foreground">{r.guestSub}</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {new Date(r.date).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs">{r.franchiseType}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {r.confirmed === null ? (
                      <Badge variant="outline" className="text-xs border-warning text-warning">Pendente</Badge>
                    ) : r.confirmed ? (
                      <Badge className="bg-success text-success-foreground text-xs">Sim</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs border-destructive text-destructive">Não</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>

      {/* Request Leader Support Modal */}
      <Dialog open={requestOpen} onOpenChange={(o) => { if (!o) resetModal(); setRequestOpen(o); }}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center items-center">
            <DialogTitle className="text-app-sidebar">Solicitar Apoio de Líder</DialogTitle>
            <DialogDescription>
              Informe o ID do líder de fechamento que irá te apoiar.
            </DialogDescription>
          </DialogHeader>

          {!requestSent ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Ex: TML-1234"
                    value={leaderId}
                    onChange={(e) => { setLeaderId(e.target.value); setLeaderValidated(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleValidateLeader()}
                  />
                  {leaderId && (
                    <button
                      type="button"
                      onClick={() => { setLeaderId(""); setLeaderValidated(null); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button onClick={handleValidateLeader} disabled={!leaderId.trim() || searching}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searching && (
                <p className="text-sm text-muted-foreground animate-pulse">Verificando...</p>
              )}

              {leaderValidated && !searching && (
                <div className="rounded-lg border p-3 space-y-2">
                  {leaderValidated.qualified ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-foreground">{leaderValidated.name}</span>
                        <Badge className="bg-success text-success-foreground text-xs ml-auto">Qualificado</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Para que o líder receba um presente pelo apoio, o novo cadastro deverá ser realizado por um <strong>link único</strong>.
                        {"\n"}Esse link é válido por <strong>24 horas</strong> e permite cadastrar apenas <strong>um franqueado</strong>.
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        A solicitação será enviada ao líder. Após a confirmação, o link ficará disponível aqui ou no seu WhatsApp.
                        {"\n"}Você será notificado quando o líder aceitar seu convite.
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-foreground">{leaderValidated.name}</span>
                      <Badge variant="outline" className="text-xs border-destructive text-destructive ml-auto">
                        Não qualificado
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button
                  onClick={handleSendRequest}
                  disabled={!leaderValidated?.qualified}
                >
                  Enviar solicitação
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="text-center space-y-3 py-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-success" />
              </div>
              <p className="text-sm font-medium text-foreground">Solicitação enviada com sucesso!</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Aguarde a confirmação do líder <strong>{leaderValidated?.name}</strong>.
                {"\n"}Você será notificado por WhatsApp e o link ficará disponível nesta tela.
              </p>
              <DialogClose asChild>
                <Button className="mt-2">Entendido</Button>
              </DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
