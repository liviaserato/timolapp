import { useState, useEffect, useCallback } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/LanguageContext";

const RESEND_COOLDOWN_SECONDS = 60;

interface PinStepContentProps {
  description?: string;
  onSubmit: (pin: string) => void;
  onResend?: () => void;
  loading?: boolean;
  error?: string;
  onBack?: () => void;
  startCooldown?: boolean;
}

export function PinStepContent({
  description,
  onSubmit,
  onResend,
  loading = false,
  error,
  onBack,
  startCooldown = true,
}: PinStepContentProps) {
  const { t } = useLanguage();
  const [pin, setPin] = useState("");
  const [cooldown, setCooldown] = useState(startCooldown ? RESEND_COOLDOWN_SECONDS : 0);
  const [cooldownFinished, setCooldownFinished] = useState(!startCooldown);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); setCooldownFinished(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (startCooldown) { setCooldown(RESEND_COOLDOWN_SECONDS); setCooldownFinished(false); }
  }, [startCooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resending || loading) return;
    setResending(true);
    try { onResend?.(); } finally {
      setResending(false); setPin(""); setCooldown(RESEND_COOLDOWN_SECONDS); setCooldownFinished(false);
    }
  }, [cooldown, resending, loading, onResend]);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 6 && !loading) onSubmit(pin);
  };

  return (
    <form onSubmit={handleSubmitForm}>
      <div className="relative">
        {onBack && (
          <button type="button" onClick={onBack} className="absolute left-0 top-1 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-5 w-5" /> {t("pin.securityVerification")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description || t("pin.defaultDesc")}
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="flex flex-col items-center gap-3 mt-4">
        <InputOTP maxLength={6} value={pin} onChange={(val) => setPin(val)} onComplete={(val) => { if (val.length === 6 && !loading) setTimeout(() => onSubmit(val), 0); }} autoFocus>
          <InputOTPGroup>
            <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
            <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <p className="text-[11px] text-muted-foreground text-center">
          {t("pin.validFor").replace("{minutes}", "5")}
          <br />
          {t("pin.neverShare")}
        </p>

        {error && <p className="text-xs text-destructive text-center">{error}</p>}

        <Button type="submit" className="w-full" disabled={pin.length < 6 || loading}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("pin.verifying")}</> : t("pin.confirm")}
        </Button>

        {onResend && (
          <div className="text-center w-full">
            {cooldown > 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("pin.alreadySent").replace("{s}", String(cooldown))}
              </p>
            ) : cooldownFinished ? (
              <p className="text-xs text-muted-foreground">
                {t("pin.notReceived")}{" "}
                <button type="button" onClick={handleResend} disabled={resending || loading} className="text-primary hover:underline font-medium disabled:opacity-50">
                  {t("pin.resend")}
                </button>.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </form>
  );
}
