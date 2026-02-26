import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, AlertTriangle } from "lucide-react";

interface Props {
  onClose: () => void;
}

export const DocumentCheckPopup = ({ onClose }: Props) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t("docCheck.title")}
            </CardTitle>
            <button type="button" onClick={onClose}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-amber-50 border-amber-200 px-4 py-3 text-sm text-amber-800 space-y-2">
            <p className="font-medium">{t("docCheck.exists.line1")}</p>
            <p>{t("docCheck.exists.line2")}</p>
          </div>
          <Button variant="outline" className="w-full" onClick={onClose}>
            {t("docCheck.exists.close")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
