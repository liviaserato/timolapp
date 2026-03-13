import { useState, useRef } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { checkEmail } from "@/lib/api/people";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  onEmailStatusChange?: (status: "idle" | "checking" | "available" | "taken") => void;
}

export const StepContact = ({ data, onChange, errors, onEmailStatusChange }: Props) => {
  const { t } = useLanguage();
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [emailTimer, setEmailTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const emailFormatValid = data.email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) : true;

  const handleEmailChange = (val: string) => {
    onChange("email", val);
    setEmailStatus("idle");
    onEmailStatusChange?.("idle");
    if (emailTimer) clearTimeout(emailTimer);
    abortRef.current?.abort();

    const trimmed = val.trim();
    if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailStatus("checking");
      onEmailStatusChange?.("checking");
      const timer = setTimeout(async () => {
        const controller = new AbortController();
        abortRef.current = controller;
        try {
          const res = await checkEmail(trimmed, controller.signal);
          if (!controller.signal.aborted) {
            const status = res.isAvailable ? "available" : "taken";
            setEmailStatus(status);
            onEmailStatusChange?.(status);
          }
        } catch (err: any) {
          if (err?.name !== "AbortError" && !controller.signal.aborted) {
            setEmailStatus("available");
            onEmailStatusChange?.("available");
          }
        }
      }, 600);
      setEmailTimer(timer);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("step2.email")}</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder={t("step2.email.placeholder")}
            value={data.email || ""}
            onChange={(e) => handleEmailChange(e.target.value)}
            maxLength={255}
            className={[
              "pr-9",
              emailStatus === "available" ? "border-success" : "",
              emailStatus === "taken" ? "border-destructive" : "",
            ].join(" ")}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {emailFormatValid && emailStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {emailFormatValid && emailStatus === "available" && <CheckCircle2 className="h-4 w-4 text-success" />}
            {emailFormatValid && emailStatus === "taken" && <XCircle className="h-4 w-4 text-destructive" />}
          </div>
        </div>
        {emailFormatValid && emailStatus === "available" && !errors.email && (
          <p className="text-xs text-success">{t("step2.email.available")}</p>
        )}
        {emailFormatValid && emailStatus === "taken" && (
          <p className="text-xs text-destructive">{t("step2.email.taken")}</p>
        )}
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">{t("step2.phone")}</Label>
        <PhoneInput
          countryIso2={data.phoneDdi || "BR"}
          number={data.phoneNumber || ""}
          onCountryChange={(iso2) => onChange("phoneDdi", iso2)}
          onNumberChange={(val) => onChange("phoneNumber", val)}
          hasError={!!errors.phoneNumber}
        />
        {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
      </div>
    </div>
  );
};
