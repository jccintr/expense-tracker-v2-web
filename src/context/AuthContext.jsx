import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser } from '../api/authApi';
import { setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  // loading | authenticated | guest | error (servidor/rede indisponível: dá pra tentar de novo)
  const [status, setStatus] = useState('loading');
  const [sessionError, setSessionError] = useState('');

  // Revalida o token salvo toda vez que o app carrega (F5, aba nova) — sem
  // isso, um token expirado/revogado ficaria "autenticado" na UI até a
  // primeira chamada de API falhar em algum lugar aleatório.
  const loadSession = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setStatus('guest');
      return;
    }
    setStatus('loading');
    setSessionError('');
    try {
      const data = await fetchCurrentUser(storedToken);
      setTokenState(storedToken);
      setUser(data);
      setStatus('authenticated');
    } catch (err) {
      // 401 é a API dizendo de verdade "esse token não vale mais": aí sim
      // apagamos e pedimos login. Qualquer outro caso (sem rede, 500/502/503,
      // inclusive o servidor "acordando" no plano gratuito do Railway) NÃO
      // significa token inválido — apagar a sessão nesses casos fazia o app
      // pedir login a cada soluço de rede. Só oferecemos tentar de novo.
      if (err.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setTokenState(null);
        setUser(null);
        setStatus('guest');
        return;
      }
      setSessionError(
        err.status
          ? 'O servidor não respondeu como esperado. Tente novamente em alguns segundos.'
          : 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
      );
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const signIn = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setTokenState(newToken);
    setUser(newUser);
    setSessionError('');
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
    setUser(null);
    setStatus('guest');
  }, []);

  // Token expirado/revogado no meio do uso: a API responde 401 -> volta pro login.
  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo(
    () => ({ token, user, setUser, status, sessionError, signIn, signOut, retry: loadSession }),
    [token, user, status, sessionError, signIn, signOut, loadSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth precisa estar dentro de um AuthProvider');
  }
  return ctx;
}
