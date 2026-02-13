import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { Globe } from "lucide-react";

const languages: { code: Language; label: string }[] = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      <Globe className="h-4 w-4 text-muted-foreground" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
            language === lang.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
