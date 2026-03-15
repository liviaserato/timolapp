import { useState } from "react";
import { Share2, Copy, Check, UserPlus, ExternalLink } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

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
    } else {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
            Que legal que você quer indicar alguém! 🎉
            <br />
            Escolha a forma mais fácil para você:
          </p>

          {/* Option 1: Direct link */}
          <div className="rounded-xl border border-border bg-accent/40 p-4 space-y-2.5">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-primary shrink-0" />
              Envie o link de cadastro
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Peça para a pessoa acessar o site abaixo e digitar o seu ID
              {" "}
              <span className="font-bold text-foreground">{franchiseId}</span>
              {" "}
              como patrocinador:
            </p>
            <a
              href={cadastroLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-primary font-medium underline underline-offset-2 break-all"
            >
              {cadastroLink}
            </a>
          </div>

          {/* Option 2: Referral link */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary shrink-0" />
              Ou compartilhe seu link pessoal
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Com esse link, seu ID já vai preenchido automaticamente — mais fácil impossível! 😄
            </p>

            {/* Referral URL display */}
            <div className="flex items-center gap-2 rounded-lg bg-background border border-border px-3 py-2">
              <span className="text-xs font-medium text-foreground truncate flex-1">
                {referralLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                title="Copiar link"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Share button */}
            <Button
              onClick={handleShare}
              className="w-full gap-2 rounded-xl"
              size="default"
            >
              <Share2 className="h-4 w-4" />
              {copied ? "Link copiado!" : "Compartilhar link"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
