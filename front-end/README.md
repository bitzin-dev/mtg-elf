# Portal MTG Front-end

Aplicacao React + TypeScript para gerenciamento de colecoes de Magic: The Gathering.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Hono RPC client tipado (`services/honoClient.ts`)

## Como rodar

1. Instale dependencias:

```bash
npm install
```

2. Configure a URL da API (opcional, default `http://localhost:4000`):

```bash
# .env.local
VITE_API_URL=http://localhost:4000
```

3. Rode em desenvolvimento:

```bash
npm run dev
```

4. Build de producao:

```bash
npm run build
```

## Funcionalidades principais

- Autenticacao por token com restauracao de sessao no boot.
- Dashboard completo de colecao (checklist, owned, filtros, busca e progresso).
- CRUD de colecoes e pesquisas salvas.
- Listas globais de compra e impressao.
- Compartilhamento de colecao via link publico.
- Binder view para visualizacao da colecao.
- Importacao e exportacao de colecao.
- Pagina de spoilers integrada ao fluxo principal.

## Spoilers (novo)

O componente `components/SpoilersPage.tsx` esta integrado no `App.tsx` com navegacao completa:

- Acesso por botao `SPOILERS` no header desktop.
- Acesso pela `DashboardSidebar` (secao `Explorar`).
- Acesso no menu de ferramentas mobile.
- View dedicada `spoilers` no estado de tela principal.

Comportamento:

- Usa dados oficiais via Scryfall (sets recentes).
- Permite adicionar cartas direto na colecao ativa.
- Aba de spoilers recentes customizados com persistencia em `localStorage`.
- Painel admin para upload/paste/crop de imagem e criacao manual de spoiler.

## Sessao e autenticacao (atualizado)

Melhorias recentes no front-end:

- Header `Authorization` dinamico por request (evita token stale).
- Validacao de sessao no boot usando `me()`.
- Limpeza centralizada de sessao via `clearAuthSession()`.
- Logout limpa token, sessao local e cache de sessao.
- Tratamento mais robusto de falhas de login/registro.

Arquivos principais:

- `services/honoClient.ts`
- `components/AuthModal.tsx`
- `App.tsx`

## Scanner

O scanner com IA esta temporariamente desativado no front-end.

- Arquivo: `components/ScannerModal.tsx`
- Estado atual: mostra mensagem de indisponibilidade.

## Estrutura principal

```txt
front-end/
  App.tsx
  components/
  services/
  utils/
  types.ts
```

## Observacoes

- Este front-end depende da API do backend para login, colecoes e pesquisas.
- Dados auxiliares e caches locais usam `localStorage` e `sessionStorage`.
