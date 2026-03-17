import { NetworkMember } from "./mock-data";

/* ── Qualification → max visible level ── */
export const qualificationLevelLimits: Record<string, number> = {
  consultor: 3,
  distribuidor: 4,
  lider: 5,
  rubi: 5,
  esmeralda: 6,
  diamante: 7,
  diamante_1: 8,
  diamante_2: 9,
  diamante_3: 10,
  diamante_4: 10,
  diamante_5: 10,
  diamante_black: 10,
};

/* ── Unilevel tree structure (progressive load) ── */
export interface UnilevelNode extends NetworkMember {
  children?: UnilevelNode[];
  /** true = the user enrolled this person directly */
  isDirect?: boolean;
}

// Build a deeper mock tree for orgchart
export const mockUnilevelTree: UnilevelNode = {
  id: "100231",
  name: "Lívia Serato",
  qualification: "esmeralda",
  active: true,
  volume: 3200,
  joinDate: "2025-01-15",
  phone: "+55 11 99999-0000",
  city: "São Paulo, SP",
  document: "123.456.789-00",
  isDirect: false,
  children: [
    {
      id: "200587", name: "Carlos Mendes", qualification: "distribuidor", active: true, volume: 1450, joinDate: "2025-03-10", city: "Campinas, SP", isDirect: true,
      children: [
        {
          id: "300142", name: "Ana Paula Silva", qualification: "consultor", active: true, volume: 620, joinDate: "2025-06-01", city: "Ribeirão Preto, SP", isDirect: false,
          children: [
            { id: "400111", name: "Juliana Ramos", qualification: "consultor", active: true, volume: 310, joinDate: "2025-09-01", city: "Belo Horizonte, MG", isDirect: false, children: [
              { id: "500010", name: "Rafael Cunha", qualification: "consultor", active: true, volume: 180, joinDate: "2025-12-10", isDirect: false, children: [
                { id: "600010", name: "Débora Leal", qualification: "consultor", active: true, volume: 95, joinDate: "2026-02-01", isDirect: false, children: [] },
              ] },
            ] },
            { id: "400112", name: "Marcos Lima", qualification: "consultor", active: true, volume: 210, joinDate: "2025-12-01", isDirect: false, children: [] },
          ],
        },
        {
          id: "300299", name: "Fernando Costa", qualification: "consultor", active: false, volume: 180, joinDate: "2025-07-20", city: "Sorocaba, SP", isDirect: false,
          children: [],
        },
      ],
    },
    {
      id: "200891", name: "Mariana Oliveira", qualification: "rubi", active: true, volume: 2100, joinDate: "2025-02-28", city: "Rio de Janeiro, RJ", isDirect: true,
      children: [
        {
          id: "301010", name: "Roberto Alves", qualification: "distribuidor", active: true, volume: 980, joinDate: "2025-05-15", city: "Niterói, RJ", isDirect: false,
          children: [
            { id: "400333", name: "Tatiana Lopes", qualification: "consultor", active: false, volume: 90, joinDate: "2025-10-05", city: "Florianópolis, SC", isDirect: false, children: [] },
            { id: "400444", name: "Patrícia Nunes", qualification: "consultor", active: true, volume: 340, joinDate: "2025-11-15", isDirect: false, children: [] },
          ],
        },
        {
          id: "301099", name: "Camila Torres", qualification: "esmeralda", active: true, volume: 1750, joinDate: "2025-04-05", city: "Brasília, DF", isDirect: false,
          children: [
            { id: "400222", name: "Pedro Henrique", qualification: "esmeralda", active: true, volume: 1850, joinDate: "2025-04-12", city: "Curitiba, PR", isDirect: false, children: [
              { id: "500001", name: "Lucas Ferreira", qualification: "consultor", active: true, volume: 420, joinDate: "2025-11-20", city: "Porto Alegre, RS", isDirect: false, children: [
                { id: "600001", name: "Carla Souza", qualification: "consultor", active: true, volume: 110, joinDate: "2026-01-15", isDirect: false, children: [] },
              ] },
              { id: "500002", name: "Gabriela Santos", qualification: "diamante", active: true, volume: 3400, joinDate: "2025-01-30", city: "Salvador, BA", isDirect: false, children: [] },
            ] },
          ],
        },
      ],
    },
    {
      id: "200999", name: "Diego Martins", qualification: "consultor", active: false, volume: 90, joinDate: "2025-12-10", city: "Manaus, AM", isDirect: true,
      children: [],
    },
  ],
};

/* ── Flatten tree into a flat list with level info ── */
export interface FlatUnilevelMember extends NetworkMember {
  isDirect: boolean;
}

