import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { listAccounts } from '../api/accountsApi';
import { listCategories } from '../api/categoriesApi';

const DataContext = createContext(null);

// Contas e categorias são usadas em vários lugares (seletores do formulário de
// transação e da busca, telas de gerenciamento). Em vez de cada tela buscar
// isso sozinha, carregamos uma vez quando a sessão fica autenticada e cada
// tela chama refreshAccounts()/refreshCategories() só quando algo muda.
export function DataProvider({ children }) {
  const { token, status } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshAccounts = useCallback(async () => {
    const data = await listAccounts(token);
    setAccounts(data);
    return data;
  }, [token]);

  const refreshCategories = useCallback(async () => {
    const data = await listCategories(token);
    setCategories(data);
    return data;
  }, [token]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([refreshAccounts(), refreshCategories()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [refreshAccounts, refreshCategories]);

  useEffect(() => {
    if (status === 'authenticated') {
      refreshAll();
    } else if (status === 'guest') {
      // Logout: não deixa contas/categorias do usuário anterior na memória.
      setAccounts([]);
      setCategories([]);
      setError('');
    }
  }, [status, refreshAll]);

  const value = useMemo(
    () => ({ accounts, categories, loading, error, refreshAccounts, refreshCategories, refreshAll }),
    [accounts, categories, loading, error, refreshAccounts, refreshCategories, refreshAll]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useAppData precisa estar dentro de um DataProvider');
  }
  return ctx;
}
