import { Platform } from 'react-native';

// Configuração base da API
// Para testar com dispositivo físico, altere para o IP da sua máquina
// Ex: 'http://192.168.1.100:3000/api'
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Para desenvolvimento
    if (Platform.OS === 'android') {
      // Android emulator
      return 'http://10.0.2.2:3000/api';
    } else {
      // iOS simulator
      return 'http://localhost:3000/api';
    }
  } else {
    // Para produção
    return 'https://sua-api-em-producao.com/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      console.log('🌐 API Request:', {
        method: config.method || 'GET',
        url,
        body: config.body ? JSON.parse(config.body as string) : undefined,
      });

      const response = await fetch(url, config);
      const data = await response.json();

      console.log('📥 API Response:', {
        status: response.status,
        data,
      });

      if (!response.ok) {
        return {
          error: data.error || `Erro HTTP: ${response.status}`,
          details: data.details,
        };
      }

      return { data };
    } catch (error) {
      console.error('❌ API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Erro de conexão',
      };
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
}

export default new ApiService();
