import { authService } from '@/infrastructure/api/authService';
import { invoiceService } from '@/infrastructure/api/invoiceApi';
import { productService } from '@/infrastructure/api/productApi';

export type {
  ApiClassificationItem,
  ApiInventoryItem,
  ApiProductItem,
  FacturaCliente,
  FacturaRequest,
  TipoIdentificacionCliente,
} from '@/infrastructure/api/types';

export { authService, invoiceService, productService };

export default {
  auth: authService,
  products: productService,
  invoice: invoiceService,
};
