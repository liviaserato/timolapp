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
  const { language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [acceptPromotions, setAcceptPromotions] = useState(true);
  const [contactPreference, setContactPreference] = useState("whatsapp");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie suas preferências</p>
      </header>

      {/* Language */}
      <DashboardCard icon={Globe} title="Idioma">
        <p className="text-xs text-muted-foreground mb-3">
          Selecione o idioma em que deseja visualizar o aplicativo.
        </p>
        <div className="flex flex-wrap gap-2">
          {languageOptions.map((opt) => (
            <button
              key={opt.code}
              onClick={() => setLanguage(opt.code)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
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
      <DashboardCard icon={Bell} title="Notificações e Comunicações">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="notifications" className="text-sm font-medium">Permitir notificações</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Receba alertas sobre pedidos, bônus e atualizações da rede.
              </p>
            </div>
            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="border-t border-border" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="promotions" className="text-sm font-medium">Aceitar receber promoções</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Receba ofertas exclusivas, novidades de produtos e campanhas especiais.
              </p>
            </div>
            <Switch id="promotions" checked={acceptPromotions} onCheckedChange={setAcceptPromotions} />
          </div>
        </div>
      </DashboardCard>

      {/* Contact preference */}
      <DashboardCard icon={MessageSquare} title="Preferência de Contato">
        <p className="text-xs text-muted-foreground mb-3">
          Como você prefere ser contactado pela equipe Timol?
        </p>
        <RadioGroup value={contactPreference} onValueChange={setContactPreference} className="flex flex-wrap gap-2">
          {[
            { value: "email", label: "E-mail" },
            { value: "phone", label: "Ligação" },
            { value: "whatsapp", label: "WhatsApp" },
          ].map((opt) => (
            <label
              key={opt.value}
              htmlFor={`contact-${opt.value}`}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
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