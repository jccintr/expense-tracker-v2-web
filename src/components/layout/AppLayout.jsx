import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  HiOutlineChartBar,
  HiOutlineCreditCard,
  HiOutlineLogout,
  HiOutlineSwitchHorizontal,
  HiOutlineTag,
  HiOutlineUser,
} from 'react-icons/hi';
import Logo from '../Logo';
import ThemeToggle from '../ThemeToggle';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/transacoes', label: 'Transações', icon: HiOutlineSwitchHorizontal },
  { to: '/graficos', label: 'Gráficos', icon: HiOutlineChartBar },
  { to: '/contas', label: 'Contas', icon: HiOutlineCreditCard },
  { to: '/categorias', label: 'Categorias', icon: HiOutlineTag },
  { to: '/perfil', label: 'Perfil', icon: HiOutlineUser },
];

export default function AppLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="hidden font-bold text-text lg:inline">Expense Tracker</span>
          </div>

          <nav className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                title={label}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-text-soft hover:bg-surface-alt hover:text-text'
                  }`
                }
              >
                <Icon className="h-5 w-5 md:h-4 md:w-4" />
                <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-text-soft transition-colors hover:bg-surface-alt hover:text-danger"
              title="Sair da conta"
            >
              <HiOutlineLogout className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
