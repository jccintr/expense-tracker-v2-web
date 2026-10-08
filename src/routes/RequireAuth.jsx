import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';
import Logo from '../components/Logo';

export default function RequireAuth() {
  const { status, sessionError, retry } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullScreenLoader />;

  if (status === 'guest') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Servidor/rede indisponível: mantém a sessão salva e oferece tentar de novo
  // (em vez de mandar pro login e perder um token perfeitamente válido).
  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <Logo className="h-12 w-12" />
        <p className="max-w-sm text-sm text-text-soft">{sessionError}</p>
        <Button onClick={retry} className="bg-primary! dark:bg-primary! text-primary-ink! enabled:hover:opacity-90">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return <Outlet />;
}
