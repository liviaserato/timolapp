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
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export const categories: Category[] = [
  {
    id: "purificadores",
    name: "Purificadores",
    subcategories: ["Combos", "Avulsos", "Peças e Acessórios"],
  },
  {
    id: "refis",
    name: "Refis e Filtros",
    subcategories: ["Refis Alcalinos", "Filtros de Carvão", "Membranas"],
  },
  {
    id: "ionizadores",
    name: "Ionizadores",
    subcategories: ["Portáteis", "De mesa", "Galões"],
  },
  {
    id: "acessorios",
    name: "Acessórios",
    subcategories: ["Torneiras", "Mangueiras", "Conexões"],
  },
];

export const products: Product[] = [
  // Purificadores > Combos
  {
    id: "p1",
    name: "Combo Mega",
    price: 189.9,
    activatable: true,
    category: "purificadores",
    subcategory: "Combos",
    description: "Kit completo com purificador + 2 refis + instalação",
    variations: [
      { type: "cor", label: "Cor", options: ["Branco", "Preto", "Prata"] },
      { type: "voltagem", label: "Voltagem", options: ["110V", "220V"] },
    ],
    inStock: true,
    pointsUnilevel: 38,
    pointsBinary: 8,
  },
  {
    id: "p2",
    name: "Combo Mini",
    price: 99.9,
    activatable: true,
    category: "purificadores",
    subcategory: "Combos",
    description: "Kit compacto ideal para apartamentos",
    variations: [
      { type: "cor", label: "Cor", options: ["Branco", "Preto"] },
      { type: "voltagem", label: "Voltagem", options: ["110V", "220V"] },
    ],
    inStock: true,
    pointsUnilevel: 20,
    pointsBinary: 4,
  },
  // Purificadores > Avulsos
  {
    id: "p3",
    name: "Purificador Premium",
    price: 249.9,
    oldPrice: 299.9,
    category: "purificadores",
    subcategory: "Avulsos",
    description: "Purificador de alta vazão com 5 estágios de filtragem",
    variations: [
      { type: "cor", label: "Cor", options: ["Branco", "Preto", "Azul"] },
      { type: "voltagem", label: "Voltagem", options: ["110V", "220V", "Bivolt"] },
    ],
    inStock: true,
    pointsUnilevel: 50,
    pointsBinary: 12,
  },
  {
    id: "p4",
    name: "Purificador Slim",
    price: 179.9,
    category: "purificadores",
    subcategory: "Avulsos",
    description: "Design ultraslim para espaços reduzidos",
    variations: [
      { type: "cor", label: "Cor", options: ["Branco", "Prata"] },
    ],
    inStock: true,
    pointsUnilevel: 36,
    pointsBinary: 7,
  },
  // Purificadores > Peças e Acessórios
  {
    id: "p5",
    name: "Kit Instalação Universal",
    price: 39.9,
    category: "purificadores",
    subcategory: "Peças e Acessórios",
    inStock: true,
    pointsUnilevel: 8,
    pointsBinary: 2,
  },
  // Refis e Filtros > Refis Alcalinos
  {
    id: "p6",
    name: "Refil Alcalino Premium",
    price: 59.9,
    category: "refis",
    subcategory: "Refis Alcalinos",
    description: "Refil com 6 meses de durabilidade",
    variations: [
      { type: "tamanho", label: "Tamanho", options: ["Padrão", "Grande"] },
    ],
    inStock: true,
    pointsUnilevel: 12,
    pointsBinary: 3,
  },
  {
    id: "p7",
    name: "Refil Alcalino Básico",
    price: 39.9,
    category: "refis",
    subcategory: "Refis Alcalinos",
    description: "Refil com 3 meses de durabilidade",
    inStock: true,
    pointsUnilevel: 8,
    pointsBinary: 2,
  },
  // Refis e Filtros > Filtros de Carvão
  {
    id: "p8",
    name: "Filtro Carvão Ativado",
    price: 79.9,
    category: "refis",
    subcategory: "Filtros de Carvão",
    description: "Remove cloro e impurezas com alta eficiência",
    inStock: true,
    pointsUnilevel: 16,
    pointsBinary: 4,
  },
  // Refis e Filtros > Membranas
  {
    id: "p9",
    name: "Membrana de Osmose Reversa",
    price: 129.9,
    category: "refis",
    subcategory: "Membranas",
    description: "Filtração de 0,0001 mícron",
    inStock: true,
    pointsUnilevel: 26,
    pointsBinary: 6,
  },
  // Ionizadores > Portáteis
  {
    id: "p10",
    name: "Ionizador Portátil Go",
    price: 149.9,
    oldPrice: 179.9,
    category: "ionizadores",
    subcategory: "Portáteis",
    description: "Garrafa ionizadora recarregável USB-C",
    variations: [
      { type: "cor", label: "Cor", options: ["Preto", "Azul", "Rosa"] },
      { type: "tamanho", label: "Volume", options: ["500ml", "750ml"] },
    ],
    inStock: true,
    pointsUnilevel: 30,
    pointsBinary: 7,
  },
  // Ionizadores > De mesa
  {
    id: "p11",
    name: "Ionizador de Mesa Pro",
    price: 299.9,
    category: "ionizadores",
    subcategory: "De mesa",
    description: "Ionização em 7 níveis de pH",
    variations: [
      { type: "cor", label: "Cor", options: ["Branco", "Preto"] },
      { type: "voltagem", label: "Voltagem", options: ["110V", "220V"] },
    ],
    inStock: true,
    pointsUnilevel: 60,
    pointsBinary: 14,
  },
  // Ionizadores > Galões
  {
    id: "p12",
    name: "Galão Ionizado 20L",
    price: 45.0,
    category: "ionizadores",
    subcategory: "Galões",
    description: "Água alcalina ionizada pronta para consumo",
    inStock: true,
    pointsUnilevel: 9,
    pointsBinary: 2,
  },
  {
    id: "p13",
    name: "Galão Ionizado 10L",
    price: 28.0,
    category: "ionizadores",
    subcategory: "Galões",
    inStock: true,
    pointsUnilevel: 6,
    pointsBinary: 1,
  },
  // Acessórios > Torneiras
  {
    id: "p14",
    name: "Torneira Inox Longa",
    price: 69.9,
    category: "acessorios",
    subcategory: "Torneiras",
    variations: [
      { type: "cor", label: "Acabamento", options: ["Cromado", "Escovado", "Preto Fosco"] },
    ],
    inStock: true,
    pointsUnilevel: 14,
    pointsBinary: 3,
  },
  // Acessórios > Mangueiras
  {
    id: "p15",
    name: "Mangueira Flexível 1,5m",
    price: 19.9,
    category: "acessorios",
    subcategory: "Mangueiras",
    inStock: true,
    pointsUnilevel: 4,
    pointsBinary: 1,
  },
  // Acessórios > Conexões
  {
    id: "p16",
    name: "Kit Conexões Rápidas",
    price: 24.9,
    category: "acessorios",
    subcategory: "Conexões",
    description: "Kit com 6 conexões universais",
    inStock: false,
    pointsUnilevel: 5,
    pointsBinary: 1,
  },
];
