import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Label, TextInput } from 'flowbite-react';
import { register } from '../../api/authApi';
import PasswordInput from '../../components/PasswordInput';

export default function CadastroPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      // POST /auth/register não retorna token — não loga automaticamente.
      // Volta pro Login já com o email preenchido (mesmo fluxo do app Android).
      navigate('/login', { state: { prefillEmail: email.trim(), registered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-text">Criar conta</h1>
        <p className="mt-1 text-sm text-text-soft">
          Ao criar sua conta, já deixamos 3 contas e 3 categorias prontas pra você começar.
        </p>
      </div>

      {error && <Alert color="failure">{error}</Alert>}

      <div>
        <Label htmlFor="name">Nome</Label>
        <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
      </div>

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
          placeholder="Crie uma senha"
          autoComplete="new-password"
        />
      </div>

      <Button
        type="submit"
        isProcessing={loading}
        disabled={loading}
        className="mt-2 bg-primary! dark:bg-primary! text-primary-ink! enabled:hover:opacity-90"
      >
        Criar conta
      </Button>

      <p className="text-center text-sm text-text-soft">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
