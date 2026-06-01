# SDD - Projeto Novo

Status: Ativo
Data: 2026-05-13

## 1. Contexto e Escopo

### 1.1 Contexto do produto
- Problema que o projeto resolve: Sistema de autenticação e gerenciamento de permissões para aplicações web
- Público-alvo: Administradores de sistema e desenvolvedores que precisam de controle de acesso
- Objetivo de negócio: Fornecer uma base sólida de auth + RBAC reutilizável

### 1.2 Escopo in/out
- In scope (nesta fase):
  - Tela de login com email e senha
  - Tela de cadastro com email e senha
  - Página de gerenciamento de permissões (RBAC)
  - App shell autenticado com sidebar inset + header
  - Proteção de rotas por perfil
  - Dashboard com cards de métricas
- Out of scope (fora desta fase):
  - Login social (Google, GitHub)
  - Recuperação de senha
  - Verificação de email
  - OTP/2FA

### 1.3 Stakeholders e papéis
- Product Owner: Bruno
- Tech Lead: Bruno
- Design: Bruno
- QA: -
- Segurança: -

---

## 2. Requisitos funcionais

### 2.1 Lista de features
- F01: Login com email e senha
- F02: Cadastro com email e senha
- F03: Logout
- F04: Gerenciamento de permissões (RBAC) - CRUD de roles e atribuição a usuários
- F05: App shell autenticado com sidebar inset + header
- F06: Proteção de rotas por role
- F07: Dashboard com cards de métricas e visão geral

### 2.2 Fluxos críticos
- Fluxo 1: Usuário acessa a aplicação → redirecionado para login → faz login → redirecionado para dashboard
- Fluxo 2: Usuário acessa cadastro → preenche dados → conta criada → redirecionado para login
- Fluxo 3: Admin acessa página de permissões → visualiza roles → cria/edita role → atribui role a usuário
- Fluxo 4: Usuário sem permissão tenta acessar página protegida → vê estado "sem permissão"

### 2.3 Regras de negócio-chave
- RN01: Email deve ser único no sistema
- RN02: Senha deve ter no mínimo 8 caracteres
- RN03: Todo usuário cadastrado recebe role "user" por padrão
- RN04: Apenas admin pode gerenciar roles e permissões
- RN05: Roles são definidas com statements de permissão (recurso + ações)
- RN06: Sessão expira após 7 dias de inatividade

---

## 3. Requisitos não funcionais

### 3.1 Segurança
- AuthN: Better Auth com sessão cookie-based
- AuthZ: RBAC via admin plugin do Better Auth com access control
- Validação de entrada: Zod no client e server
- Proteção de segredos: env vars via @t3-oss/env-nextjs

### 3.2 Performance
- LCP < 2.5s por rota crítica
- Bundle < 200KB por rota

### 3.3 Acessibilidade
- Meta WCAG 2.2 AA
- Formulários com labels, aria e foco visível

### 3.4 Confiabilidade/Operação
- Logs via console em dev
- Error boundary nas páginas

---

## 4. Arquitetura e Stack

### 4.1 Stack obrigatória
- Framework: Next.js 15 (App Router) + React 19 + TypeScript strict
- UI: shadcn/ui (new-york style) + Radix primitives
- CSS: Tailwind CSS v4 (`@theme inline` para design tokens)
- API: tRPC v11 + React Query v5
- Banco: PostgreSQL + Drizzle ORM
- Auth: Better Auth (admin plugin + access control)
- Formulários: React Hook Form + Zod (client + server)
- Qualidade: ESLint + TypeScript strict
- Ícones: Lucide React

### 4.2 Decisões arquiteturais
- ADR-001: Fluxos de criação/edição via modal por padrão
- ADR-002: RBAC obrigatório por rota e por ação, com validação no backend
- ADR-003: Layout autenticado padronizado com Sidebar inset + Header global (padrão shadcn-admin)
- ADR-004: Estados de tela obrigatórios (loading, vazio, erro, sem permissão)
- ADR-005: Contrato único de erro para feedback consistente
- ADR-006: ThemeProvider client-side com script blocking inline para evitar FOUC em dark mode
- ADR-007: Botões de ação no header/sidebar usam `variant="outline"` para garantir contraste em dark mode

