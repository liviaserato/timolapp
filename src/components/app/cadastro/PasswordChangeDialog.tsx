import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PinStepContent } from "@/components/app/financeiro/PinStepContent";
import { useLanguage } from "@/i18n/LanguageContext";

interface PasswordChangeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  maskedEmail: string;
}

function PasswordField({ label, value, onChange, show, onToggle, error, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; error?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="relative">
        <Input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pr-10" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function PasswordChangeDialog({ open, onOpenChange, maskedEmail }: PasswordChangeDialogProps) {
  const { t } = useLanguage();
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
  const passwordsValid = currentPassword.length >= MIN_PASSWORD_LENGTH && newPassword.length >= MIN_PASSWORD_LENGTH && passwordsMatch && !sameAsCurrentPassword;

  const handleSendPin = () => {
    if (!passwordsValid || loading) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("pin"); toast.info(t("pwd.pinSentToast")); }, 1500);
  };

  const handleVerifyPin = (pinValue: string) => {
    if (pinValue.length < 6 || loading) return;
    setLoading(true); setPinError("");
    setTimeout(() => { setLoading(false); setStep("success"); toast.success(t("pwd.changedToast")); }, 1500);
  };

  const handleResendPin = () => { toast.info(t("pwd.newPinToast")); };

  const handleClose = (v: boolean) => {
    if (!v) { setStep("passwords"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPinError(""); setShowCurrent(false); setShowNew(false); setShowConfirm(false); }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm" onKeyDown={(e) => { if (e.key === "Enter" && step === "passwords" && passwordsValid && !loading) { e.preventDefault(); handleSendPin(); } }}>
        {step === "success" ? (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center"><ShieldCheck className="h-7 w-7 text-green-600" /></div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold text-foreground">{t("pwd.changed")}</h3>
              <p className="text-sm text-muted-foreground">{t("pwd.changedDesc")}</p>
            </div>
            <Button onClick={() => handleClose(false)} className="mt-2 w-full max-w-[200px]">{t("common.close")}</Button>
          </div>
        ) : step === "pin" ? (
          <PinStepContent
            description={t("pwd.pinDesc").replace("{email}", maskedEmail)}
            onSubmit={handleVerifyPin}
            onResend={handleResendPin}
            loading={loading}
            error={pinError}
            onBack={() => { setStep("passwords"); setPinError(""); }}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("pwd.title")}</DialogTitle>
              <DialogDescription>{t("pwd.desc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <PasswordField label={t("pwd.currentPassword")} value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} placeholder={t("pwd.currentPlaceholder")} />
              <PasswordField label={t("pwd.newPassword")} value={newPassword} onChange={setNewPassword} show={showNew} onToggle={() => setShowNew(!showNew)} placeholder={t("pwd.newPlaceholder")} />
              {newPasswordTooShort && <p className="text-xs text-destructive">{t("pwd.tooShort")}</p>}
              {sameAsCurrentPassword && !newPasswordTooShort && <p className="text-xs text-destructive">{t("pwd.sameAsCurrent")}</p>}
              <PasswordField label={t("pwd.confirmPassword")} value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} placeholder={t("pwd.confirmPlaceholder")} error={passwordsMismatch ? t("pwd.mismatch") : undefined} />
              <DialogFooter>
                <Button variant="outline" onClick={() => handleClose(false)}>{t("common.cancel")}</Button>
                <Button onClick={handleSendPin} disabled={!passwordsValid || loading}>{loading ? t("common.verifying") : t("fin.continue")}</Button>
              </DialogFooter>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
