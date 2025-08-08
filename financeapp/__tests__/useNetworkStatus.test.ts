import { renderHook, act } from '@testing-library/react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

// Mock do fetch global
global.fetch = jest.fn();

// Mock do AsyncStorage
const mockAsyncStorage = require('@react-native-async-storage/async-storage');

// Mock do Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

describe('useNetworkStatus Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock successful fetch by default
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('deve inicializar com estado conectado', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.connectivity.isConnected).toBe(true);
    expect(result.current.connectivity.isChecking).toBe(false);
    expect(result.current.connectivity.failedAttempts).toBe(0);
    expect(result.current.connectivity.lastCheck).toBeNull();
  });

  it('deve inicializar syncStatus corretamente', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.syncStatus.lastSync).toBeNull();
    expect(result.current.syncStatus.isSyncing).toBe(false);
    expect(result.current.syncStatus.hasPendingChanges).toBe(false);
  });

  it('deve verificar conectividade com sucesso', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
      const isConnected = await result.current.checkConnectivity();
      expect(isConnected).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://httpbin.org/status/200',
      expect.objectContaining({
        method: 'HEAD',
        signal: expect.any(AbortSignal),
      })
    );

    expect(result.current.connectivity.isConnected).toBe(true);
    expect(result.current.connectivity.isChecking).toBe(false);
    expect(result.current.connectivity.lastCheck).toBeInstanceOf(Date);
  });

  it('deve detectar falha de conectividade', async () => {
    // Mock fetch failure
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
      const isConnected = await result.current.checkConnectivity();
      expect(isConnected).toBe(false);
    });

    expect(result.current.connectivity.isConnected).toBe(false);
    expect(result.current.connectivity.failedAttempts).toBe(1);
    expect(result.current.connectivity.lastCheck).toBeInstanceOf(Date);
  });

  it('deve incrementar falhas consecutivas', async () => {
    // Mock fetch failure
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNetworkStatus());

    // Primeira falha
    await act(async () => {
      await result.current.checkConnectivity();
    });

    expect(result.current.connectivity.failedAttempts).toBe(1);

    // Segunda falha
    await act(async () => {
      await result.current.checkConnectivity();
    });

    expect(result.current.connectivity.failedAttempts).toBe(2);
  });

  it('deve resetar falhas após reconexão', async () => {
    // Primeiro: simular falha
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
      await result.current.checkConnectivity();
    });

    expect(result.current.connectivity.failedAttempts).toBe(1);

    // Depois: simular sucesso
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });

    await act(async () => {
      await result.current.checkConnectivity();
    });

    expect(result.current.connectivity.isConnected).toBe(true);
    expect(result.current.connectivity.failedAttempts).toBe(0);
  });

  it('não deve fazer verificação se já estiver verificando', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    // Simular que já está verificando
    act(() => {
      result.current.connectivity.isChecking = true;
    });

    await act(async () => {
      await result.current.checkConnectivity();
    });

    // Fetch não deve ter sido chamado
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('deve respeitar timeout na verificação', async () => {
    // Mock fetch que demora muito
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise((resolve) => setTimeout(resolve, 10000))
    );

    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
      const promise = result.current.checkConnectivity();
      
      // Avançar o timer para simular timeout
      jest.advanceTimersByTime(5000);
      
      await promise;
    });

    expect(result.current.connectivity.isConnected).toBe(false);
  });
});
