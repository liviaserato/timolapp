import { useLanguage } from "@/i18n/LanguageContext";
import timolLogo from "@/assets/logo-timol-azul-escuro.svg";

/**
 * Inactive placeholder – kept for future reuse inside the system.
 * No dynamic data is fetched or displayed.
 */
export const ContractScreen = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="max-w-md text-center space-y-4">
        <img src={timolLogo} alt="Timol" className="h-12 mx-auto" />
        <h1 className="text-xl font-bold text-foreground">{t("contract.title")}</h1>
        <p className="text-muted-foreground text-sm">
          Esta página está temporariamente desativada. O contrato será disponibilizado em breve.
        </p>
      </div>
    </div>
  );
};
