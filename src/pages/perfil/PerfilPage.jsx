import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';

export default function PerfilPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-text">Perfil</h1>

      <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-ink">
          {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-text">{user?.name}</p>
          <p className="truncate text-sm text-text-soft">{user?.email}</p>
        </div>
      </div>

      <div>
        <Button color="red" onClick={() => setLogoutConfirmOpen(true)}>
          Sair da conta
        </Button>
      </div>

      <ConfirmModal
        show={logoutConfirmOpen}
        title="Sair da conta"
        message="Deseja sair da sua conta?"
        confirmLabel="Sair"
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
}
