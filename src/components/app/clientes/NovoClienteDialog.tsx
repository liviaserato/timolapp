import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface NovoClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoClienteDialog({ open, onOpenChange }: NovoClienteDialogProps) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nome.trim() || !whatsapp.trim()) {
      toast.error("Preencha o nome e o WhatsApp do cliente.");
      return;
    }
    setSaving(true);
    // TODO: Save to database
    await new Promise((r) => setTimeout(r, 500));
    toast.success(`Cliente "${nome}" adicionado com sucesso!`);
    setSaving(false);
    setNome("");
    setWhatsapp("");
    setObservacao("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <UserPlus className="h-5 w-5" />
            Novo Cliente
          </DialogTitle>
          <DialogDescription>
            Cadastre os dados básicos do cliente para acompanhamento de vendas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="nome-cliente">Nome completo</Label>
            <Input
              id="nome-cliente"
              placeholder="Ex: Maria Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="whatsapp-cliente">WhatsApp</Label>
            <Input
              id="whatsapp-cliente"
              placeholder="Ex: (11) 99999-1234"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="obs-cliente">Observação (opcional)</Label>
            <Textarea
              id="obs-cliente"
              placeholder="Ex: Conheceu pelo Instagram, interessada no combo mini"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Salvando..." : "Adicionar Cliente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
