import { useState, useEffect, useCallback } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const RESEND_COOLDOWN_SECONDS = 60;

interface PinStepContentProps {
  /** Description shown below the title */
  description?: string;
  /** Called when user submits a valid 6-digit PIN */
  onSubmit: (pin: string) => void;
  /** Called when user requests resend */
  onResend?: () => void;
  /** Whether a request is loading */
  loading?: boolean;
  /** External error message */
  error?: string;
  /** Whether to show the back button */
  onBack?: () => void;
  /** Start cooldown immediately (e.g. PIN was just sent) */
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
  const [pin, setPin] = useState("");
  const [cooldown, setCooldown] = useState(startCooldown ? RESEND_COOLDOWN_SECONDS : 0);
  const [cooldownFinished, setCooldownFinished] = useState(!startCooldown);
  const [resending, setResending] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCooldownFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Reset when startCooldown changes (re-open)
  useEffect(() => {
    if (startCooldown) {
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setCooldownFinished(false);
    }
  }, [startCooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resending || loading) return;
    setResending(true);
    try {
      onResend?.();
    } finally {
      setResending(false);
      setPin("");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setCooldownFinished(false);
    }
  }, [cooldown, resending, loading, onResend]);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 6 && !loading) onSubmit(pin);
  };

  return (
    <form onSubmit={handleSubmitForm}>
      {/* Back arrow top-left */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </button>
      )}

      <DialogHeader className="text-center">
        <DialogTitle className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-5 w-5" /> Verificação de Segurança
        </DialogTitle>
        <DialogDescription className="text-center">
          {description || "Enviamos um PIN de 6 dígitos para o seu e-mail. Digite abaixo para confirmar."}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center gap-3 mt-4">
        <InputOTP
          maxLength={6}
          value={pin}
          onChange={(val) => setPin(val)}
          onComplete={(val) => {
            if (val.length === 6 && !loading) setTimeout(() => onSubmit(val), 0);
          }}
          autoFocus
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        {/* PIN duration info — line break after period */}
        <p className="text-[11px] text-muted-foreground text-center">
          O PIN é válido por <strong>5 minutos</strong>.
          <br />
          A Timol nunca solicitará este código — não informe a ninguém.
        </p>

        {error && <p className="text-xs text-destructive text-center">{error}</p>}

        <Button type="submit" className="w-full" disabled={pin.length < 6 || loading}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verificando...</> : "Confirmar"}
        </Button>

        {/* Resend section */}
        {onResend && (
          <div className="text-center w-full">
            {cooldown > 0 ? (
              <p className="text-xs text-muted-foreground">
                Seu PIN já foi enviado, você pode solicitar um novo em <strong>{cooldown}s</strong>
              </p>
            ) : cooldownFinished ? (
              <p className="text-xs text-muted-foreground">
                Não recebeu? Verifique sua caixa de spam e, se necessário,{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || loading}
                  className="text-primary hover:underline font-medium disabled:opacity-50"
                >
                  clique para reenviar um novo PIN
                </button>
                .
              </p>
            ) : null}
          </div>
        )}
      </div>
    </form>
  );
}
