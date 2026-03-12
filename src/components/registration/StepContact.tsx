import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export const StepContact = ({ data, onChange, errors }: Props) => {
  const { t } = useLanguage();

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
