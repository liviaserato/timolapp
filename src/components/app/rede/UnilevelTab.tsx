import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Users, Target, TrendingUp, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MemberDetailDialog } from "./MemberDetailDialog";
import { mockUnilevelMembers, mockUnilevelSummary, NetworkMember, qualificationConfig } from "./mock-data";

interface Props {
  searchQuery: string;
}

export function UnilevelTab({ searchQuery }: Props) {
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([1]));
  const [selectedMember, setSelectedMember] = useState<NetworkMember | null>(null);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return mockUnilevelMembers;
    const q = searchQuery.toLowerCase();
    return mockUnilevelMembers.filter(
      (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const levels = useMemo(() => {
    const map = new Map<number, NetworkMember[]>();
    filteredMembers.forEach((m) => {
      const lvl = m.level ?? 1;
      if (!map.has(lvl)) map.set(lvl, []);
      map.get(lvl)!.push(m);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [filteredMembers]);

  const toggleLevel = (lvl: number) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      next.has(lvl) ? next.delete(lvl) : next.add(lvl);
      return next;
    });
  };

  const summaryItems = [
    { label: "Total de Membros", value: mockUnilevelSummary.totalMembers.toString(), icon: Users },
    { label: "Membros Ativos", value: mockUnilevelSummary.activeMembers.toString(), icon: UserCheck },
    { label: "Pontos Acumulados", value: mockUnilevelSummary.accumulatedPoints.toLocaleString("pt-BR"), icon: Target },
    { label: "Desempenho", value: mockUnilevelSummary.recentPerformance, icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryItems.map((item) => (
          <Card key={item.label} className="overflow-hidden">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2 text-primary">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">{item.label}</p>
                <p className="text-sm font-bold truncate">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Levels */}
      <div className="space-y-2">
        {levels.length === 0 && (
          <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">Nenhum membro encontrado.</CardContent></Card>
        )}
        {levels.map(([lvl, members]) => {
          const isOpen = expandedLevels.has(lvl);
          return (
            <Card key={lvl}>
              <button
                onClick={() => toggleLevel(lvl)}
                className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors rounded-t-lg"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-semibold">Nível {lvl}</span>
                  <Badge variant="secondary" className="text-[10px]">{members.length}</Badge>
                </div>
              </button>
              {isOpen && (
                <CardContent className="p-0">
                  <div className="divide-y">
                    {members.map((m) => {
                      const q = qualificationConfig[m.qualification] ?? qualificationConfig.consultor;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMember(m)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent/40 transition-colors"
                        >
                          <span style={{ color: q.color }} className="text-sm font-bold shrink-0">{q.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium truncate">{m.name}</span>
                              <Badge variant={m.active ? "default" : "secondary"} className={cn("text-[9px] px-1 py-0 h-4 shrink-0", m.active && "bg-success text-success-foreground")}>
                                {m.active ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            <span className="text-[11px] text-muted-foreground">ID {m.id} · {m.volume.toLocaleString("pt-BR")} pts</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <MemberDetailDialog member={selectedMember} open={!!selectedMember} onOpenChange={(o) => !o && setSelectedMember(null)} />
    </div>
  );
}
