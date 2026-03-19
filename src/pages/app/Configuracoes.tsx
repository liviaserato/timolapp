import { useState } from "react";
import { Globe, Bell, MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DashboardCard } from "@/components/app/DashboardCard";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";

const languageOptions: { code: Language; label: string; flag: string }[] = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export default function Configuracoes() {
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [acceptPromotions, setAcceptPromotions] = useState(true);
  const [contactPreference, setContactPreference] = useState("whatsapp");

  return (
    <div className="space-y-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">{t("config.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("config.subtitle")}</p>
      </header>

      {/* Language */}
      <DashboardCard icon={Globe} title={t("config.language")}>
        <p className="text-xs text-muted-foreground mb-3">
          {t("config.languageDesc")}
        </p>
        <div className="flex flex-wrap gap-2">
          {languageOptions.map((opt) => (
            <button
              key={opt.code}
              onClick={() => setLanguage(opt.code)}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-lg border px-2.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                language === opt.code
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-accent/40"
              }`}
            >
              <span className="text-base">{opt.flag}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </DashboardCard>

      {/* Notifications & Promotions */}
      <DashboardCard icon={Bell} title={t("config.notifications")}>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="notifications" className="text-sm font-medium">{t("config.allowNotifications")}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("config.notificationsDesc")}
              </p>
            </div>
            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="border-t border-border" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="promotions" className="text-sm font-medium">{t("config.acceptPromotions")}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("config.promotionsDesc")}
              </p>
            </div>
            <Switch id="promotions" checked={acceptPromotions} onCheckedChange={setAcceptPromotions} />
          </div>
        </div>
      </DashboardCard>

      {/* Contact preference */}
      <DashboardCard icon={MessageSquare} title={t("config.contactPreference")}>
        <p className="text-xs text-muted-foreground mb-3">
          {t("config.contactPreferenceDesc")}
        </p>
        <RadioGroup value={contactPreference} onValueChange={setContactPreference} className="flex flex-wrap gap-2">
          {[
            { value: "email", label: "E-mail" },
            { value: "phone", label: t("config.call") },
            { value: "whatsapp", label: "WhatsApp" },
          ].map((opt) => (
            <label
              key={opt.value}
              htmlFor={`contact-${opt.value}`}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-lg border px-2.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                contactPreference === opt.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-accent/40"
              }`}
            >
              <RadioGroupItem value={opt.value} id={`contact-${opt.value}`} />
              {opt.label}
            </label>
          ))}
        </RadioGroup>
      </DashboardCard>
    </div>
  );
}
