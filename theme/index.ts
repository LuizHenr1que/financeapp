export const theme = {
  colors: {
    primary: '#00C896', // Verde mais forte para sistema
    primaryLight: '#4DD0A7', // Verde mais fraco para páginas internas
    primarySoft: '#E8F5F0', // Verde bem suave para backgrounds
    secondary: '#0f2e2a',
    background: '#fafafa',
    surface: '#ffffff',
    text: '#1e1e1e',
    textSecondary: '#666666',
    title: '#ffffff',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    border: '#e8e8e8',
    income: '#4caf50',
    expense: '#f44336',
  },
  typography: {
    small: 12,
    regular: 14,
    medium: 16,
    large: 18,
    title: 24,
    titleLarge: 32,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 16,
  },
  shadows: {
    small: {
      elevation: 2,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    medium: {
      elevation: 4,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
  },
};

export type Theme = typeof theme;