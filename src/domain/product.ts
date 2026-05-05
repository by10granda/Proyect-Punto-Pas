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
  images?: string[];
  video?: string;
  isActive: boolean;
  sold?: number;
  pvpPrice?: number;
  puntoPasPrice?: number;
}

export interface Level2Category {
  id: number;
  name: string;
}

export interface ClassificationItem {
  idClasificacionitem: number;
  txDescripcionClasificacionItem: string;
  nivel: number;
  idClasificacionitemPadre: number;
}
