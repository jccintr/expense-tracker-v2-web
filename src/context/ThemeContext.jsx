import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'theme'; // mesma chave que o script anti-flash em index.html lê

function getSystemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Três estados, não dois — 'light' | 'dark' | 'system'. Diferente do app
// mobile (que só segue o sistema, sem seletor), aqui o pedido foi "com
// opção para selecionar", e o padrão recomendado pra isso é dar as três
// opções em vez de só claro/escuro: quem nunca mexe continua seguindo o
// SO automaticamente, e quem quer travar um tema específico também pode.
export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system');
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);

  // Reage a mudança do tema do SO em tempo real (útil quando a preferência
  // é 'system' e o usuário troca o tema do Windows/macOS com a aba aberta).
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e) => setSystemPrefersDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const isDark = preference === 'dark' || (preference === 'system' && systemPrefersDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const setThemePreference = (value) => {
    setPreference(value);
    if (value === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, value);
    }
  };

  const value = useMemo(
    () => ({ preference, isDark, setThemePreference }),
    [preference, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme precisa estar dentro de um ThemeProvider');
  }
  return ctx;
}
