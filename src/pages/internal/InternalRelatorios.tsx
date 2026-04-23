import { lazy, Suspense } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FullScreenTimolLoader } from "@/components/ui/full-screen-timol-loader";
import { Construction } from "lucide-react";

const RegistrationReportsTab = lazy(() => import("@/components/internal/RegistrationReportsTab"));
const ProductReportsTab = lazy(() => import("@/components/internal/ProductReportsTab"));

const LazyFallback = () => (
  <FullScreenTimolLoader mode="page" title="Carregando..." className="min-h-[200px] bg-background" />
);

function PlaceholderTab({ label }: { label: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Construction className="h-10 w-10 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">{t("internal.placeholder.underConstruction")}</p>
    </div>
  );
}

const tabs = [
  { value: "cadastro", labelKey: "internal.relatorios.tabCadastro" },
  { value: "financeiro", labelKey: "internal.relatorios.tabFinanceiro" },
  { value: "rede", labelKey: "internal.relatorios.tabRede" },
  { value: "clientes", labelKey: "internal.relatorios.tabClientes" },
  { value: "produtos", labelKey: "internal.relatorios.tabProdutos" },
  { value: "pedidos", labelKey: "internal.relatorios.tabPedidos" },
  { value: "treinamentos", labelKey: "internal.relatorios.tabTreinamentos" },
  { value: "comercial", labelKey: "internal.relatorios.tabComercial" },
  { value: "suporte", labelKey: "internal.relatorios.tabSuporte" },
];

export default function InternalRelatorios() {
  const { t } = useLanguage();

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">{t("nav.relatorios")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("internal.relatorios.desc")}</p>
      </header>

      <Tabs defaultValue="cadastro" className="w-full">
        <TabsList className="w-full h-auto flex-wrap justify-start gap-0.5 bg-muted/50 p-1">
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-3 py-1.5">
              {t(tab.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="cadastro" className="mt-4">
          <Suspense fallback={<LazyFallback />}>
            <RegistrationReportsTab />
          </Suspense>
        </TabsContent>

        {tabs.filter(t => t.value !== "cadastro").map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <PlaceholderTab label={t(tab.labelKey)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
