import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PasswordChangeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  maskedEmail: string;
}

/* ── Password field with eye toggle ── */

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ── Dialog ── */

export function PasswordChangeDialog({ open, onOpenChange, maskedEmail }: PasswordChangeDialogProps) {
  const [step, setStep] = useState<"passwords" | "pin">("passwords");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const MIN_PASSWORD_LENGTH = 6;
  const passwordsMatch = newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && !passwordsMatch;
  const newPasswordTooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;
  const sameAsCurrentPassword = newPassword.length > 0 && newPassword === currentPassword;
  const passwordsValid =
    currentPassword.length >= MIN_PASSWORD_LENGTH &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    passwordsMatch &&
    !sameAsCurrentPassword;

  const handleSendPin = () => {
    if (!passwordsValid || loading) return;
    setLoading(true);
    // TODO: call change-password edge function with action "send-pin"
    setTimeout(() => {
      setLoading(false);
      setStep("pin");
      toast.info("PIN enviado para o seu e-mail cadastrado.");
    }, 1500);
  };

  const handleVerifyPin = () => {
    if (pin.length < 6 || loading) return;
    setLoading(true);
    // TODO: call change-password edge function with action "change"
    setTimeout(() => {
      setLoading(false);
      toast.success("Senha alterada com sucesso! Um e-mail de confirmação foi enviado.");
      handleClose(false);
    }, 1500);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setStep("passwords");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPin("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (step === "passwords" && passwordsValid && !loading) handleSendPin();
            else if (step === "pin" && pin.length === 6 && !loading) handleVerifyPin();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogDescription>
            {step === "passwords"
              ? "Informe sua senha atual e defina uma nova senha."
              : `Digite o PIN de 6 dígitos enviado para ${maskedEmail}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "passwords" ? (
          <div className="space-y-3">
            <PasswordField
              label="Senha atual"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              placeholder="Digite sua senha atual"
            />
            <PasswordField
              label="Nova senha"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              placeholder="Mínimo 6 caracteres"
            />
            {newPasswordTooShort && (
              <p className="text-xs text-destructive">A senha deve ter no mínimo 6 caracteres.</p>
            )}
            <PasswordField
              label="Confirmar nova senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              placeholder="Repita a nova senha"
              error={passwordsMismatch ? "As senhas não coincidem." : undefined}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendPin} disabled={!passwordsValid || loading}>
                {loading ? "Verificando..." : "Continuar"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-center block">PIN de verificação</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={pin}
                  onChange={(value) => setPin(value)}
                  onComplete={() => {
                    setTimeout(() => handleVerifyPin(), 0);
                  }}
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
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setStep("passwords"); setPin(""); }}>
                Voltar
              </Button>
              <Button onClick={handleVerifyPin} disabled={pin.length < 6 || loading}>
                {loading ? "Verificando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
