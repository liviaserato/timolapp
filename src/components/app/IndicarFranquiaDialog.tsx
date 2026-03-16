import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFranchise } from "@/contexts/FranchiseContext";
import timolLogo from "@/assets/logo-timol-azul-escuro.svg";

interface IndicarFranquiaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IndicarFranquiaDialog({ open, onOpenChange }: IndicarFranquiaDialogProps) {
  const { selected } = useFranchise();
  const franchiseId = selected?.franchiseId ?? "000000";
  const referralLink = `https://indiquei.timol/${franchiseId}`;
  const cadastroLink = "https://www.timol.com.br/cadastro-nova-franquia";

  const [copiedCadastro, setCopiedCadastro] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  const handleCopyCadastro = async () => {
    await navigator.clipboard.writeText(cadastroLink);
    setCopiedCadastro(true);
    setTimeout(() => setCopiedCadastro(false), 2500);
  };

  const handleCopyReferral = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Timol — Indicação de Franquia",
          text: `Oi! Vim te indicar a Timol 💧\nUse meu link para se cadastrar:`,
          url: referralLink,
        });
      } catch {
        // user cancelled share
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader className="items-center text-center gap-2">
          <img src={timolLogo} alt="Timol" className="h-8 mx-auto" />
          <DialogTitle className="text-lg font-bold text-primary">
            Indicar Franquia
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-1">
          {/* Friendly intro */}
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            Que legal que você quer indicar alguém!
            <br />
            Escolha a forma mais fácil para você:
          </p>

          {/* Option 1: Direct link */}
          <div className="rounded-xl border border-border bg-accent/40 p-4 space-y-2.5 text-center">
            <p className="text-sm font-semibold text-foreground">
              Envie o link de cadastro
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Peça para a pessoa acessar o site
              <br />
              abaixo e digitar o seu ID
              {" "}
              <span className="font-bold text-foreground">{franchiseId}</span>
              {" "}
              como patrocinador:
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <a
                href={cadastroLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary font-medium underline underline-offset-2 break-all"
              >
                {cadastroLink}
              </a>
              <button
                onClick={handleCopyCadastro}
                className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                title="Copiar link"
              >
                {copiedCadastro ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Referral link */}
          <div className="rounded-xl border border-border bg-accent/40 p-4 space-y-3 text-center">
            <p className="text-sm font-semibold text-foreground">
              Ou compartilhe seu link pessoal
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Com esse link, seu ID já vai preenchido automaticamente — mais fácil impossível! 😄
            </p>

            {/* Referral URL display */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 rounded-lg bg-background border border-border px-3 py-2 justify-center">
                <span className="text-xs font-medium text-foreground truncate">
                  {referralLink}
                </span>
                <button
                  onClick={handleCopyReferral}
                  className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  title="Copiar link"
                >
                  {copiedReferral ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              {copiedReferral && (
                <p className="text-[11px] text-emerald-600 font-medium">Link copiado!</p>
              )}
            </div>

            {/* Share button — hidden on desktop (lg+), visible on mobile/tablet */}
            <Button
              onClick={handleShare}
              className="w-full gap-2 rounded-xl lg:hidden"
              size="default"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
