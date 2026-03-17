import { NetworkMember } from "./mock-data";

/* ── Qualification → max visible level ── */
export const qualificationLevelLimits: Record<string, number> = {
  consultor: 3,
  distribuidor: 4,
  lider: 5,
  rubi: 5,
  esmeralda: 6,
  diamante: 10,
  diamante_duplo: 10,
  diamante_triplo: 10,
  diamante_coroa: 10,
  diamante_real: 10,
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

/* ── Level points table for bonus explainer ── */
export const levelPointsTable = [
  { level: 1, percentage: "20%", qualification: "Consultor" },
  { level: 2, percentage: "10%", qualification: "Consultor" },
  { level: 3, percentage: "5%", qualification: "Consultor" },
  { level: 4, percentage: "5%", qualification: "Distribuidor" },
  { level: 5, percentage: "5%", qualification: "Líder / Rubi" },
  { level: 6, percentage: "5%", qualification: "Esmeralda" },
  { level: 7, percentage: "3%", qualification: "Diamante" },
  { level: 8, percentage: "3%", qualification: "Diamante" },
  { level: 9, percentage: "2%", qualification: "Diamante" },
  { level: 10, percentage: "2%", qualification: "Diamante" },
];
