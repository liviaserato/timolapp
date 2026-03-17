export interface NetworkMember {
  id: string;
  name: string;
  qualification: string;
  active: boolean;
  volume: number;
  joinDate: string;
  phone?: string;
  city?: string;
  level?: number;
  left?: NetworkMember | null;
  right?: NetworkMember | null;
  children?: NetworkMember[];
}

export const qualificationConfig: Record<string, { label: string; icon: string; color: string }> = {
  consultor:    { label: "Consultor",    icon: "○", color: "hsl(var(--muted-foreground))" },
  distribuidor: { label: "Distribuidor", icon: "◐", color: "hsl(210, 60%, 50%)" },
  lider:        { label: "Líder",        icon: "●", color: "hsl(210, 80%, 40%)" },
  rubi:         { label: "Rubi",         icon: "◆", color: "hsl(0, 70%, 50%)" },
  esmeralda:    { label: "Esmeralda",    icon: "◈", color: "hsl(142, 60%, 40%)" },
  diamante:     { label: "Diamante",     icon: "◇", color: "hsl(270, 60%, 55%)" },
};

// Binary tree mock
export const mockBinaryTree: NetworkMember = {
  id: "100231",
  name: "Lívia Serato",
  qualification: "lider",
  active: true,
  volume: 3200,
  joinDate: "2025-01-15",
  phone: "+55 11 99999-0000",
  city: "São Paulo, SP",
  left: {
    id: "200587",
    name: "Carlos Mendes",
    qualification: "distribuidor",
    active: true,
    volume: 1450,
    joinDate: "2025-03-10",
    city: "Campinas, SP",
    left: {
      id: "300142",
      name: "Ana Paula Silva",
      qualification: "consultor",
      active: true,
      volume: 620,
      joinDate: "2025-06-01",
      city: "Ribeirão Preto, SP",
      left: null,
      right: null,
    },
    right: {
      id: "300299",
      name: "Fernando Costa",
      qualification: "consultor",
      active: false,
      volume: 180,
      joinDate: "2025-07-20",
      city: "Sorocaba, SP",
      left: null,
      right: null,
    },
  },
  right: {
    id: "200891",
    name: "Mariana Oliveira",
    qualification: "rubi",
    active: true,
    volume: 2100,
    joinDate: "2025-02-28",
    city: "Rio de Janeiro, RJ",
    left: {
      id: "301010",
      name: "Roberto Alves",
      qualification: "distribuidor",
      active: true,
      volume: 980,
      joinDate: "2025-05-15",
      city: "Niterói, RJ",
      left: null,
      right: null,
    },
    right: null,
  },
};

// Binary summary
export const mockBinarySummary = {
  leftVolume: 2250,
  rightVolume: 3080,
  accumulatedPoints: 5330,
  estimatedBonus: 412.50,
};

// Unilevel mock
export const mockUnilevelMembers: NetworkMember[] = [
  { id: "200587", name: "Carlos Mendes", qualification: "distribuidor", active: true, volume: 1450, joinDate: "2025-03-10", level: 1, city: "Campinas, SP" },
  { id: "200891", name: "Mariana Oliveira", qualification: "rubi", active: true, volume: 2100, joinDate: "2025-02-28", level: 1, city: "Rio de Janeiro, RJ" },
  { id: "300142", name: "Ana Paula Silva", qualification: "consultor", active: true, volume: 620, joinDate: "2025-06-01", level: 2, city: "Ribeirão Preto, SP" },
  { id: "300299", name: "Fernando Costa", qualification: "consultor", active: false, volume: 180, joinDate: "2025-07-20", level: 2, city: "Sorocaba, SP" },
  { id: "301010", name: "Roberto Alves", qualification: "distribuidor", active: true, volume: 980, joinDate: "2025-05-15", level: 2, city: "Niterói, RJ" },
  { id: "400111", name: "Juliana Ramos", qualification: "consultor", active: true, volume: 310, joinDate: "2025-09-01", level: 3, city: "Belo Horizonte, MG" },
  { id: "400222", name: "Pedro Henrique", qualification: "esmeralda", active: true, volume: 1850, joinDate: "2025-04-12", level: 3, city: "Curitiba, PR" },
  { id: "400333", name: "Tatiana Lopes", qualification: "consultor", active: false, volume: 90, joinDate: "2025-10-05", level: 3, city: "Florianópolis, SC" },
  { id: "500001", name: "Lucas Ferreira", qualification: "consultor", active: true, volume: 420, joinDate: "2025-11-20", level: 4, city: "Porto Alegre, RS" },
  { id: "500002", name: "Gabriela Santos", qualification: "diamante", active: true, volume: 3400, joinDate: "2025-01-30", level: 4, city: "Salvador, BA" },
];

export const mockUnilevelSummary = {
  totalMembers: 10,
  accumulatedPoints: 11400,
  recentPerformance: "+12% vs mês anterior",
  activeMembers: 8,
};
