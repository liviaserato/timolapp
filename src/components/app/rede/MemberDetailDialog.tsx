import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Phone, Calendar, TrendingUp, Network } from "lucide-react";
import { NetworkMember, qualificationConfig } from "./mock-data";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  member: NetworkMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDetailDialog({ member, open, onOpenChange }: Props) {
  const { t } = useLanguage();
  if (!member) return null;
  const q = qualificationConfig[member.qualification] ?? qualificationConfig.consultor;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" />
            {member.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">ID</span>
            <span className="font-medium">{member.id}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("mdd.qualification")}</span>
            <span className="flex items-center gap-1.5 font-medium" style={{ color: q.color }}>
              <span>{q.icon}</span> {q.label}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("mdd.status")}</span>
            <Badge variant={member.active ? "default" : "secondary"} className={member.active ? "bg-success text-success-foreground" : ""}>
              {member.active ? t("mdd.activeLabel") : t("mdd.inactiveLabel")}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> {t("mdd.volume")}</span>
            <span className="font-medium">{member.volume.toLocaleString(t("dash.dateLocale"))} {t("bin.pts")}</span>
          </div>

          {member.level !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><Network className="h-3.5 w-3.5" /> {t("mdd.level")}</span>
              <span className="font-medium">{member.level}</span>
            </div>
          )}

          {member.city && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {t("mdd.city")}</span>
              <span className="font-medium">{member.city}</span>
            </div>
          )}

          {member.phone && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {t("mdd.phone")}</span>
              <span className="font-medium">{member.phone}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {t("mdd.registration")}</span>
            <span className="font-medium">{new Date(member.joinDate).toLocaleDateString(t("dash.dateLocale"))}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
