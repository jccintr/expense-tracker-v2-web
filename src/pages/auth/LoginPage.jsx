import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Label, TextInput, Spinner } from 'flowbite-react';
import { useAuth } from '../../context/AuthContext';
import { fetchCurrentUser, login } from '../../api/authApi';
import PasswordInput from '../../components/PasswordInput';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState(location.state?.prefillEmail ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // POST /auth/login devolve só { token }; os dados do usuário vêm de /users/me.
      const { token } = await login({ email: email.trim(), password });
      const user = await fetchCurrentUser(token);
      signIn(token, user);
      navigate(location.state?.from?.pathname ?? '/transacoes', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-text">Entrar na sua conta</h1>
        <p className="mt-1 text-sm text-text-soft">Informe suas credenciais</p>
      </div>

      {location.state?.registered && (
        <Alert color="success">Sua conta foi criada com sucesso. Faça login para continuar.</Alert>
      )}
      {error && <Alert color="failure">{error}</Alert>}

      <div>
        <Label htmlFor="email">Email</Label>
        <TextInput
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Informe o seu email"
          autoComplete="email"
        />
      </div>

      <div>
        <Label htmlFor="password">Senha</Label>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Informe a sua senha"
          autoComplete="current-password"
        />
      </div>

      <Button
        type="submit"
        isProcessing={loading}
        disabled={loading}
        className="mt-2 bg-primary! dark:bg-primary! text-primary-ink! enabled:hover:opacity-90"
      >
        {loading ? <Spinner size="sm" /> : 'Entrar'}
      </Button>

      <p className="text-center text-sm text-text-soft">
        Não tem conta?{' '}
        <Link to="/cadastro" className="font-semibold text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
