import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFranchise } from "@/contexts/FranchiseContext";
import { useLanguage } from "@/i18n/LanguageContext";
import timolLogo from "@/assets/logo-timol-azul-escuro.svg";

interface IndicarFranquiaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IndicarFranquiaDialog({ open, onOpenChange }: IndicarFranquiaDialogProps) {
  const { selected } = useFranchise();
  const { t } = useLanguage();
  const franchiseId = selected?.franchiseId ?? "000000";
  const referralLink = `https://indiquei.timol/${franchiseId}`;
  const [copiedReferral, setCopiedReferral] = useState(false);

  const handleCopyReferral = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Timol — " + t("ind.title"),
          text: t("ind.intro"),
          url: referralLink,
        });
      } catch { /* user cancelled */ }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader className="items-center text-center gap-2">
          <img src={timolLogo} alt="Timol" className="h-8 mx-auto" />
          <DialogTitle className="text-lg font-bold text-primary">
            {t("ind.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-1">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {t("ind.intro")}
          </p>

          <div className="rounded-xl border border-border bg-accent/40 p-4 space-y-3 text-center">
            <p className="text-sm font-semibold text-foreground">
              {t("ind.shareLink")}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("ind.shareDesc")}
            </p>

            <div className="space-y-1">
              <div
                onClick={handleCopyReferral}
                className="flex items-center gap-2 rounded-lg bg-background border border-border px-3 py-2 justify-center cursor-pointer hover:border-primary transition-colors"
              >
                <span className="text-xs font-medium text-foreground truncate">{referralLink}</span>
                <span className="shrink-0 text-muted-foreground">
                  {copiedReferral ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </span>
              </div>
            </div>

            <Button onClick={handleShare} className="w-full gap-2 rounded-xl lg:hidden" size="default">
              <Share2 className="h-4 w-4" />
              {t("ind.shareBtn")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
