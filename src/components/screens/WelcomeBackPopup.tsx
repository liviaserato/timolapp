import { useLanguage } from "@/i18n/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const WelcomeBackPopup = ({ open, onClose }: Props) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="items-center space-y-3">
          <img src={timolLogoDark} alt="Timol" className="h-10 mx-auto" />
          <DialogTitle className="text-lg">{t("welcomeBack.title")}</DialogTitle>
          <DialogDescription className="text-sm">
            {t("welcomeBack.description")}
          </DialogDescription>
        </DialogHeader>
        <Button onClick={onClose} className="w-full mt-2">
          {t("welcomeBack.button")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
