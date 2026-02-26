import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useMemo, useState } from "react";

import { CheckCircle2, XCircle, Loader2, Eye, EyeOff } from "lucide-react";

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  onUsernameStatusChange?: (status: "idle" | "checking" | "available" | "taken") => void;
}

function getPasswordStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 33, label: "weak" };
  if (score <= 3) return { score: 66, label: "medium" };
  return { score: 100, label: "strong" };
}

const strengthColors: Record<string, string> = {
  weak: "bg-destructive",
  medium: "bg-yellow-500",
  strong: "bg-green-500",
};

export const StepLogin = ({ data, onChange, errors, onUsernameStatusChange }: Props) => {
  const { t } = useLanguage();
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameTimer, setUsernameTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = useMemo(
    () => getPasswordStrength(data.password || ""),
    [data.password]
  );

  const USERNAME_MAX = 20;
  const USERNAME_REGEX = /^[a-zA-Z0-9_]*$/;

  const isUsernameFormatValid = data.username ? USERNAME_REGEX.test(data.username) : true;

  const handleUsernameChange = (val: string) => {
    const stripped = val.replace(/\s/g, "");
    const trimmed = stripped.slice(0, USERNAME_MAX);
    onChange("username", trimmed);
    setUsernameStatus("idle");
    onUsernameStatusChange?.("idle");
    if (usernameTimer) clearTimeout(usernameTimer);
    // Only check availability if format is valid
    if (trimmed.length >= 3 && USERNAME_REGEX.test(trimmed)) {
      setUsernameStatus("checking");
      onUsernameStatusChange?.("checking");
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/username-check?username=${encodeURIComponent(trimmed)}`,
            {
              headers: {
                "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                "Content-Type": "application/json",
              },
            }
          );
          if (!res.ok) throw new Error("upstream");
          const result = await res.json();
          // API: exists=true → username already taken, exists=false → available
          const exists = result.exists === true || result.exists === "true";
          const status = exists ? "taken" : "available";
          setUsernameStatus(status);
          onUsernameStatusChange?.(status);
        } catch {
          setUsernameStatus("idle");
          onUsernameStatusChange?.("idle");
        }
      }, 600);
      setUsernameTimer(timer);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">{t("step4.username")}</Label>
        <div className="relative">
          <Input
            id="username"
            placeholder={t("step4.username.placeholder")}
            value={data.username || ""}
            onChange={(e) => handleUsernameChange(e.target.value)}
            maxLength={USERNAME_MAX}
            autoCapitalize="none"
            autoCorrect="off"
            className={[
              "pr-9",
              usernameStatus === "available" ? "border-success" : "",
              usernameStatus === "taken" ? "border-destructive" : "",
            ].join(" ")}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isUsernameFormatValid && usernameStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {isUsernameFormatValid && usernameStatus === "available" && <CheckCircle2 className="h-4 w-4 text-success" />}
            {isUsernameFormatValid && usernameStatus === "taken" && <XCircle className="h-4 w-4 text-destructive" />}
            {!isUsernameFormatValid && data.username && <XCircle className="h-4 w-4 text-destructive" />}
          </div>
        </div>
        {isUsernameFormatValid && usernameStatus === "available" && !errors.username && (
          <p className="text-xs text-success">{t("step4.username.available")}</p>
        )}
        {isUsernameFormatValid && usernameStatus === "taken" && (
          <p className="text-xs text-destructive">{t("step4.username.taken")}</p>
        )}
        {!isUsernameFormatValid && data.username && !errors.username && (
          <p className="text-xs text-destructive">{t("step4.username.invalidChars")}</p>
        )}
        {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("step4.password")}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("step4.password.placeholder")}
            value={data.password || ""}
            onChange={(e) => onChange("password", e.target.value)}
            maxLength={100}
            autoCapitalize="none"
            autoCorrect="off"
            className="pr-9"
          />
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {data.password && (
          <div className="space-y-1">
            <Progress
              value={strength.score}
              className="h-2"
              indicatorClassName={strengthColors[strength.label]}
            />
            <p className="text-xs text-muted-foreground">
              {t(`step4.strength.${strength.label}`)}
            </p>
          </div>
        )}
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("step4.confirmPassword")}</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("step4.confirmPassword.placeholder")}
            value={data.confirmPassword || ""}
            onChange={(e) => onChange("confirmPassword", e.target.value)}
            maxLength={100}
            autoCapitalize="none"
            autoCorrect="off"
            className="pr-9"
          />
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
};