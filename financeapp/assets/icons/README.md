# Guia de Ícones do InFinance App

## Estrutura de Pastas

```
assets/icons/
├── android/
│   ├── icon.png (512x512px ou 1024x1024px)
│   └── adaptive-icon.png (512x512px)
├── ios/
│   └── icon.png (1024x1024px)
└── icon.png (1024x1024px - ícone principal)
```

## Requisitos dos Ícones

### Ícone Principal (Expo)
- **Arquivo**: `assets/images/icon.png` (já configurado)
- **Tamanho**: 1024x1024px
- **Formato**: PNG com fundo transparente ou sólido
- **Uso**: Ícone padrão usado pelo Expo

### Android
1. **Ícone Principal**
   - **Arquivo**: `assets/icons/android/icon.png`
   - **Tamanho**: 512x512px ou 1024x1024px
   - **Formato**: PNG

2. **Adaptive Icon** (Android 8.0+)
   - **Arquivo**: `assets/icons/android/adaptive-icon.png`
   - **Tamanho**: 512x512px
   - **Formato**: PNG com fundo transparente
   - **Nota**: Deve ser apenas o foreground, sem fundo

### iOS
- **Arquivo**: `assets/icons/ios/icon.png`
- **Tamanho**: 1024x1024px
- **Formato**: PNG
- **Nota**: O iOS gerará automaticamente todos os tamanhos necessários

## Como Adicionar Seus Ícones

1. Coloque seu ícone principal (1024x1024px) em `assets/images/icon.png`
2. Coloque o ícone do Android em `assets/icons/android/icon.png`
3. Coloque o adaptive icon do Android em `assets/icons/android/adaptive-icon.png`
4. Coloque o ícone do iOS em `assets/icons/ios/icon.png`

## Dicas Importantes

- **Adaptive Icons**: Para Android, o adaptive icon deve ocupar cerca de 70% do espaço total (deixe uma margem)
- **Formato**: Use PNG para melhor qualidade
- **Cores**: Certifique-se de que o ícone fica bem em fundos claros e escuros
- **Simplicidade**: Ícones simples e reconhecíveis funcionam melhor em tamanhos pequenos

## Testando os Ícones

Após adicionar os ícones, execute:
```bash
npx expo prebuild --clean
```

Isso irá gerar os ícones nativos para Android e iOS.
