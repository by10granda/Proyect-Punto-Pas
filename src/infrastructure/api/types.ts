export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiErrorPayload {
  detail?: string;
  type?: string;
}

export interface ApiProductItem {
  codigo: string;
  codigoBarras?: string;
  descripcionItem: string;
  descripcionUnidadInventario?: string;
  descripcionCategoria?: string;
  descripcionTipo?: string;
  tipo?: string;
  precioVentaSinImpuestos?: number;
  precioVentaConImpuestos?: number;
  descripcionMarca?: string;
  estado?: string;
}

export interface ApiInventoryItem {
  codigo: string;
  disponible: number;
}

export interface ApiClassificationItem {
  idClasificacionitem: number;
  txDescripcionClasificacionItem: string;
  nivel: number;
  idClasificacionitemPadre: number;
}

export type TipoIdentificacionCliente = 1 | 2 | 3 | 4 | 6;

export interface FacturaCliente {
  tipoIdentificacion: TipoIdentificacionCliente;
  numIdentificacion: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface FacturaRequest {
  cliente: FacturaCliente;
}