export function flattenUnilevelTree(node: UnilevelNode, currentLevel: number = 0, maxLevel: number = 10): FlatUnilevelMember[] {
  const result: FlatUnilevelMember[] = [];
  if (!node.children) return result;

  for (const child of node.children) {
    const lvl = currentLevel + 1;
    if (lvl > maxLevel) continue;
    result.push({
      ...child,
      level: lvl,
      isDirect: lvl === 1,
    } as FlatUnilevelMember);
    result.push(...flattenUnilevelTree(child, lvl, maxLevel));
  }

  return result;
}

/* ── Level points table per qualification ── */
export interface LevelPercentageRow {
  level: number;
  consultor: string;
  distribuidor: string;
  lider: string;
  rubi: string;
  esmeralda: string;
  diamante: string;
}

export const levelPointsTable: LevelPercentageRow[] = [
  { level: 1,  consultor: "30%", distribuidor: "30%", lider: "30%", rubi: "30%", esmeralda: "30%", diamante: "30%" },
  { level: 2,  consultor: "30%", distribuidor: "30%", lider: "30%", rubi: "30%", esmeralda: "30%", diamante: "30%" },
  { level: 3,  consultor: "30%", distribuidor: "30%", lider: "30%", rubi: "30%", esmeralda: "30%", diamante: "30%" },
  { level: 4,  consultor: "",    distribuidor: "30%", lider: "30%", rubi: "30%", esmeralda: "30%", diamante: "30%" },
  { level: 5,  consultor: "",    distribuidor: "",    lider: "20%", rubi: "30%", esmeralda: "30%", diamante: "30%" },
  { level: 6,  consultor: "",    distribuidor: "",    lider: "",    rubi: "",    esmeralda: "20%", diamante: "30%" },
  { level: 7,  consultor: "",    distribuidor: "",    lider: "",    rubi: "",    esmeralda: "",    diamante: "20%" },
  { level: 8,  consultor: "",    distribuidor: "",    lider: "",    rubi: "",    esmeralda: "",    diamante: "" },
  { level: 9,  consultor: "",    distribuidor: "",    lider: "",    rubi: "",    esmeralda: "",    diamante: "" },
  { level: 10, consultor: "",    distribuidor: "",    lider: "",    rubi: "",    esmeralda: "",    diamante: "" },
];

export const extraBonus: Record<string, string> = {
  consultor: "-",
  distribuidor: "-",
  lider: "+ 25%",
  rubi: "+ 50%",
  esmeralda: "+ 100%",
  diamante: "+ 100%",
};

/* ── Plano Diamante sub-levels ── */
export interface DiamanteLevelRow {
  level: number;
  d1: string; // ★
  d2: string; // ★★
  d3: string; // ★★★
  d4: string; // ★★★★
  d5: string; // ★★★★★
  black: string;
}

export const diamanteLevelTable: DiamanteLevelRow[] = [
  { level: 1,  d1: "30%", d2: "30%", d3: "30%", d4: "30%", d5: "30%", black: "30%" },
  { level: 2,  d1: "30%", d2: "30%", d3: "30%", d4: "30%", d5: "30%", black: "30%" },
  { level: 3,  d1: "30%", d2: "30%", d3: "30%", d4: "30%", d5: "30%", black: "30%" },
  { level: 4,  d1: "30%", d2: "30%", d3: "30%", d4: "30%", d5: "30%", black: "30%" },
  { level: 5,  d1: "30%", d2: "30%", d3: "30%", d4: "30%", d5: "30%", black: "30%" },
  { level: 6,  d1: "30%", d2: "30%", d3: "30%", d4: "30%", d5: "30%", black: "30%" },
  { level: 7,  d1: "30%", d2: "30%", d3: "30%", d4: "30%", d5: "30%", black: "30%" },
  { level: 8,  d1: "20%", d2: "20%", d3: "20%", d4: "30%", d5: "30%", black: "30%" },
  { level: 9,  d1: "",    d2: "20%", d3: "20%", d4: "20%", d5: "30%", black: "30%" },
  { level: 10, d1: "",    d2: "",    d3: "20%", d4: "20%", d5: "20%", black: "30%" },
];

export const diamanteExtraBonus = "+ 100%";

export const diamanteLabels: { key: keyof DiamanteLevelRow; label: string }[] = [
  { key: "d1", label: "★" },
  { key: "d2", label: "★★" },
  { key: "d3", label: "★★★" },
  { key: "d4", label: "★★★★" },
  { key: "d5", label: "★★★★★" },
  { key: "black", label: "Black ◈" },
];
