import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PinStepContent } from "@/components/app/financeiro/PinStepContent";

interface PasswordChangeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  maskedEmail: string;
}

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

export function PasswordChangeDialog({ open, onOpenChange, maskedEmail }: PasswordChangeDialogProps) {
  const [step, setStep] = useState<"passwords" | "pin" | "success">("passwords");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState("");

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

  const handleVerifyPin = (pinValue: string) => {
    if (pinValue.length < 6 || loading) return;
    setLoading(true);
    setPinError("");
    // TODO: call change-password edge function with action "change"
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      toast.success("Senha alterada com sucesso.");
    }, 1500);
  };

  const handleResendPin = () => {
    // TODO: call change-password edge function with action "send-pin"
    toast.info("Novo PIN enviado para o seu e-mail.");
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setStep("passwords");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPinError("");
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
          if (e.key === "Enter" && step === "passwords" && passwordsValid && !loading) {
            e.preventDefault();
            handleSendPin();
          }
        }}
      >
        {step === "success" ? (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-green-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Senha alterada</h3>
              <p className="text-sm text-muted-foreground">
                Sua senha foi atualizada com sucesso.
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="mt-2 w-full max-w-[200px]">
              Fechar
            </Button>
          </div>
        ) : step === "pin" ? (
          <PinStepContent
            description={`Digite o PIN de 6 dígitos enviado para ${maskedEmail}.`}
            onSubmit={handleVerifyPin}
            onResend={handleResendPin}
            loading={loading}
            error={pinError}
            onBack={() => { setStep("passwords"); setPinError(""); }}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Alterar Senha</DialogTitle>
              <DialogDescription>
                Informe sua senha atual e defina uma nova senha.
              </DialogDescription>
            </DialogHeader>

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
              {sameAsCurrentPassword && !newPasswordTooShort && (
                <p className="text-xs text-destructive">A nova senha não pode ser igual à senha atual.</p>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
