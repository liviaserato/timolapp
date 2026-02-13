import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
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

export const StepLogin = ({ data, onChange, errors }: Props) => {
  const { t } = useLanguage();

  const strength = useMemo(
    () => getPasswordStrength(data.password || ""),
    [data.password]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">{t("step4.username")}</Label>
        <Input
          id="username"
          placeholder={t("step4.username.placeholder")}
          value={data.username || ""}
          onChange={(e) => onChange("username", e.target.value)}
          maxLength={50}
        />
        {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("step4.password")}</Label>
        <Input
          id="password"
          type="password"
          placeholder={t("step4.password.placeholder")}
          value={data.password || ""}
          onChange={(e) => onChange("password", e.target.value)}
          maxLength={100}
        />
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
        <Input
          id="confirmPassword"
          type="password"
          placeholder={t("step4.confirmPassword.placeholder")}
          value={data.confirmPassword || ""}
          onChange={(e) => onChange("confirmPassword", e.target.value)}
          maxLength={100}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
};
