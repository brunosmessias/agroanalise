# AGENTS.md

> Guia para agentes de IA trabalhando neste projeto.

## Visão geral

Sistema web com autenticação (email/senha) e gerenciamento de permissões (RBAC). Construído sobre o stack T3 (Next.js + tRPC + Drizzle + Better Auth). Layout segue padrão shadcn-admin com sidebar inset.

## Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript strict
- **UI:** shadcn/ui (new-york style) + Tailwind CSS v4
- **API:** tRPC v11 + React Query v5
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Better Auth (admin plugin + access control)
- **Validation:** Zod (compartilhado client/server)
- **Forms:** React Hook Form + @hookform/resolvers
- **Icons:** Lucide React

## Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/          # Rotas públicas (login, cadastro)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/     # Rotas autenticadas
│   │   ├── layout.tsx   # SidebarProvider + SidebarInset
│   │   ├── page.tsx     # Dashboard home (cards de métricas)
│   │   └── permissions/ # Gerenciamento de roles
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/[...all]/route.ts
│   │   ├── ai/rewrite/route.ts   # Reescrita de textos com IA (OpenRouter)
│   │   └── trpc/[trpc]/route.ts
│   ├── layout.tsx       # Root layout (ThemeProvider + TooltipProvider)
│   └── not-found.tsx
├── components/
│   ├── ui/              # shadcn/ui components (não editar diretamente)
│   ├── layout/          # AppSidebar, Header
│   ├── auth/            # LoginForm, RegisterForm
│   ├── ai/              # AiRewriteButton (reescrita IA)
│   ├── theme-provider.tsx  # ThemeProvider + useTheme hook
│   ├── theme-switch.tsx    # Dropdown Claro/Escuro/Sistema
│   ├── search.tsx          # Botão de busca com ⌘K
│   └── profile-dropdown.tsx # Dropdown de perfil/avatar
├── server/
│   ├── db/
│   │   ├── index.ts     # Conexão com banco
│   │   └── schema.ts    # Drizzle schema
│   ├── api/
│   │   ├── root.ts      # Router principal
│   │   ├── trpc.ts      # tRPC context + procedures
│   │   └── routers/
│   │       ├── user.ts
│   │       └── permissions.ts
│   ├── better-auth/
│   │   ├── config.ts    # Better Auth config + admin plugin
│   │   ├── client.ts    # Auth client (browser)
│   │   ├── server.ts    # getSession helper
│   │   └── permissions.ts # Roles e access control
│   └── index.ts
├── shared/
│   └── schemas/         # Zod schemas (auth, user, permissions)
├── trpc/
│   ├── query-client.ts
│   ├── react.tsx        # TRPCReactProvider
│   └── server.ts        # Server-side caller
├── hooks/
│   └── use-mobile.ts    # Hook de breakpoint mobile
├── lib/
│   ├── auth-client.ts   # Better Auth client
│   └── utils.ts         # cn() utility
├── types/               # Type declarations
└── styles/
    └── globals.css
