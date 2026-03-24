import { useLanguage } from "@/i18n/LanguageContext";
import { Construction } from "lucide-react";

export default function InternalProdutos() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Construction className="h-16 w-16 text-muted-foreground/40" />
      <h1 className="text-2xl font-bold text-primary">{t("nav.produtos")}</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        Catálogo de produtos, gestão de estoque, preços e kits disponíveis para a rede.
      </p>
    </div>
  );
}
