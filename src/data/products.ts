export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  brand: string;
  unit: string;
  stock: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  type: string;
  image: string;
  isActive: boolean;
  sold?: number;
}

export const products: Product[] = [
  {
    id: "1",
    code: "14342",
    name: "Bicicleta 12\" Varios Colores",
    description: "Bicicleta aro 12 para niños, varios colores disponibles",
    brand: "3M",
    unit: "UNIDAD",
    stock: 5,
    price: 20,
    originalPrice: 40,
    discount: 50,
    category: "FERRETERIA EN GENERAL",
    type: "OTROS",
    image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
    isActive: true,
    sold: 128
  },
  {
    id: "2",
    code: "14344",
    name: "Bicicleta 16\" Rosada/Azul",
    description: "Bicicleta aro 16 en colores rosado y azul",
    brand: "3M",
    unit: "UNIDAD",
    stock: 8,
    price: 45,
    category: "FERRETERIA EN GENERAL",
    type: "HERRAMIENTAS",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
    isActive: true,
    sold: 89
  },
  {
    id: "3",
    code: "14131",
    name: "Corta Loza DW 4-3/8\"",
    description: "Disco de corte para loza profesional DeWalt",
    brand: "3M",
    unit: "UNIDAD",
    stock: 1,
    price: 125.06,
    originalPrice: 156.32,
    discount: 20,
    category: "FERRETERIA EN GENERAL",
    type: "HERRAMIENTAS",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80",
    isActive: true,
    sold: 45
  },
  {
    id: "4",
    code: "11326",
    name: "Disco de Zirconio Century 4 1/2\"x120",
    description: "Disco abrasivo de zirconio para amoladora",
    brand: "3M",
    unit: "UNIDAD",
    stock: 40,
    price: 0.62,
    category: "FERRETERIA EN GENERAL",
    type: "CABOS Y PIOLAS",
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=80",
    isActive: true,
    sold: 520
  },
  {
    id: "5",
    code: "13437",
    name: "Dispensador de Papel 27,4x10x21",
    description: "Dispensador de papel para baño o cocina",
    brand: "3M",
    unit: "UNIDAD",
    stock: 2,
    price: 9.25,
    category: "FERRETERIA EN GENERAL",
    type: "CABOS Y PIOLAS",
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80",
    isActive: true,
    sold: 78
  },
  {
    id: "6",
    code: "7456",
    name: "Electrodo 6011 3,2X300 Century",
    description: "Electrodos para soldadura, caja completa",
    brand: "GENERICA",
    unit: "CAJA",
    stock: 1,
    price: 31.96,
    category: "FERRETERIA EN GENERAL",
    type: "CLAVOS Y TORNILLOS",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&q=80",
    isActive: true,
    sold: 156
  },
  {
    id: "7",
    code: "11556",
    name: "Lona Gruesa Azul-Rojo 50M",
    description: "Rollo de lona resistente bicolor",
    brand: "3M",
    unit: "ROLLO",
    stock: 1,
    price: 323.48,
    category: "FERRETERIA EN GENERAL",
    type: "CABOS Y PIOLAS",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    isActive: true,
    sold: 23
  },
  {
    id: "8",
    code: "10403",
    name: "Pulidora STY 7\" 1300W",
    description: "Pulidora profesional de 7 pulgadas",
    brand: "3M",
    unit: "UNIDAD",
    stock: 1,
    price: 129.57,
    category: "FERRETERIA EN GENERAL",
    type: "CABOS Y PIOLAS",
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&q=80",
    isActive: true,
    sold: 67
  },
  {
    id: "9",
    code: "11125",
    name: "Recipiente 1,7L",
    description: "Recipiente plástico multiusos",
    brand: "3M",
    unit: "UNIDAD",
    stock: 2,
    price: 6.42,
    originalPrice: 6.76,
    discount: 5,
    category: "FERRETERIA EN GENERAL",
    type: "HERRAMIENTAS",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80",
    isActive: true,
    sold: 234
  },
  {
    id: "10",
    code: "9383",
    name: "Bathroom Petra + Desague Metálico",
    description: "Set completo de baño con desagüe premium",
    brand: "3M",
    unit: "UNIDAD",
    stock: 1,
    price: 134.09,
    category: "ADITIVOS",
    type: "ADITIVOS",
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80",
    isActive: true,
    sold: 34
  },
  {
    id: "11",
    code: "9385",
    name: "Remachadora de Mano BP Reforzada",
    description: "Remachadora manual 3/32 a 3/16 pulgadas",
    brand: "3M",
    unit: "UNIDAD",
    stock: 3,
    price: 2.78,
    category: "ADITIVOS",
    type: "ADITIVOS",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80",
    isActive: true,
    sold: 412
  },
  {
    id: "12",
    code: "10840",
    name: "Repuesto Máscara Soldar Electrónica",
    description: "Repuesto para máscara de soldador automática",
    brand: "3M",
    unit: "UNIDAD",
    stock: 4,
    price: 9.40,
    category: "FERRETERIA EN GENERAL",
    type: "OTROS",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&q=80",
    isActive: true,
    sold: 89
  },
  {
    id: "13",
    code: "10450",
    name: "Soldadora Raptor 160AMP 2 en 1",
    description: "Soldadora MMA/TIG Lift 110-220V profesional",
    brand: "3M",
    unit: "UNIDAD",
    stock: 2,
    price: 73.49,
    category: "FERRETERIA EN GENERAL",
    type: "HERRAMIENTAS",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&q=80",
    isActive: true,
    sold: 156
  },
  {
    id: "14",
    code: "9334",
    name: "Foco LED Ojo de Dragón Cuadrado 3W",
    description: "Foco LED empotrable decorativo",
    brand: "3M",
    unit: "UNIDAD",
    stock: 3,
    price: 3.01,
    category: "FERRETERIA EN GENERAL",
    type: "ELECTRICOS",
    image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&q=80",
    isActive: true,
    sold: 678
  },
  {
    id: "15",
    code: "12514",
    name: "Florero de Cristal con Base de Madera",
    description: "Elegante florero decorativo con base de madera",
    brand: "3M",
    unit: "UNIDAD",
    stock: 1,
    price: 37.16,
    category: "HOGAR",
    type: "FLORERO",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80",
    isActive: true,
    sold: 45
  },
  {
    id: "16",
    code: "12515",
    name: "Floreros Azules Dos Medidas",
    description: "Set de floreros azules en dos tamaños",
    brand: "3M",
    unit: "UNIDAD",
    stock: 1,
    price: 21,
    category: "HOGAR",
    type: "FLORERO",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&q=80",
    isActive: true,
    sold: 67
  },
  {
    id: "17",
    code: "12517",
    name: "Jarrones Veteados Negro y Blanco",
    description: "Jarrones decorativos estilo mármol",
    brand: "3M",
    unit: "UNIDAD",
    stock: 1,
    price: 26.44,
    category: "HOGAR",
    type: "JARRON",
    image: "https://images.unsplash.com/photo-1612198273689-b437f53152ca?w=400&q=80",
    isActive: true,
    sold: 89
  },
  {
    id: "18",
    code: "12519",
    name: "Mini Florero Tipo Roca Marmoleado",
    description: "Pequeño florero con diseño de roca",
    brand: "3M",
    unit: "UNIDAD",
    stock: 1,
    price: 20.70,
    category: "HOGAR",
    type: "FLORERO",
    image: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&q=80",
    isActive: true,
    sold: 112
  },
  {
    id: "19",
    code: "12520",
    name: "Jarrones Opacos Blanco y Negro Mediana",
    description: "Jarrones opacos elegantes tamaño mediano",
    brand: "3M",
    unit: "UNIDAD",
    stock: 2,
    price: 20,
    category: "HOGAR",
    type: "JARRON",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&q=80",
    isActive: true,
    sold: 78
  },
  {
    id: "20",
    code: "12521",
    name: "Jarrón Floral de Vidrio con Bola",
    description: "Jarrón transparente con detalle esférico",
    brand: "3M",
    unit: "SET",
    stock: 1,
    price: 28.54,
    category: "HOGAR",
    type: "JARRON",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80",
    isActive: true,
    sold: 56
  },
  {
    id: "21",
    code: "12522",
    name: "Jarrón Cadiz de Vidrio Base Redonda",
    description: "Jarrón modelo Cádiz con base circular",
    brand: "3M",
    unit: "UNIDAD",
    stock: 2,
    price: 29.35,
    category: "HOGAR",
    type: "JARRON",
    image: "https://images.unsplash.com/photo-1612198273689-b437f53152ca?w=400&q=80",
    isActive: true,
    sold: 34
  },
  {
    id: "22",
    code: "12523",
    name: "Jarrones Opacos Grandes",
    description: "Jarrones decorativos blanco y negro grandes",
    brand: "3M",
    unit: "UNIDAD",
    stock: 4,
    price: 24.97,
    category: "HOGAR",
    type: "JARRON",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&q=80",
    isActive: true,
    sold: 123
  },
  {
    id: "23",
    code: "12524",
    name: "Jarrón Base Negra",
    description: "Jarrón elegante con base negra",
    brand: "3M",
    unit: "UNIDAD",
    stock: 1,
    price: 19.98,
    category: "HOGAR",
    type: "JARRA",
    image: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&q=80",
    isActive: true,
    sold: 67
  },
  {
    id: "24",
    code: "12525",
    name: "Minipeceras Diferentes Tamaños",
    description: "Set de peceras decorativas pequeñas",
    brand: "3M",
    unit: "UNIDAD",
    stock: 11,
    price: 10.70,
    category: "HOGAR",
    type: "ADORNO CRISTAL",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80",
    isActive: true,
    sold: 234
  },
  {
    id: "25",
    code: "12526",
    name: "Tazón Realista Media Luna Centro de Mesa",
    description: "Centro de mesa decorativo en forma de media luna",
    brand: "3M",
    unit: "UNIDAD",
    stock: 2,
    price: 23.75,
    category: "HOGAR",
    type: "ADORNO CRISTAL",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80",
    isActive: true,
    sold: 89
  }
];

export const categories = [
  { id: "all", name: "Todo", icon: "🏠" },
  { id: "FERRETERIA EN GENERAL", name: "Ferretería", icon: "🔧" },
  { id: "HOGAR", name: "Hogar", icon: "🏡" },
  { id: "HERRAMIENTAS", name: "Herramientas", icon: "🛠️" },
  { id: "ELECTRICOS", name: "Eléctricos", icon: "💡" },
  { id: "ADITIVOS", name: "Aditivos", icon: "🧪" },
];

export const getProductsByCategory = (categoryId: string): Product[] => {
  if (categoryId === "all") return products.filter(p => p.isActive);
  return products.filter(p => p.isActive && (p.category === categoryId || p.type === categoryId));
};

export const getDiscountedProducts = (): Product[] => {
  return products.filter(p => p.isActive && p.discount && p.discount > 0);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p => 
    p.isActive && (
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery) ||
      p.brand.toLowerCase().includes(lowerQuery)
    )
  );
};
