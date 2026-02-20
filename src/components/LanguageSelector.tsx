import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { Globe } from "lucide-react";

const languages: { code: Language; key: string }[] = [
  { code: "pt", key: "lang.pt" },
  { code: "en", key: "lang.en" },
  { code: "es", key: "lang.es" },
];

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      <Globe className="h-4 w-4 text-muted-foreground" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
            language === lang.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {t(lang.key)}
        </button>
      ))}
    </div>
  );
};
