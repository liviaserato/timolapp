import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

// CPF mask: 000.000.000-00
function maskCPF(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export const StepPersonal = ({ data, onChange, errors }: Props) => {
  const { t } = useLanguage();
  const isForeigner = data.foreignerNoCpf === "true";

  const genderOptions = [
    { value: "male", label: t("step1.gender.male") },
    { value: "female", label: t("step1.gender.female") },
    { value: "other", label: t("step1.gender.other") },
    { value: "preferNotSay", label: t("step1.gender.preferNotSay") },
  ];

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  return (
    <div className="space-y-4">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">{t("step1.fullName")}</Label>
        <Input
          id="fullName"
          placeholder={t("step1.fullName.placeholder")}
          value={data.fullName || ""}
          onChange={(e) => onChange("fullName", e.target.value)}
        />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
      </div>

      {/* Birth Date — max = 18 years ago */}
      <div className="space-y-2">
        <Label htmlFor="birthDate">{t("step1.birthDate")}</Label>
        <Input
          id="birthDate"
          type="date"
          max={maxDate}
          value={data.birthDate || ""}
          onChange={(e) => onChange("birthDate", e.target.value)}
        />
        {errors.birthDate && (
          <p className="text-sm text-destructive flex items-start gap-1.5">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            {errors.birthDate}
          </p>
        )}
      </div>

      {/* Document / CPF */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Label htmlFor="document">
            {isForeigner ? t("step1.document.foreigner") : t("step1.document")}
          </Label>
          <div className="flex items-center gap-2">
            <Checkbox
              id="foreignerNoCpf"
              checked={isForeigner}
              onCheckedChange={(v) => {
                onChange("foreignerNoCpf", v ? "true" : "false");
                if (v) onChange("document", "");
              }}
            />
            <Label htmlFor="foreignerNoCpf" className="text-sm font-normal cursor-pointer">
              {t("step1.notBrazilian")}
            </Label>
          </div>
        </div>

        <Input
          id="document"
          placeholder={isForeigner ? t("step1.document.foreigner.placeholder") : t("step1.document.placeholder")}
          value={data.document || ""}
          onChange={(e) =>
            onChange(
              "document",
              isForeigner ? e.target.value : maskCPF(e.target.value)
            )
          }
          maxLength={isForeigner ? 50 : 14}
        />

        {isForeigner && (
          <div className="rounded-md border bg-amber-50 border-amber-200 px-3 py-2 text-sm text-amber-700 flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{t("step1.foreignerHint")}</span>
          </div>
        )}
        {errors.document && <p className="text-sm text-destructive">{errors.document}</p>}
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label>{t("step1.gender")}</Label>
        <RadioGroup
          value={data.gender || ""}
          onValueChange={(value) => onChange("gender", value)}
          className="flex flex-wrap gap-4"
        >
          {genderOptions.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.value} id={`gender-${opt.value}`} />
              <Label htmlFor={`gender-${opt.value}`} className="font-normal cursor-pointer">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
      </div>
    </div>
  );
};