### 4.3 Estrutura de pastas
```
src/
├── app/
│   ├── (auth)/          # Layout público (login, cadastro)
│   ├── (dashboard)/     # Layout autenticado (sidebar + header)
│   ├── api/
│   │   ├── auth/[...all]/route.ts
│   │   └── trpc/[trpc]/route.ts
│   ├── layout.tsx       # Root layout (ThemeProvider, TooltipProvider)
│   └── not-found.tsx
├── components/
│   ├── ui/              # shadcn/ui (não editar diretamente)
│   ├── layout/          # AppSidebar, Header
│   ├── auth/            # LoginForm, RegisterForm
│   ├── theme-provider.tsx
│   ├── theme-switch.tsx
│   ├── search.tsx
│   └── profile-dropdown.tsx
├── server/
│   ├── db/              # Drizzle schema + connection
│   ├── api/             # tRPC routers
│   └── better-auth/     # Auth config
├── shared/
│   └── schemas/         # Zod schemas compartilhados
├── trpc/                # tRPC client setup
├── hooks/               # Custom hooks (use-mobile, etc.)
├── lib/                 # Utils e auth-client
├── types/               # Type declarations
└── styles/
    └── globals.css
```

---

## 5. Sistema de design e layout

### 5.1 App shell padrão (padrão shadcn-admin)
O layout autenticado segue o padrão do projeto shadcn-admin com sidebar inset:

**Estrutura hierárquica:**
```
<SidebarProvider>          # Gerencia estado open/collapsed
  <AppSidebar />           # Sidebar com variant="inset" + collapsible="icon"
  <SidebarInset>           # Container do conteúdo principal
    <Header />             # Navbar com trigger + search + ações
    <main />               # Conteúdo da página
  </SidebarInset>
</SidebarProvider>
```

**Sidebar (`AppSidebar`):**
- Componente: `<Sidebar collapsible="icon" variant="inset">`
- `SidebarHeader`: Logo + nome do app com link para home
- `SidebarContent`: Menu de navegação filtrado por role do usuário (`SidebarGroup` + `SidebarMenuButton` com `tooltip` e `isActive`)
- `SidebarFooter`: User button com dropdown (avatar + nome + email + ChevronsUpDown), bg-card para contraste no dark mode
- `SidebarRail`: Handle de redimensionamento lateral
- Colapso: ao colapsar, mostra apenas ícones com tooltips
- Mobile: drawer automático via `SidebarProvider` + `Sheet`

**Header/Navbar:**
- Componente: `<Header>` dentro de `<SidebarInset>`
- Altura fixa: `h-16`
- Composição da barra (esquerda → direita):
  1. `SidebarTrigger` (variant="outline") — toggle da sidebar
  2. `Separator` vertical
  3. `Search` — botão de busca com `⌘K` placeholder
  4. `ThemeSwitch` — dropdown Claro/Escuro/Sistema (ícone Sun/Moon animado)
  5. `ProfileDropdown` — avatar com dropdown de perfil e logout
- Suporte a `fixed` com blur backdrop on scroll

**Dashboard page:**
- Grid de 4 cards de métricas (`sm:grid-cols-2 lg:grid-cols-4`)
- Grid de conteúdo adicional (`lg:grid-cols-7`) com área de overview e atividade recente

### 5.2 Sistema de tema (dark mode)
- `ThemeProvider` no root layout, client-side
- Script blocking inline no `<head>` para aplicar tema ANTES do paint (evita FOUC):
  ```html
  <script>
    (function() {
      var theme = localStorage.getItem('projeto-novo-theme') || 'system';
      var dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.add(dark ? 'dark' : 'light');
    })();
  </script>
  ```
- `@custom-variant dark (&:is(.dark *))` no globals.css
- `@layer base { body { @apply bg-background text-foreground; } }` obrigatório para contraste
- Variáveis CSS completas para light/dark no `:root` e `.dark`
- `<html suppressHydrationWarning>` necessário

### 5.3 Componentes globais criados

| Componente | Arquivo | Descrição |
|---|---|---|
| `ThemeProvider` | `src/components/theme-provider.tsx` | Context provider de tema (light/dark/system) com localStorage |
| `useTheme()` | hook exportado do theme-provider | Acesso ao tema atual e setter |
| `ThemeSwitch` | `src/components/theme-switch.tsx` | Botão dropdown Sun/Moon com opções Claro/Escuro/Sistema |
| `Search` | `src/components/search.tsx` | Botão de busca com ícone e atalho ⌘K |
| `ProfileDropdown` | `src/components/profile-dropdown.tsx` | Dropdown de perfil com avatar, nome, email e logout |
| `AppSidebar` | `src/components/layout/app-sidebar.tsx` | Sidebar completa com nav filtrada por role e user button |
| `Header` | `src/components/layout/header.tsx` | Navbar com trigger, search, theme switch e profile |

