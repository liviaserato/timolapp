import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

type Step = "identifier" | "pin" | "new-password" | "success";

interface Props {
  open: boolean;
  onClose: () => void;
  onSwitchToUsername: () => void;
}

export const ForgotPasswordPopup = ({ open, onClose, onSwitchToUsername }: Props) => {
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetAll = () => {
    setStep("identifier");
    setIdentifier("");
    setPin("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNew(false);
    setShowConfirm(false);
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  // Step 1: Send PIN
  const handleSendPin = async () => {
    if (!identifier.trim()) {
      setError(t("forgotPw.error.identifierRequired"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("forgot-password", {
        body: { identifier: identifier.trim() },
      });
      if (fnError) throw fnError;
      if (data?.success) {
        setStep("pin");
      } else {
        setError(t("forgotPw.error.generic"));
      }
    } catch {
      setError(t("forgotPw.error.generic"));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify PIN
  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      setError(t("forgotPw.error.pinLength"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-reset-pin", {
        body: { identifier: identifier.trim(), pin },
      });
      if (fnError) throw fnError;
      if (data?.success && data.reset_token) {
        setResetToken(data.reset_token);
        setStep("new-password");
      } else {
        setError(t("forgotPw.error.invalidPin"));
      }
    } catch {
      setError(t("forgotPw.error.invalidPin"));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set new password
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError(t("forgotPw.error.passwordMin"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("forgotPw.error.passwordMismatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("reset-password", {
        body: { reset_token: resetToken, new_password: newPassword },
      });
      if (fnError) throw fnError;
      if (data?.success) {
        setStep("success");
      } else {
        setError(t("forgotPw.error.resetFailed"));
      }
    } catch {
      setError(t("forgotPw.error.resetFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center space-y-2">
          <img src={timolLogoDark} alt="Timol" className="h-8 mx-auto" />
          <DialogTitle className="text-base">{t("forgotPw.title")}</DialogTitle>
          {step === "identifier" && (
            <DialogDescription className="text-xs text-center">
              {t("forgotPw.description")}
            </DialogDescription>
          )}
          {step === "pin" && (
            <DialogDescription className="text-xs text-center">
              {t("forgotPw.pinSent")}
            </DialogDescription>
          )}
          {step === "new-password" && (
            <DialogDescription className="text-xs text-center">
              {t("forgotPw.newPasswordDesc")}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Step: Identifier */}
          {step === "identifier" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fp-id" className="text-xs">
                  {t("login.username")}
                </Label>
                <Input
                  id="fp-id"
                  placeholder={t("login.username.placeholder")}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError("");
                  }}
                  autoCapitalize="none"
                  autoCorrect="off"
                  onKeyDown={(e) => e.key === "Enter" && handleSendPin()}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button className="w-full gap-2" onClick={handleSendPin} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("forgotPw.sendPin")}
              </Button>

              <button
                type="button"
                className="w-full text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline text-center"
                onClick={() => {
                  handleClose();
                  onSwitchToUsername();
                }}
              >
                {t("login.forgotUsername")}
              </button>
            </>
          )}

          {/* Step: PIN */}
          {step === "pin" && (
            <>
              <div className="flex flex-col items-center gap-3">
                <InputOTP
                  maxLength={6}
                  value={pin}
                  onChange={(val) => {
                    setPin(val);
                    setError("");
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
                <p className="text-xs text-muted-foreground">{t("forgotPw.pinExpiry")}</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button className="w-full gap-2" onClick={handleVerifyPin} disabled={loading || pin.length !== 6}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("forgotPw.verifyPin")}
              </Button>

              <button
                type="button"
                className="flex items-center justify-center gap-1 w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                onClick={() => {
                  setPin("");
                  setError("");
                  handleSendPin();
                }}
              >
                {t("forgotPw.resendPin")}
              </button>
            </>
          )}

          {/* Step: New Password */}
          {step === "new-password" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("forgotPw.newPassword")}</Label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    className="pr-9"
                    placeholder={t("forgotPw.newPassword.placeholder")}
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowNew(!showNew)}
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{t("forgotPw.confirmPassword")}</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    className="pr-9"
                    placeholder={t("forgotPw.confirmPassword.placeholder")}
                    onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button className="w-full gap-2" onClick={handleResetPassword} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("forgotPw.resetPassword")}
              </Button>
            </>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle2 className="h-12 w-12 text-success" />
              <p className="text-sm text-center font-medium">{t("forgotPw.success")}</p>
              <Button className="w-full gap-2" onClick={handleClose}>
                <ArrowLeft className="h-4 w-4" />
                {t("forgotPw.backToLogin")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
