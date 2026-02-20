import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export const StepContact = ({ data, onChange, errors }: Props) => {
  const { t } = useLanguage();
  const isForeigner = data.foreignerNoCpf === "true";

  // Default +55 for non-foreigners when phone is empty
  const handleFocus = () => {
    if (!isForeigner && !data.phone) {
      onChange("phone", "+55 ");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("step2.email")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("step2.email.placeholder")}
          value={data.email || ""}
          onChange={(e) => onChange("email", e.target.value)}
          maxLength={255}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t("step2.phone")}</Label>
        <Input
          id="phone"
          placeholder={t("step2.phone.placeholder")}
          value={data.phone || ""}
          onFocus={handleFocus}
          onChange={(e) => onChange("phone", e.target.value)}
          maxLength={20}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>
    </div>
  );
};