import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="text-4xl font-bold text-text">404</h1>
      <p className="text-text-soft">Essa página não existe.</p>
      <Link to="/transacoes">
        <Button className="bg-primary! dark:bg-primary! text-primary-ink! enabled:hover:opacity-90">Voltar pro início</Button>
      </Link>
    </div>
  );
}