### 5.4 Componentes shadcn/ui instalados
- `sidebar` (com `SidebarProvider`, `Sidebar`, `SidebarInset`, `SidebarTrigger`, `SidebarRail`, etc.)
- `sheet` (usado internamente pela sidebar para mobile)
- `breadcrumb`
- `skeleton`
- `separator`
- `button`, `avatar`, `dropdown-menu`, `tooltip`, `input`, `card`, `badge`, `dialog`, `label`, `table`

### 5.5 Padrão de listagens
- Toolbar com busca e ações
- Tabela com paginação
- Shape de erro padrão

### 5.6 Padrão de formulários
- Validação com Zod
- Mensagens de erro inline
- Submit com loading state
- Botão desabilitado durante envio

---

## 6. RBAC e autorização

### 6.1 Matriz de permissões
| Recurso/Página | View | Create | Update | Delete | Ações especiais |
|---|---|---|---|---|---|
| Dashboard | Admin, User | - | - | - | - |
| Permissões (Roles) | Admin | Admin | Admin | Admin | Atribuir role: Admin |
| Usuários (listagem) | Admin | - | Admin | - | - |

### 6.2 Roles definidas
- `admin`: Acesso total ao sistema
- `user`: Acesso ao dashboard e próprios dados

### 6.3 Statements de permissão
```typescript
const statements = {
  permissions: ["create", "read", "update", "delete"],
  users: ["read", "update"],
  dashboard: ["read"],
} as const;
```

---

## 7. Contratos técnicos

### 7.1 Contrato de estados por feature
- Loading: Skeleton/spinner
- Vazio: Ilustração + mensagem + CTA
- Erro: Card de erro com retry
- Sem permissão: Card informativo

### 7.2 Contrato de erro de API
```json
{
  "code": "FORBIDDEN",
  "message": "Você não tem permissão para esta ação",
  "details": null
}
```

### 7.3 Convenção de URL
- Filtros via querystring: `q`, `page`, `pageSize`, `sort`

---

## 8. Plano de entrega

### 8.1 Roadmap
- Fase 1: App shell + autenticação (login/cadastro) ✅
- Fase 2: Dashboard + design system completo ✅
- Fase 3: RBAC + página de permissões
- Fase 4: Hardening + testes

### 8.2 Sequência de implementação
1. Setup do projeto a partir da base T3 ✅
2. Schema do banco (user + roles) ✅
3. Better Auth com admin plugin + access control ✅
4. Páginas de login e cadastro ✅
5. App shell (sidebar inset + header com search/theme switch/profile) ✅
6. Dashboard com cards de métricas ✅
7. Middleware de proteção de rotas
8. Página de gerenciamento de permissões
9. Procedures tRPC com verificação de role

---

## 9. Testes e qualidade

### 9.1 Estratégia
- Unitário: Validação de schemas, lógica de permissões
- Integração: tRPC procedures com mock de session
- E2E: Fluxos de login, cadastro, gerenciamento de roles

### 9.2 Gates de CI
- Lint
- Typecheck
- Build

---

## 10. Riscos e decisões

### 10.1 Riscos
- R01: Better Auth admin plugin pode ter breaking changes (versão < 2.0)

### 10.2 Trade-offs
- T01: Usar React Hook Form ao invés de TanStack Form para simplicidade inicial

### 10.3 Decisões pendentes
- D01: Social login (futuro)
- D02: Verificação de email (futuro)

---

## 11. Rastreabilidade

| Requisito | Implementação | Teste | Status |
|---|---|---|---|
| F01 | `src/app/(auth)/login/page.tsx` | - | Pendente |
| F02 | `src/app/(auth)/register/page.tsx` | - | Pendente |
| F03 | Header user menu + Sidebar footer user button | - | Pendente |
| F04 | `src/app/(dashboard)/permissions/page.tsx` | - | Pendente |
| F05 | `src/components/layout/`, `src/components/theme-*`, `src/components/search.tsx` | - | ✅ Implementado |
| F06 | `src/middleware.ts` | - | Pendente |
| F07 | `src/app/(dashboard)/page.tsx` | - | ✅ Implementado |
| RN01 | `src/shared/schemas/auth.ts` | - | Pendente |
| RN04 | `src/server/lib/permissions.ts` | - | Pendente |
| ADR-006 | `src/components/theme-provider.tsx` + script inline no layout | - | ✅ Implementado |
| ADR-007 | Botões com `variant="outline"` no header/sidebar | - | ✅ Implementado |
