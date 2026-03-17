import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Phone, Calendar, TrendingUp, Network } from "lucide-react";
import { NetworkMember, qualificationConfig } from "./mock-data";

interface Props {
  member: NetworkMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDetailDialog({ member, open, onOpenChange }: Props) {
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
            <span className="text-muted-foreground">Qualificação</span>
            <span className="flex items-center gap-1.5 font-medium" style={{ color: q.color }}>
              <span>{q.icon}</span> {q.label}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={member.active ? "default" : "secondary"} className={member.active ? "bg-success text-success-foreground" : ""}>
              {member.active ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Volume</span>
            <span className="font-medium">{member.volume.toLocaleString("pt-BR")} pts</span>
          </div>

          {member.level !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><Network className="h-3.5 w-3.5" /> Nível</span>
              <span className="font-medium">{member.level}</span>
            </div>
          )}

          {member.city && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Cidade</span>
              <span className="font-medium">{member.city}</span>
            </div>
          )}

          {member.phone && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Telefone</span>
              <span className="font-medium">{member.phone}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Cadastro</span>
            <span className="font-medium">{new Date(member.joinDate).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
