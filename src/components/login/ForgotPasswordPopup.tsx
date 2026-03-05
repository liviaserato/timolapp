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
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

type Step = "identifier" | "pin" | "new-password" | "success";
type EmailValidationState = "idle" | "success" | "error";

interface Props {
  open: boolean;
  onClose: () => void;
  onSwitchToUsername: () => void;
}

async function extractFunctionErrorCode(error: unknown): Promise<string | null> {
  const context =
    error && typeof error === "object" && "context" in error
      ? (error as { context?: unknown }).context
      : null;

  if (!(context instanceof Response)) {
    return null;
  }

  const payload = await context.json().catch(() => null);
  return payload && typeof payload === "object" && "error" in payload
    ? String(payload.error)
    : null;
}

export const ForgotPasswordPopup = ({ open, onClose, onSwitchToUsername }: Props) => {
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [emailValidationState, setEmailValidationState] = useState<EmailValidationState>("idle");
  const [emailValidationMessage, setEmailValidationMessage] = useState("");
  const [emailValidationLoading, setEmailValidationLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pinSent, setPinSent] = useState(false);
  const [showExpiryHint, setShowExpiryHint] = useState(false);
  const [resendHint, setResendHint] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const showEmailValidation = Boolean(maskedEmail);
  const emailValidated = emailValidationState === "success" && Boolean(confirmedEmail);

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

  const getErrorMessage = useCallback(
    (code: string | null, fallbackKey = "forgotPw.error.generic") => {
      switch (code) {
        case "not_found":
          return t("forgotPw.error.notFound");
        case "email_required":
          return t("forgotPw.error.emailRequired");
        case "email_mismatch":
          return t("forgotPw.error.emailMismatch");
        case "email_unavailable":
          return t("forgotPw.error.emailUnavailable");
        case "pin_expired":
        case "expired_token":
        case "invalid_token":
          return t("forgotPw.error.pinExpired");
        case "replaced_pin":
        case "pin_used":
          return t("forgotPw.error.pinReplaced");
        case "invalid_pin":
          return t("forgotPw.error.invalidPin");
        case "update_failed":
          return t("forgotPw.error.resetFailed");
        default:
          return t(fallbackKey);
      }
    },
    [t]
  );

  const resetEmailValidation = useCallback(() => {
    setMaskedEmail("");
    setEmailConfirmation("");
    setConfirmedEmail("");
    setEmailValidationState("idle");
    setEmailValidationMessage("");
    setEmailValidationLoading(false);
  }, []);

  const resetAll = useCallback(() => {
    setStep("identifier");
    setIdentifier("");
    resetEmailValidation();
    setPin("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
    setShowNew(false);
    setShowConfirm(false);
    setError("");
    setLoading(false);
    setPinSent(false);
    setShowExpiryHint(false);
    setResendHint(false);
    setResendCooldown(0);
  }, [resetEmailValidation]);

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleValidateUsername = async () => {
    const normalizedIdentifier = identifier.trim().toLowerCase();

    if (!normalizedIdentifier) {
      setError(t("forgotPw.error.identifierRequired"));
      return;
    }

    setLoading(true);
    setError("");
    resetEmailValidation();

    try {
      const { data, error: fnError } = await supabase.functions.invoke("forgot-password", {
        body: {
          action: "validate-username",
          username: normalizedIdentifier,
        },
      });

      if (fnError) {
        const errorCode = await extractFunctionErrorCode(fnError);
        setError(getErrorMessage(errorCode));
        return;
      }

      if (!data?.masked_email) {
        setError(t("forgotPw.error.generic"));
        return;
      }

      setIdentifier(normalizedIdentifier);
      setMaskedEmail(String(data.masked_email));
    } catch {
      setError(t("forgotPw.error.generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleValidateEmail = async () => {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const normalizedEmail = emailConfirmation.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailValidationState("error");
      setEmailValidationMessage(t("forgotPw.error.emailRequired"));
      setConfirmedEmail("");
      return;
    }

    setEmailValidationLoading(true);
    setError("");
    setEmailValidationState("idle");
    setEmailValidationMessage("");

    try {
      const { error: fnError } = await supabase.functions.invoke("forgot-password", {
        body: {
          action: "validate-email",
          username: normalizedIdentifier,
          email: normalizedEmail,
        },
      });

      if (fnError) {
        const errorCode = await extractFunctionErrorCode(fnError);
        const message = getErrorMessage(errorCode);

        if (errorCode === "email_required" || errorCode === "email_mismatch") {
          setEmailValidationState("error");
          setEmailValidationMessage(message);
          setConfirmedEmail("");
          return;
        }

        setError(message);
        return;
      }

      setConfirmedEmail(normalizedEmail);
      setEmailValidationState("success");
      setEmailValidationMessage(t("forgotPw.emailValidation.success"));
    } catch {
      setError(t("forgotPw.error.generic"));
    } finally {
      setEmailValidationLoading(false);
    }
  };

  const requestPin = useCallback(
    async (showResendMessage = false) => {
      const normalizedIdentifier = identifier.trim().toLowerCase();

      if (!normalizedIdentifier) {
        setError(t("forgotPw.error.identifierRequired"));
        return;
      }

      if (!confirmedEmail) {
        setEmailValidationState("error");
        setEmailValidationMessage(t("forgotPw.error.emailRequired"));
        return;
      }

      setLoading(true);
      setError("");
      setResendHint(false);
      setShowExpiryHint(false);

      try {
        const { error: fnError } = await supabase.functions.invoke("forgot-password", {
          body: {
            action: "send-pin",
            username: normalizedIdentifier,
            email: confirmedEmail,
          },
        });

        if (fnError) {
          const errorCode = await extractFunctionErrorCode(fnError);
          const message = getErrorMessage(errorCode);

          if (errorCode === "email_required" || errorCode === "email_mismatch") {
            setEmailValidationState("error");
            setEmailValidationMessage(message);
            setConfirmedEmail("");
            return;
          }

          setError(message);
          return;
        }

        setIdentifier(normalizedIdentifier);
        setPin("");
        setResetToken("");
        setPinSent(true);
        setShowExpiryHint(true);
        setResendCooldown(60);
        setStep("pin");

        if (showResendMessage) {
          setResendHint(true);
          window.setTimeout(() => setResendHint(false), 10000);
        }
      } catch {
        setError(t("forgotPw.error.generic"));
      } finally {
        setLoading(false);
      }
    },
    [confirmedEmail, getErrorMessage, identifier, t]
  );

  const handleSendPin = async () => {
    await requestPin(false);
  };

  const handleVerifyPin = async (pinValue = pin) => {
    if (pinValue.length !== 6) {
      setError(t("forgotPw.error.pinLength"));
      setShowExpiryHint(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-reset-pin", {
        body: {
          identifier: identifier.trim(),
          pin: pinValue,
        },
      });

      if (fnError) {
        const errorCode = await extractFunctionErrorCode(fnError);
        setError(getErrorMessage(errorCode));
        setShowExpiryHint(false);
        return;
      }

      if (!data?.reset_token) {
        setError(t("forgotPw.error.generic"));
        setShowExpiryHint(false);
        return;
      }

      setResetToken(String(data.reset_token));
      setStep("new-password");
    } catch {
      setError(t("forgotPw.error.generic"));
      setShowExpiryHint(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError(t("forgotPw.error.passwordMin"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("forgotPw.error.passwordMismatch"));
      return;
    }

    if (!resetToken) {
      setError(t("forgotPw.error.generic"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: fnError } = await supabase.functions.invoke("reset-password", {
        body: {
          reset_token: resetToken,
          new_password: newPassword,
        },
      });

      if (fnError) {
        const errorCode = await extractFunctionErrorCode(fnError);

        if (errorCode === "expired_token" || errorCode === "invalid_token") {
          setStep("pin");
          setPin("");
          setResetToken("");
          setShowExpiryHint(false);
        }

        setError(getErrorMessage(errorCode, "forgotPw.error.resetFailed"));
        return;
      }

      setStep("success");
    } catch {
      setError(t("forgotPw.error.resetFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    if (resendCooldown > 0 || loading) return;
    await requestPin(true);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm mx-auto rounded-xl">
        <DialogHeader className="items-center space-y-2">
          <img src={timolLogoDark} alt="Timol" className="h-8 mx-auto" />
          <DialogTitle className="text-lg font-bold text-primary">
            {step === "success"
              ? t("forgotPw.successTitle")
              : step === "new-password"
                ? t("forgotPw.changePasswordTitle")
                : t("forgotPw.title")}
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
                    <button
                      type="button"
                      className="inline-flex ml-1 align-middle text-muted-foreground hover:text-primary transition-colors"
                    >
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
                    resetEmailValidation();
                  }}
                  autoCapitalize="none"
                  autoCorrect="off"
                  onKeyDown={(e) => e.key === "Enter" && !showEmailValidation && void handleValidateUsername()}
                />
              </div>

              {showEmailValidation && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">
                    {t("forgotPw.emailValidationHint")}
                  </p>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {t("forgotPw.maskedEmailLabel")}
                    </p>
                    <p className="text-sm font-medium text-foreground break-all">{maskedEmail}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fp-email" className="text-xs">
                      {t("forgotPw.emailValidationLabel")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="fp-email"
                        type="email"
                        placeholder={t("forgotPw.emailValidation.placeholder")}
                        value={emailConfirmation}
                        onChange={(e) => {
                          setEmailConfirmation(e.target.value);
                          setError("");
                          setConfirmedEmail("");
                          setEmailValidationState("idle");
                          setEmailValidationMessage("");
                        }}
                        autoCapitalize="none"
                        autoCorrect="off"
                        className="pr-24"
                        onKeyDown={(e) => e.key === "Enter" && void handleValidateEmail()}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute right-1 top-1/2 h-8 -translate-y-1/2 px-3 text-xs"
                        onClick={() => void handleValidateEmail()}
                        disabled={emailValidationLoading || !emailConfirmation.trim()}
                      >
                        {emailValidationLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          t("forgotPw.validateEmail")
                        )}
                      </Button>
                    </div>
                    {emailValidationState !== "idle" && emailValidationMessage && (
                      <p
                        className={`text-xs ${
                          emailValidationState === "success" ? "text-success" : "text-destructive"
                        }`}
                      >
                        {emailValidationMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs text-destructive text-center">{error}</p>
              )}

              {!showEmailValidation ? (
                <Button className="w-full gap-2" onClick={() => void handleValidateUsername()} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("forgotPw.startReset")}
                </Button>
              ) : (
                <Button className="w-full gap-2" onClick={handleSendPin} disabled={loading || !emailValidated}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("forgotPw.sendPin")}
                </Button>
              )}

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
                    if (val.length === 6) void handleVerifyPin(val);
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

              <Button
                className="w-full gap-2"
                onClick={() => void handleVerifyPin()}
                disabled={loading || pin.length !== 6}
                onKeyDown={(e) => e.key === "Enter" && pin.length === 6 && void handleVerifyPin()}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("forgotPw.verifyPin")}
              </Button>

              {showExpiryHint && !error && (
                <p className="text-xs text-muted-foreground text-center">
                  {t("forgotPw.pinExpiry")}
                </p>
              )}

              {error && (
                <p className="text-xs text-destructive text-center">{error}</p>
              )}

              {pinSent && (
                <button
                  type="button"
                  className={`flex items-center justify-center gap-1 w-full text-xs transition-colors ${
                    resendCooldown > 0 || loading
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  onClick={() => void handleResendPin()}
                  disabled={resendCooldown > 0 || loading}
                  aria-label={t("forgotPw.resendPinAria")}
                >
                  {t("forgotPw.resendPin")}
                  {resendCooldown > 0 && ` (${resendCooldown}s)`}
                </button>
              )}

              {resendHint && (
                <p className="text-xs text-success text-center">
                  {t("forgotPw.resendSuccess")}
                </p>
              )}
            </>
          )}

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
                    onKeyDown={(e) => e.key === "Enter" && void handleResetPassword()}
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
