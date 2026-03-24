import { useLanguage } from "@/i18n/LanguageContext";
import { Construction } from "lucide-react";

export default function InternalSuporte() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Construction className="h-16 w-16 text-muted-foreground/40" />
      <h1 className="text-2xl font-bold text-primary">{t("nav.suporte")}</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        Central de tickets, atendimento aos franqueados, FAQ e gestão de chamados internos.
      </p>
    </div>
  );
}
