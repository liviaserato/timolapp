import { Link } from "react-router-dom";
import { FileText, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";
import timolLogo from "@/assets/logo-timol-azul-escuro.svg";

export const ContractScreen = () => {
  const { t } = useLanguage();

  const formalizationSteps = [
    t("contract.step1"),
    t("contract.step2"),
    t("contract.step3"),
  ];

  return (
    <div className="min-h-screen bg-muted/20 px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <img src={timolLogo} alt="Timol" className="h-10" />
          <Button asChild variant="outline" size="sm">
            <Link to="/cadastro">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("contract.back")}
            </Link>
          </Button>
        </div>

        <Card className="border-border/60 bg-card/90 shadow-sm">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                {t("contract.notice")}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                  {t("contract.title")}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {t("contract.intro")}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 sm:p-5">
              <p className="text-sm font-medium text-foreground">
                {t("contract.formalization")}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {formalizationSteps.map((step) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
