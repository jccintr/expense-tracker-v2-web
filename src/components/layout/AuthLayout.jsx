import { Outlet } from 'react-router-dom';
import Logo from '../Logo';
import ThemeToggle from '../ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Logo className="h-12 w-12" />
          <span className="text-lg font-bold text-text">Expense Tracker</span>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
