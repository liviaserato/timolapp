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
const MOCK_PIN = "123465";

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
  const [resendHint, setResendHint] = useState(false);

  const resetAll = () => {
    setStep("identifier");
    setIdentifier("");
    setPin("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNew(false);
    setShowConfirm(false);
    setError("");
    setLoading(false);
    setResendHint(false);
  };

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
    // Mock: always succeed
    setTimeout(() => {
      setLoading(false);
      setStep("pin");
    }, 800);
  };

  // Step 2: Verify PIN (mock)
  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      setError(t("forgotPw.error.pinLength"));
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
    setPin("");
    setError("");
    setResendHint(true);
    setTimeout(() => setResendHint(false), 10000);
    // Mock: pretend to resend
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm mx-auto rounded-xl">
        <DialogHeader className="items-center space-y-2">
          <img src={timolLogoDark} alt="Timol" className="h-8 mx-auto" />
          <DialogTitle className="text-lg font-bold text-primary">
            {t("forgotPw.title")}
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
              {t("forgotPw.pinSentConditional")}
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

              {resendHint && (
                <div className="flex items-center gap-2 text-xs text-success">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{t("forgotPw.resendSuccess")}</span>
                </div>
              )}

              <Button className="w-full gap-2" onClick={handleVerifyPin} disabled={loading || pin.length !== 6}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("forgotPw.verifyPin")}
              </Button>

              <button
                type="button"
                className="flex items-center justify-center gap-1 w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                onClick={handleResendPin}
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
