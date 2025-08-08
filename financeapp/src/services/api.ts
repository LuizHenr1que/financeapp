import { Platform } from 'react-native';

// Usa variável de ambiente do Expo (funciona com .env)
const prodUrl = process.env.EXPO_PUBLIC_API_URL;

// Define a URL base dependendo do ambiente
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Durante desenvolvimento
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api'; // Android Emulator
    } else {
      return 'http://localhost:3000/api'; 
    }
  } else {
    // Em produção, pega da variável do .env
    return prodUrl || 'https://financeapp-as0q.onrender.com/api';
  }

  //  return prodUrl || 'https://financeapp-as0q.onrender.com/api';
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
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      console.log('🌐 API Request:', {
        method: config.method || 'GET',
        url,
        headers: config.headers,
        body: config.body,
        bodyParsed: config.body ? JSON.parse(config.body as string) : undefined,
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
    console.log('📤 POST Request Debug:', {
      endpoint,
      data,
      token: token ? 'present' : 'none',
      stringified: data ? JSON.stringify(data) : 'undefined'
    });
    
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
