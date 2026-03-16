export interface ProductVariation {
  type: "cor" | "voltagem" | "tamanho";
  label: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  image?: string;
  price: number;
  oldPrice?: number;
  activatable?: boolean;
  category: string;
  subcategory: string;
  description?: string;
  variations?: ProductVariation[];
  inStock: boolean;
  pointsUnilevel?: number;
  pointsBinary?: number;
  benefits?: string;
  instructions?: string;
  warranty?: string;
  composition?: string;
  manufacturer?: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export const categories: Category[] = [
  {
    id: "agua-saudavel",
    name: "Água Saudável",
    subcategories: ["Purificadores", "Refis e Filtros", "Ionizadores", "Acessórios"],
  },
  {
    id: "beleza",
    name: "Beleza & Auto Cuidado",
    subcategories: ["Cuidados com a Pele", "Cabelos", "Bem-Estar"],
  },
  {
    id: "dia-a-dia",
    name: "Dia a Dia",
    subcategories: ["Casa", "Limpeza", "Utilidades"],
  },
  {
    id: "impressos",
    name: "Impressos",
    subcategories: ["Catálogos", "Material de Apoio", "Cartões"],
  },
];

export const products: Product[] = [
  // Água Saudável > Purificadores
  {
    id: "p1",
    name: "Combo Mega",
    price: 189.9,
    activatable: true,
    category: "agua-saudavel",
    subcategory: "Purificadores",
    description: "Kit completo com purificador + 2 refis + instalação",
    variations: [
      { type: "cor", label: "Cor", options: ["Branco", "Preto", "Prata"] },
      { type: "voltagem", label: "Voltagem", options: ["110V", "220V"] },
    ],
    inStock: true,
    pointsUnilevel: 38,
    pointsBinary: 8,
    benefits: "Água purificada com pH equilibrado para toda a família.\nReduz cloro, metais pesados e impurezas em até 99%.\nMaior durabilidade do refil comparado a modelos convencionais.",
    instructions: "Instale em superfície plana próxima a ponto de água.\nTroque o refil a cada 6 meses ou 3.000 litros.\nLimpe a parte externa com pano úmido semanalmente.",
    warranty: "12 meses de garantia contra defeitos de fabricação.\nAssistência técnica em todo o Brasil.",
    composition: "Corpo em ABS de alta resistência, filtro de carvão ativado, membrana de ultrafiltração e refil alcalino mineral.",
    manufacturer: "Timol Indústria e Comércio Ltda.\nCNPJ: 00.000.000/0001-00\nSão Paulo – SP",
  },
  {
    id: "p2",
    name: "Combo Mini",
    price: 99.9,
    activatable: true,
    category: "agua-saudavel",
    subcategory: "Purificadores",
    description: "Kit compacto ideal para apartamentos",
    variations: [
      { type: "cor", label: "Cor", options: ["Branco", "Preto"] },
      { type: "voltagem", label: "Voltagem", options: ["110V", "220V"] },
    ],
    inStock: true,
    pointsUnilevel: 20,
    pointsBinary: 4,
  },
  {
    id: "p3",
    name: "Purificador Premium",
    price: 249.9,
    activatable: true,
    oldPrice: 299.9,
    category: "agua-saudavel",
    subcategory: "Purificadores",
    description: "Purificador de alta vazão com 5 estágios de filtragem",
    variations: [
      { type: "cor", label: "Cor", options: ["Branco", "Preto", "Azul"] },
      { type: "voltagem", label: "Voltagem", options: ["110V", "220V", "Bivolt"] },
    ],
    inStock: true,
    pointsUnilevel: 50,
    pointsBinary: 12,
  },
  // Água Saudável > Refis e Filtros
  {
    id: "p6",
    name: "Refil Alcalino Premium",
    price: 59.9,
    category: "agua-saudavel",
    subcategory: "Refis e Filtros",
    description: "Refil com 6 meses de durabilidade",
    variations: [
      { type: "tamanho", label: "Tamanho", options: ["Padrão", "Grande"] },
    ],
    inStock: true,
    pointsUnilevel: 12,
    pointsBinary: 3,
  },
  {
    id: "p8",
    name: "Filtro Carvão Ativado",
    price: 79.9,
    category: "agua-saudavel",
    subcategory: "Refis e Filtros",
    description: "Remove cloro e impurezas com alta eficiência",
    inStock: true,
    pointsUnilevel: 16,
    pointsBinary: 4,
  },
  // Água Saudável > Ionizadores
  {
    id: "p10",
    name: "Ionizador Portátil Go",
    price: 149.9,
    oldPrice: 179.9,
    category: "agua-saudavel",
    subcategory: "Ionizadores",
    description: "Garrafa ionizadora recarregável USB-C",
    variations: [
      { type: "cor", label: "Cor", options: ["Preto", "Azul", "Rosa"] },
      { type: "tamanho", label: "Volume", options: ["500ml", "750ml"] },
    ],
    inStock: true,
    pointsUnilevel: 30,
    pointsBinary: 7,
  },
  {
    id: "p11",
    name: "Ionizador de Mesa Pro",
    price: 299.9,
    category: "agua-saudavel",
    subcategory: "Ionizadores",
    description: "Ionização em 7 níveis de pH",
    variations: [
      { type: "cor", label: "Cor", options: ["Branco", "Preto"] },
      { type: "voltagem", label: "Voltagem", options: ["110V", "220V"] },
    ],
    inStock: true,
    pointsUnilevel: 60,
    pointsBinary: 14,
  },
  // Água Saudável > Acessórios
  {
    id: "p5",
    name: "Kit Instalação Universal",
    price: 39.9,
    category: "agua-saudavel",
    subcategory: "Acessórios",
    inStock: true,
    pointsUnilevel: 8,
    pointsBinary: 2,
  },
  {
    id: "p14",
    name: "Torneira Inox Longa",
    price: 69.9,
    category: "agua-saudavel",
    subcategory: "Acessórios",
    variations: [
      { type: "cor", label: "Acabamento", options: ["Cromado", "Escovado", "Preto Fosco"] },
    ],
    inStock: true,
    pointsUnilevel: 14,
    pointsBinary: 3,
  },
  // Beleza & Auto Cuidado > Cuidados com a Pele
  {
    id: "p17",
    name: "Sérum Facial Hidratante",
    price: 89.9,
    category: "beleza",
    subcategory: "Cuidados com a Pele",
    description: "Sérum com ácido hialurônico e vitamina C",
    inStock: true,
    pointsUnilevel: 18,
    pointsBinary: 4,
  },
  {
    id: "p18",
    name: "Creme Anti-Idade",
    price: 119.9,
    category: "beleza",
    subcategory: "Cuidados com a Pele",
    description: "Redução de linhas de expressão em 30 dias",
    inStock: true,
    pointsUnilevel: 24,
    pointsBinary: 6,
  },
  // Beleza & Auto Cuidado > Cabelos
  {
    id: "p19",
    name: "Shampoo Revitalizante",
    price: 49.9,
    category: "beleza",
    subcategory: "Cabelos",
    description: "Com queratina e água alcalina",
    inStock: true,
    pointsUnilevel: 10,
    pointsBinary: 2,
  },
  // Beleza & Auto Cuidado > Bem-Estar
  {
    id: "p20",
    name: "Óleo Essencial Relaxante",
    price: 39.9,
    category: "beleza",
    subcategory: "Bem-Estar",
    description: "Blend de lavanda e camomila",
    inStock: true,
    pointsUnilevel: 8,
    pointsBinary: 2,
  },
  // Dia a Dia > Casa
  {
    id: "p21",
    name: "Detergente Concentrado",
    price: 24.9,
    category: "dia-a-dia",
    subcategory: "Casa",
    description: "Rende até 5x mais que o convencional",
    inStock: true,
    pointsUnilevel: 5,
    pointsBinary: 1,
  },
  // Dia a Dia > Limpeza
  {
    id: "p22",
    name: "Multiuso Biodegradável",
    price: 19.9,
    category: "dia-a-dia",
    subcategory: "Limpeza",
    description: "Fórmula ecológica para todas as superfícies",
    inStock: true,
    pointsUnilevel: 4,
    pointsBinary: 1,
  },
  // Dia a Dia > Utilidades
  {
    id: "p23",
    name: "Garrafa Térmica 1L",
    price: 59.9,
    category: "dia-a-dia",
    subcategory: "Utilidades",
    description: "Mantém a temperatura por até 12 horas",
    variations: [
      { type: "cor", label: "Cor", options: ["Preto", "Branco", "Azul"] },
    ],
    inStock: true,
    pointsUnilevel: 12,
    pointsBinary: 3,
  },
  // Impressos > Catálogos
  {
    id: "p24",
    name: "Catálogo de Produtos",
    price: 15.0,
    category: "impressos",
    subcategory: "Catálogos",
    description: "Catálogo completo com todos os produtos da linha",
    inStock: true,
    pointsUnilevel: 3,
    pointsBinary: 1,
  },
  // Impressos > Material de Apoio
  {
    id: "p25",
    name: "Kit Folders Apresentação",
    price: 29.9,
    category: "impressos",
    subcategory: "Material de Apoio",
    description: "10 folders para apresentação do negócio",
    inStock: true,
    pointsUnilevel: 6,
    pointsBinary: 1,
  },
  // Impressos > Cartões
  {
    id: "p26",
    name: "Cartões de Visita (100un)",
    price: 35.0,
    category: "impressos",
    subcategory: "Cartões",
    description: "Cartões personalizados com seus dados",
    inStock: false,
    pointsUnilevel: 7,
    pointsBinary: 2,
  },
];