```

## Convenções

### Nomenclatura
- Arquivos: kebab-case (`user-router.ts`, `login-form.tsx`)
- Componentes: PascalCase exports
- Schemas Zod: sufixo `Schema` (`loginSchema`, `createRoleSchema`)
- tRPC routers: sufixo `Router` (`userRouter`, `permissionsRouter`)
- Procedures: camelCase (`getUsers`, `createRole`, `assignRole`)

### Import paths
- `~/` mapeia para `src/`
- `~/*` → `./src/*`

### Componentes
- Use `shadcn/ui` components de `src/components/ui/`
- Não edite componentes ui/ diretamente (use `npx shadcn` para atualizar)
- Componentes de feature em `src/components/auth/`, `src/components/layout/`
- Pages em App Router são server components por padrão
- Marque client components com `"use client"`

### Forms
- Use React Hook Form + Zod resolver
- Schemas Zod em `src/shared/schemas/`
- Validação compartilhada entre client e server

### tRPC
- Procedures públicas: `publicProcedure`
- Procedures autenticadas: `protectedProcedure`
- Procedures admin: `adminProcedure` (verifica role admin)
- Router principal em `src/server/api/root.ts`
- Queries: `.query()`, Mutations: `.mutation()`

### Auth
- `getSession()` para server components (de `~/server/better-auth/server`)
- `authClient` para client components (de `~/lib/auth-client`)
- Roles definidas em `~/server/better-auth/permissions.ts`
- Middleware protege rotas autenticadas

### Banco de dados
- Schema em `src/server/db/schema.ts`
- Comandos: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`
- Tabela prefix: sem prefixo (diferente da base T3)
- Drizzle queries em routers tRPC

## Comandos

```bash
pnpm dev          # Dev server com turbo
pnpm build        # Build de produção
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm check        # Lint + Typecheck
pnpm db:generate  # Gerar migration
pnpm db:migrate   # Aplicar migration
pnpm db:studio    # Drizzle Studio
pnpm format:write # Prettier
```

## Padrões de UI

### App Shell (padrão shadcn-admin)

**Layout hierárquico:**
```
<SidebarProvider>
  <AppSidebar />       # variant="inset", collapsible="icon"
  <SidebarInset>
    <Header />          # SidebarTrigger + Search + ThemeSwitch + ProfileDropdown
    <main />
  </SidebarInset>
</SidebarProvider>
```

**Sidebar:**
- Header: Logo + nome do app
- Content: Menu filtrado por role com tooltips e isActive
- Footer: User button (avatar + dropdown) com `bg-card`
- Rail: Handle de resize lateral
- Mobile: Drawer automático via Sheet

**Header/Navbar:**
- SidebarTrigger (variant="outline") | Separator | Search (⌘K) | ThemeSwitch | ProfileDropdown
- h-16 fixo, suporte a fixed com backdrop blur

### Sistema de tema
- ThemeProvider client-side no root layout
- Script blocking inline no `<head>` para anti-FOUC
- `@layer base { body { bg-background text-foreground } }` obrigatório
- Botões de ação usam `variant="outline"` para contraste em dark mode
- `<html suppressHydrationWarning>` obrigatório

### Dashboard
- Grid de 4 cards de métricas (sm:grid-cols-2 lg:grid-cols-4)
- Grid de conteúdo (lg:grid-cols-7) com overview + detalhes

### Estados de tela (obrigatório)
Todo componente de listagem/conteúdo deve ter:
1. **Loading** - Skeleton ou spinner
2. **Vazio** - Ilustração + mensagem + CTA
3. **Erro** - Card de erro com retry
4. **Sem permissão** - Card informativo

### Fluxos
- Criação/edição via modal (Dialog do shadcn)
- Feedback de sucesso/error via toast (Sonner)
- Confirmações destrutivas via AlertDialog

## RBAC

### Roles
- `admin`: Acesso total
- `user`: Acesso ao dashboard e próprios dados

### Verificação
- Frontend: Não renderiza botão/ação se sem permissão
- Backend: tRPC procedure valida role no servidor
- Middleware: Redireciona para login se não autenticado, mostra "sem permissão" se sem role

## Variáveis de ambiente

```env
BETTER_AUTH_SECRET=     # Obrigatório em produção
DATABASE_URL=           # PostgreSQL connection string
OPENROUTER_API_KEY=     # OpenRouter API key (IA para reescrita de textos)
```

## Principais dependências

- `better-auth` + `better-auth/plugins` - Auth + admin plugin
- `@trpc/server` + `@trpc/client` + `@trpc/react-query` - API
- `drizzle-orm` + `postgres` - Database
- `zod` - Validation
- `@t3-oss/env-nextjs` - Env validation
- `react-hook-form` + `@hookform/resolvers` - Forms
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `class-variance-authority` - Component variants (via shadcn)

SEMPRE USAR A SKILL 'tlc-spec-driven' PARA QUALQUER ALTERAÇÃO OU ADIÇÃO NO CODIGO

SEMPRE MANTER A DOC ATUALIZADA
