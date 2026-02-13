import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export const StepAddress = ({ data, onChange, errors }: Props) => {
  const { t } = useLanguage();

  const fields = [
    { key: "zipCode", prefix: "step3.zipCode", maxLength: 10 },
    { key: "street", prefix: "step3.street", maxLength: 200 },
    { key: "number", prefix: "step3.number", maxLength: 10 },
    { key: "complement", prefix: "step3.complement", maxLength: 100 },
    { key: "neighborhood", prefix: "step3.neighborhood", maxLength: 100 },
    { key: "city", prefix: "step3.city", maxLength: 100 },
    { key: "state", prefix: "step3.state", maxLength: 100 },
    { key: "country", prefix: "step3.country", maxLength: 100 },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{t(field.prefix)}</Label>
          <Input
            id={field.key}
            placeholder={t(`${field.prefix}.placeholder`)}
            value={data[field.key] || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            maxLength={field.maxLength}
          />
          {errors[field.key] && <p className="text-sm text-destructive">{errors[field.key]}</p>}
        </div>
      ))}
    </div>
  );
};
