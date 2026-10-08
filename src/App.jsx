import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import RequireAuth from './routes/RequireAuth';
import RequireGuest from './routes/RequireGuest';
import AuthLayout from './components/layout/AuthLayout';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import CadastroPage from './pages/auth/CadastroPage';
import TransacoesPage from './pages/transacoes/TransacoesPage';
import BuscaPage from './pages/busca/BuscaPage';
import GraficosPage from './pages/graficos/GraficosPage';
import ContasPage from './pages/contas/ContasPage';
import CategoriasPage from './pages/categorias/CategoriasPage';
import PerfilPage from './pages/perfil/PerfilPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route index element={<Navigate to="/transacoes" replace />} />

              <Route element={<RequireGuest />}>
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/cadastro" element={<CadastroPage />} />
                </Route>
              </Route>

              <Route element={<RequireAuth />}>
                <Route element={<AppLayout />}>
                  <Route path="/transacoes" element={<TransacoesPage />} />
                  <Route path="/busca" element={<BuscaPage />} />
                  <Route path="/graficos" element={<GraficosPage />} />
                  <Route path="/contas" element={<ContasPage />} />
                  <Route path="/categorias" element={<CategoriasPage />} />
                  <Route path="/perfil" element={<PerfilPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
