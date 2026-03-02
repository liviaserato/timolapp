import { useState, useEffect, useCallback } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

type Step = "identifier" | "pin" | "new-password" | "success";

const MOCK_USER = "liviaserato";
const MOCK_PIN = "123456";

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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // PIN sent state
  const [pinSent, setPinSent] = useState(false);
  const [showExpiryHint, setShowExpiryHint] = useState(false);
  const [resendHint, setResendHint] = useState(false);

  // Resend cooldown (60s)
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resetAll = useCallback(() => {
    setStep("identifier");
    setIdentifier("");
    setPin("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNew(false);
    setShowConfirm(false);
    setError("");
    setLoading(false);
    setPinSent(false);
    setShowExpiryHint(false);
    setResendHint(false);
    setResendCooldown(0);
  }, []);

  const handleClose = () => {
    resetAll();
    onClose();
  };

  // Step 1: Send PIN (mock)
  const handleSendPin = async () => {
    if (!identifier.trim()) {
      setError(t("forgotPw.error.identifierRequired"));
      return;
    }
    setLoading(true);
    setError("");
    setShowExpiryHint(false);
    setTimeout(() => {
      setLoading(false);
      setPinSent(true);
      setShowExpiryHint(true);
      setResendCooldown(60);
      setStep("pin");
    }, 800);
  };

  // Step 2: Verify PIN (mock)
  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      setError(t("forgotPw.error.pinLength"));
      setShowExpiryHint(false);
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      if (identifier.trim().toLowerCase() === MOCK_USER && pin === MOCK_PIN) {
        setStep("new-password");
      } else {
        setError(t("forgotPw.error.invalidPin"));
        setShowExpiryHint(false);
      }
    }, 800);
  };

  // Step 3: Set new password (mock)
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
    setTimeout(() => {
      setLoading(false);
      setStep("success");
    }, 800);
  };

  const handleResendPin = () => {
    if (resendCooldown > 0) return;
    setPin("");
    setError("");
    setShowExpiryHint(true);
    setResendHint(true);
    setResendCooldown(60);
    setTimeout(() => setResendHint(false), 10000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm mx-auto rounded-xl">
        <DialogHeader className="items-center space-y-2">
          <img src={timolLogoDark} alt="Timol" className="h-8 mx-auto" />
          <DialogTitle className="text-lg font-bold text-primary">
            {step === "success" ? t("forgotPw.successTitle") : t("forgotPw.title")}
          </DialogTitle>
          {step === "identifier" && (
            <DialogDescription className="text-xs text-center">
              {t("forgotPw.descLine1")}
              <br />
              {t("forgotPw.descLine2")}
            </DialogDescription>
          )}
          {step === "pin" && (
            <DialogDescription className="text-xs text-center">
              {t("forgotPw.pinSentLine1")}
              <br />
              {t("forgotPw.pinSentLine2")}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex ml-1 align-middle text-muted-foreground hover:text-primary transition-colors">
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[260px] text-xs leading-relaxed">
                    {t("forgotPw.pinHelpTooltip")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                <p className="text-xs text-destructive text-center">{error}</p>
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
                  autoFocus
                  maxLength={6}
                  value={pin}
                  onChange={(val) => {
                    setPin(val);
                    setError("");
                  }}
                  onComplete={(val) => {
                    if (val.length === 6) handleVerifyPin();
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

              {/* Verify PIN button */}
              <Button
                className="w-full gap-2"
                onClick={handleVerifyPin}
                disabled={loading || pin.length !== 6}
                onKeyDown={(e) => e.key === "Enter" && pin.length === 6 && handleVerifyPin()}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("forgotPw.verifyPin")}
              </Button>

              {/* Expiry hint - shown after send/resend, hidden on error */}
              {showExpiryHint && !error && (
                <p className="text-xs text-muted-foreground text-center">
                  {t("forgotPw.pinExpiry")}
                </p>
              )}

              {/* Error hint - centered */}
              {error && (
                <p className="text-xs text-destructive text-center">{error}</p>
              )}

              {/* Resend PIN button - only after first send */}
              {pinSent && (
                <button
                  type="button"
                  className={`flex items-center justify-center gap-1 w-full text-xs transition-colors ${
                    resendCooldown > 0
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  onClick={handleResendPin}
                  disabled={resendCooldown > 0}
                  aria-label={t("forgotPw.resendPinAria")}
                >
                  {t("forgotPw.resendPin")}
                  {resendCooldown > 0 && ` (${resendCooldown}s)`}
                </button>
              )}

              {/* Resend success hint - centered, below resend button */}
              {resendHint && (
                <p className="text-xs text-success text-center">
                  {t("forgotPw.resendSuccess")}
                </p>
              )}
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
                <p className="text-xs text-destructive text-center">{error}</p>
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
              <p className="text-sm text-center font-medium">{t("forgotPw.successDesc")}</p>
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
