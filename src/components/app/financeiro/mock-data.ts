export const qualificationLabels: Record<string, { label: string; icon: string }> = {
  consultor: { label: "Consultor", icon: "○" },
  distribuidor: { label: "Distribuidor", icon: "◐" },
  lider: { label: "Líder", icon: "●" },
  rubi: { label: "Rubi", icon: "◆" },
  esmeralda: { label: "Esmeralda", icon: "◈" },
  diamante: { label: "Diamante", icon: "◇" },
};

export const movementTypes = ["Unilevel", "Binário", "Fixo", "Depósito", "Pedido"] as const;
export type MovementType = (typeof movementTypes)[number];

export interface BonusExtractRow {
  date: string;
  orderNumber: string;
  id: string;
  qualification: string;
  type: MovementType;
  points: number | null;
  value: number;
}

export interface BancoTimolExtractRow {
  date: string;
  description: string;
  value: number;
}

export interface Prize {
  id: string;
  name: string;
  pointsRequired: number;
  description: string;
  detailedDescription: string;
  imageEmoji: string;
}

export const mockBonusSummary = {
  nextFriday: 342.5,
  awaitingRelease: 128.0,
};

export const mockBancoTimol = {
  available: 1250.0,
  pendingWithdrawal: 200.0,
};

export const mockFranchiseStatus = {
  activeUntil: "2026-04-15",
};

export const mockBonusExtract: BonusExtractRow[] = [
  { date: "2026-03-06", orderNumber: "#4521", id: "100231", qualification: "lider", type: "Pedido", points: 45, value: 89.9 },
  { date: "2026-03-05", orderNumber: "#4520", id: "200587", qualification: "distribuidor", type: "Unilevel", points: 12, value: 24.0 },
  { date: "2026-03-04", orderNumber: "#4519", id: "300142", qualification: "consultor", type: "Binário", points: 8, value: 16.0 },
  { date: "2026-03-03", orderNumber: "#4518", id: "100231", qualification: "lider", type: "Fixo", points: null, value: 50.0 },
  { date: "2026-03-02", orderNumber: "#4517", id: "400321", qualification: "rubi", type: "Unilevel", points: 20, value: 40.0 },
  { date: "2026-03-01", orderNumber: "#4516", id: "100231", qualification: "lider", type: "Depósito", points: null, value: 500.0 },
  { date: "2026-02-28", orderNumber: "#4515", id: "500110", qualification: "esmeralda", type: "Depósito", points: null, value: 300.0 },
  { date: "2026-02-27", orderNumber: "#4514", id: "100231", qualification: "lider", type: "Pedido", points: 30, value: 59.9 },
];

export const mockBancoTimolExtract: BancoTimolExtractRow[] = [
  { date: "2026-03-06", description: "Crédito via PIX", value: 500.0 },
  { date: "2026-03-05", description: "Pedido #4521", value: -89.9 },
  { date: "2026-03-04", description: "Crédito via cartão", value: 300.0 },
  { date: "2026-03-03", description: "Resgate", value: -200.0 },
  { date: "2026-03-03", description: "Tarifa de resgate", value: -8.0 },
  { date: "2026-03-01", description: "Pedido #4499", value: -45.5 },
];

export const mockPrizes: Prize[] = [
  {
    id: "1",
    name: "Kit Exclusivo Timol",
    pointsRequired: 500,
    description: "Kit com produtos premium da linha Timol.",
    detailedDescription: "Kit completo contendo 5 produtos da linha premium Timol, incluindo embalagem especial e cartão personalizado. Entrega em até 15 dias úteis.",
    imageEmoji: "🎁",
  },
  {
    id: "2",
    name: "Viagem Nacional",
    pointsRequired: 5000,
    description: "Viagem com tudo incluso para um destino nacional.",
    detailedDescription: "Pacote de viagem com 3 diárias em hotel 4 estrelas, passagem aérea ida e volta, e traslado. Válido para destinos nacionais selecionados.",
    imageEmoji: "✈️",
  },
  {
    id: "3",
    name: "Smartphone Premium",
    pointsRequired: 8000,
    description: "Smartphone de última geração à sua escolha.",
    detailedDescription: "Smartphone top de linha das principais marcas do mercado. Escolha entre os modelos disponíveis no catálogo. Entrega em até 20 dias úteis.",
    imageEmoji: "📱",
  },
  {
    id: "4",
    name: "Carro 0km",
    pointsRequired: 50000,
    description: "Veículo popular 0km financiado pela Timol.",
    detailedDescription: "Veículo popular 0km da marca e modelo disponíveis no programa. Documentação e emplacamento inclusos. Sujeito a disponibilidade.",
    imageEmoji: "🚗",
  },
];

export const mockUserQualification = {
  current: "lider",
  totalPoints: 1250,
  expiringPoints: 200,
  expirationDate: "2026-04-30",
};

export const WITHDRAW_FEE_PERCENT = 4;
