const API_BASE_URL = '/api';

const API_CONFIG = {
  Login: 'Yuberin',
  Password: '2015',
  IdPuntoVenta: 1,
  IdNivelPrecio: 1,
};

let cachedToken: string | null = null;

export const authService = {
  async login(forceNew: boolean = false): Promise<string> {
    if (forceNew) {
      cachedToken = null;
    }
    
    if (cachedToken) {
      return cachedToken;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/usuario/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Login: API_CONFIG.Login,
          Password: API_CONFIG.Password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error de autenticación: ${response.status} - ${errorText}`);
      }

      const tokenText = await response.text();
      cachedToken = tokenText;
      
      return cachedToken;
    } catch (error: any) {
      throw error;
    }
  },

  clearToken() {
    cachedToken = null;
  },
  
  forceNewLogin() {
    cachedToken = null;
  },
};

export const productService = {
  async getProducts(): Promise<any[]> {
    try {
      const token = await authService.login();

      const url = `${API_BASE_URL}/item/search3?IdPuntoVenta=${API_CONFIG.IdPuntoVenta}&IdNivelPrecio=${API_CONFIG.IdNivelPrecio}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': token,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al obtener productos: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      throw error;
    }
  },
};

export default productService;
