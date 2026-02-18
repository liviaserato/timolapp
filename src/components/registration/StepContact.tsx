import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCountryByDialCode } from "@/data/countries";

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export const StepContact = ({ data, onChange, errors }: Props) => {
  const { t } = useLanguage();

  const detectedCountry = getCountryByDialCode(data.phone || "");

  const handlePhoneChange = (val: string) => {
    onChange("phone", val);
    const country = getCountryByDialCode(val);
    if (country) {
      // Auto-fill country in address step data
      onChange("countryDetected", country.iso2);
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
        <div className="relative">
          {detectedCountry && (
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="text-xl leading-none" title={detectedCountry.nameEn}>
                {detectedCountry.flag}
              </span>
            </div>
          )}
          <Input
            id="phone"
            placeholder={t("step2.phone.placeholder")}
            value={data.phone || ""}
            onChange={(e) => handlePhoneChange(e.target.value)}
            maxLength={20}
            className={detectedCountry ? "pl-10" : ""}
          />
        </div>
        {detectedCountry && (
          <p className="text-xs text-muted-foreground">
            {detectedCountry.flag} {detectedCountry.nameEn} ({detectedCountry.dialCode})
          </p>
        )}
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>
    </div>
  );
};
