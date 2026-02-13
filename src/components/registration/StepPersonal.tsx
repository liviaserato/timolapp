import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export const StepPersonal = ({ data, onChange, errors }: Props) => {
  const { t } = useLanguage();

  const genderOptions = [
    { value: "male", label: t("step1.gender.male") },
    { value: "female", label: t("step1.gender.female") },
    { value: "other", label: t("step1.gender.other") },
    { value: "preferNotSay", label: t("step1.gender.preferNotSay") },
  ];

  return (
    <div className="space-y-4">
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

      <div className="space-y-2">
        <Label htmlFor="birthDate">{t("step1.birthDate")}</Label>
        <Input
          id="birthDate"
          type="date"
          placeholder={t("step1.birthDate.placeholder")}
          value={data.birthDate || ""}
          onChange={(e) => onChange("birthDate", e.target.value)}
        />
        {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="document">{t("step1.document")}</Label>
        <Input
          id="document"
          placeholder={t("step1.document.placeholder")}
          value={data.document || ""}
          onChange={(e) => onChange("document", e.target.value)}
          maxLength={20}
        />
        {errors.document && <p className="text-sm text-destructive">{errors.document}</p>}
      </div>

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
