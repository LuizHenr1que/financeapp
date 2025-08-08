import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../components/Button';

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o componente corretamente', () => {
    const { getByText } = render(
      <Button title="Teste Button" onPress={mockOnPress} />
    );

    expect(getByText('Teste Button')).toBeTruthy();
  });

  it('deve chamar onPress quando pressionado', () => {
    const { getByText } = render(
      <Button title="Clique Aqui" onPress={mockOnPress} />
    );

    const button = getByText('Clique Aqui');
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('não deve chamar onPress quando desabilitado', () => {
    const { getByText } = render(
      <Button title="Desabilitado" onPress={mockOnPress} disabled={true} />
    );

    const button = getByText('Desabilitado');
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('deve aplicar variant primary por padrão', () => {
    const { getByText } = render(
      <Button title="Primary Button" onPress={mockOnPress} />
    );

    const buttonContainer = getByText('Primary Button').parent;
    expect(buttonContainer).toBeTruthy();
  });

  it('deve aplicar variant secondary quando especificado', () => {
    const { getByText } = render(
      <Button title="Secondary Button" onPress={mockOnPress} variant="secondary" />
    );

    const buttonContainer = getByText('Secondary Button').parent;
    expect(buttonContainer).toBeTruthy();
  });

  it('deve aplicar variant outline quando especificado', () => {
    const { getByText } = render(
      <Button title="Outline Button" onPress={mockOnPress} variant="outline" />
    );

    const buttonContainer = getByText('Outline Button').parent;
    expect(buttonContainer).toBeTruthy();
  });

  it('deve aplicar tamanho medium por padrão', () => {
    const { getByText } = render(
      <Button title="Medium Button" onPress={mockOnPress} />
    );

    const buttonContainer = getByText('Medium Button').parent;
    expect(buttonContainer).toBeTruthy();
  });

  it('deve aplicar tamanho small quando especificado', () => {
    const { getByText } = render(
      <Button title="Small Button" onPress={mockOnPress} size="small" />
    );

    const buttonContainer = getByText('Small Button').parent;
    expect(buttonContainer).toBeTruthy();
  });

  it('deve aplicar tamanho large quando especificado', () => {
    const { getByText } = render(
      <Button title="Large Button" onPress={mockOnPress} size="large" />
    );

    const buttonContainer = getByText('Large Button').parent;
    expect(buttonContainer).toBeTruthy();
  });

  it('deve aceitar estilos customizados', () => {
    const customStyle = { backgroundColor: 'red' };
    const customTextStyle = { color: 'blue' };

    const { getByText } = render(
      <Button 
        title="Custom Style" 
        onPress={mockOnPress} 
        style={customStyle}
        textStyle={customTextStyle}
      />
    );

    expect(getByText('Custom Style')).toBeTruthy();
  });
});
