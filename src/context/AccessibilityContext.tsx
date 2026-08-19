import React, { createContext, useContext, useState, useEffect } from 'react';

export type TextSize = 'normal' | 'large' | 'xlarge';
export type ThemeMode = 'light' | 'dark' | 'high-contrast';

interface AccessibilityContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  toggleDarkMode: () => void;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('jansetu_theme') as ThemeMode;
    return saved || 'light';
  });

  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    const saved = localStorage.getItem('jansetu_text_size') as TextSize;
    return saved || 'normal';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'high-contrast');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'high-contrast') {
      root.classList.add('high-contrast');
    }

    localStorage.setItem('jansetu_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    root.classList.add(`text-size-${textSize}`);
    localStorage.setItem('jansetu_text_size', textSize);
  }, [textSize]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
  };

  const toggleHighContrast = () => {
    setThemeState(prev => (prev === 'high-contrast' ? 'light' : 'high-contrast'));
  };

  const toggleDarkMode = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const increaseTextSize = () => {
    if (textSize === 'normal') setTextSizeState('large');
    else if (textSize === 'large') setTextSizeState('xlarge');
  };

  const decreaseTextSize = () => {
    if (textSize === 'xlarge') setTextSizeState('large');
    else if (textSize === 'large') setTextSizeState('normal');
  };

  const resetAccessibility = () => {
    setThemeState('light');
    setTextSizeState('normal');
  };

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        setTheme,
        textSize,
        setTextSize,
        isHighContrast: theme === 'high-contrast',
        toggleHighContrast,
        toggleDarkMode,
        increaseTextSize,
        decreaseTextSize,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
