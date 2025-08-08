// Teste simples para verificar se Jest está funcionando no React Native
describe('React Native Jest Setup', () => {
  it('deve executar um teste básico', () => {
    expect(1 + 1).toBe(2);
  });

  it('deve verificar tipos JavaScript básicos', () => {
    const testObject = { name: 'test', value: 42 };
    
    expect(testObject).toHaveProperty('name', 'test');
    expect(testObject).toHaveProperty('value', 42);
    expect(Array.isArray([])).toBe(true);
    expect(typeof 'string').toBe('string');
  });

  it('deve testar funções async/await', async () => {
    const asyncFunction = async () => {
      return new Promise(resolve => {
        setTimeout(() => resolve('success'), 10);
      });
    };

    const result = await asyncFunction();
    expect(result).toBe('success');
  });

  it('deve testar mocks básicos', () => {
    const mockFunction = jest.fn();
    mockFunction('test argument');
    
    expect(mockFunction).toHaveBeenCalledWith('test argument');
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});
