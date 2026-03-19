import { useState } from "react";
import { UserCheck, X, Check, Copy, Clock, Link2, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export interface InviteRequest {
  id: string;
  sponsorId: string;
  sponsorName: string;
  sponsorPhone: string;
  requestedAt: string;
}

interface Props {
  invites: InviteRequest[];
  onAccept: (invite: InviteRequest, link: string) => void;
  onReject: (inviteId: string) => void;
}

export function InviteRequestCard({ invites, onAccept, onReject }: Props) {
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<InviteRequest | null>(null);
  const [generatedLink, setGeneratedLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAcceptClick = (invite: InviteRequest) => {
    setSelectedInvite(invite);
    const link = `indiquei.timol/id${invite.sponsorId.replace("TML-", "")}&lider7890`;
    setGeneratedLink(link);
    setAccepted(false);
    setLinkCopied(false);
    setAcceptDialogOpen(true);
  };

  const handleConfirmAccept = () => {
    if (!selectedInvite) return;
    setAccepted(true);
    onAccept(selectedInvite, generatedLink);
    toast.success("Convite aceito! Link gerado com sucesso.");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${generatedLink}`);
    setLinkCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleReject = (inviteId: string) => {
    onReject(inviteId);
    toast("Convite recusado.");
  };

  if (invites.length === 0) return null;

  return (
    <>
      <DashboardCard icon={UserCheck} title="Convites Recebidos">
        <div className="mt-2 space-y-3">
          <p className="text-sm text-muted-foreground">
            Você recebeu {invites.length === 1 ? "uma solicitação" : `${invites.length} solicitações`} para atuar como <strong>Líder de Fechamento</strong>.
          </p>
          <div className="space-y-2">
            {invites.map((inv) => (
              <div key={inv.id} className="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inv.sponsorName}</p>
                  <p className="text-xs text-muted-foreground">{inv.sponsorId}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => handleReject(inv.id)}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Rejeitar
                  </Button>
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => handleAcceptClick(inv)}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Aceitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>

      {/* Accept invite dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center items-center">
            <DialogTitle className="text-app-sidebar">
              {accepted ? "Convite Aceito!" : "Aceitar Convite"}
            </DialogTitle>
            {!accepted && (
              <DialogDescription>
                Confira os dados do patrocinador e confirme sua participação.
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedInvite && !accepted && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">ID</span>
                  <span className="text-sm font-medium text-foreground">{selectedInvite.sponsorId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Nome</span>
                  <span className="text-sm font-medium text-foreground">{selectedInvite.sponsorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Telefone</span>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedInvite.sponsorPhone}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ao aceitar, será gerado um <strong>link único</strong> de cadastro vinculado a este patrocinador.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Válido por <strong>24 horas</strong> • Apenas <strong>1 cadastro</strong></span>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <DialogClose asChild>
                  <Button variant="outline" className="w-full sm:w-auto">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleConfirmAccept} className="w-full sm:w-auto">
                  <Check className="h-4 w-4 mr-1" />
                  Confirmar e gerar link
                </Button>
              </DialogFooter>
            </div>
          )}

          {selectedInvite && accepted && (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-success" />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Link gerado para <strong>{selectedInvite.sponsorName}</strong>
              </p>

              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2.5">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-mono text-foreground truncate flex-1">{generatedLink}</span>
                <Button variant="ghost" size="sm" className="h-7 px-2 shrink-0" onClick={handleCopyLink}>
                  {linkCopied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
                <Clock className="h-3.5 w-3.5" />
                <span>Válido por <strong>24 horas</strong> • Apenas <strong>1 cadastro</strong></span>
              </div>

              <DialogClose asChild>
                <Button className="w-full">Entendido</Button>
              </DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
