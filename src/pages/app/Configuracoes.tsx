import { useState } from "react";
import { Settings, Globe, Bell, MessageSquare, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
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
  const [contactPreference, setContactPreference] = useState("whatsapp");
  const [acceptPromotions, setAcceptPromotions] = useState(true);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas preferências</p>
        </div>
      </div>

      {/* Language */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Idioma do aplicativo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3">
            Selecione o idioma em que deseja visualizar o aplicativo.
          </p>
          <div className="flex gap-2">
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
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications" className="text-sm font-medium">Permitir notificações</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Receba alertas sobre pedidos, bônus e atualizações da rede.
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact preference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Preferência de contato
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3">
            Como você prefere ser contactado pela equipe Timol?
          </p>
          <RadioGroup value={contactPreference} onValueChange={setContactPreference} className="space-y-2.5">
            <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
              <RadioGroupItem value="email" id="contact-email" />
              <Label htmlFor="contact-email" className="flex-1 cursor-pointer">
                <span className="text-sm font-medium">E-mail</span>
                <p className="text-xs text-muted-foreground">Receba comunicações por e-mail.</p>
              </Label>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
              <RadioGroupItem value="phone" id="contact-phone" />
              <Label htmlFor="contact-phone" className="flex-1 cursor-pointer">
                <span className="text-sm font-medium">Ligação</span>
                <p className="text-xs text-muted-foreground">Receba contato por telefone.</p>
              </Label>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
              <RadioGroupItem value="whatsapp" id="contact-whatsapp" />
              <Label htmlFor="contact-whatsapp" className="flex-1 cursor-pointer">
                <span className="text-sm font-medium">WhatsApp</span>
                <p className="text-xs text-muted-foreground">Receba mensagens pelo WhatsApp.</p>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Promotions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            Promoções
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="promotions" className="text-sm font-medium">Aceitar receber promoções</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Receba ofertas exclusivas, novidades de produtos e campanhas especiais.
              </p>
            </div>
            <Switch
              id="promotions"
              checked={acceptPromotions}
              onCheckedChange={setAcceptPromotions}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}