# Expense Tracker — Web

Versão web do app Android [expense-tracker-app-v2](https://github.com/jccintr/expense-tracker-app-v2), consumindo a mesma API (AdonisJS).

## Stack

React 19 · JavaScript · Vite · Tailwind CSS v4 · flowbite-react · react-router-dom 7 · react-icons · oxlint · vitest

Temas **claro / escuro / sistema** (botão no topo; preferência salva em `localStorage`, sem flash ao carregar).

## Como rodar

```bash
npm install
cp .env.example .env     # ajuste VITE_API_BASE_URL se necessário
npm run dev
```

Outros scripts: `npm run build`, `npm run preview`, `npm run lint`, `npm test`.

## Telas

Login · Cadastro · Transações (navegação por dia + total do dia) · Busca (descrição, período, categoria, conta) · Gráficos (barras por semana, pizza por categoria do mês) · Contas · Categorias · Perfil.

## Particularidades da API (tratadas no código)

- **Fuso:** a API usa America/Sao_Paulo (UTC-3 fixo). Todas as datas do app seguem isso (`src/utils/date.js`).
- **Sem data retroativa:** `POST /transactions` não aceita data; a transação é sempre criada "agora". O formulário avisa isso.
- **Resumo semanal:** o `week_number` padrão do servidor é instável, então o app sempre envia o número da semana calculado no cliente com a mesma regra do servidor (testado em `tests/date.test.js`).
- **Erros:** a API devolve 3 formatos de erro; `src/api/client.js` normaliza todos.
- **Sessão:** só o 401 apaga o token. Falha de rede / 5xx mostra tela com "Tentar novamente" (útil no cold start do Railway).
- **409** ao excluir conta/categoria com transações vinculadas → mensagem amigável.
- Valores (`amount`) podem chegar como string; sempre convertidos antes de exibir.

## Melhorias em relação ao app Android

Navegação para o futuro limitada à semana/mês atual, pizza com 1 categoria desenhada como círculo completo, lista de valores por dia sob o gráfico de barras, total e contagem nos resultados da busca, validação do intervalo de datas.
