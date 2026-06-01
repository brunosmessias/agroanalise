# SDD Base Template (Replicável) - Pré-preenchido com padrão oficial

Status: Template oficial para novos projetos (com stack e padrões já decididos)
Data: 2026-05-13

> Este documento é a base genérica para Specification-Driven Development (SDD).
> Para novos projetos, ele deve ser copiado e preenchido.
> Ele substitui o uso de documentos ad-hoc como base inicial de especificação.

## 0. Como usar este template
- Copiar este arquivo para `docs/SDD_<nome-do-projeto>.md`
- Preencher todas as seções marcadas como obrigatórias
- Manter os critérios de aceite e DoD por página/feature
- Atualizar links de referência técnica e de produto

### 0.1 Base obrigatória para novos projetos
- Base oficial: `Pessoal/base` (boilerplate do Create T3)
- Regra: todo novo projeto deve começar clonando/copiando esta base, sem iniciar de estrutura vazia.
- Objetivo: reduzir variabilidade técnica, acelerar setup e manter compatibilidade com padrões SDD.

### 0.2 Primeiros passos de adaptação da base T3 para o padrão SDD
1. Renomear projeto e ajustar metadados (`package.json`, `README`, `.env.example`, nome do app).
2. Confirmar stack de runtime: Next.js App Router + TypeScript strict + tRPC + Drizzle + Better Auth.
3. Substituir `src/server/db/schema.ts` placeholder pelo schema inicial do domínio do projeto.
4. Criar migration inicial e validar ciclo local de banco (`db:generate`, `db:migrate`, `db:studio`).
5. Instalar e configurar camada UI padrão (`shadcn/ui` new-york style, componentes de layout, tema, tokens).
6. Instalar componentes shadcn obrigatórios: `sidebar`, `sheet`, `breadcrumb`, `skeleton`, `separator`.
7. Implementar app shell autenticado seguindo o padrão abaixo (seção 5.1) antes de iniciar features.
8. Implementar sistema de tema dark/light/system com script blocking inline (seção 5.2).
9. Adicionar base de autorização (RBAC por rota e ação), mesmo que inicialmente com poucos perfis.
10. Configurar padrão de formulários com React Hook Form ou TanStack Form + Zod compartilhado (client/server).
11. Definir contrato único de erro e contrato mínimo de auditoria para ações sensíveis.
12. Ativar qualidade mínima obrigatória no início: lint, typecheck, testes unitários e E2E smoke.
13. Criar `docs/PROJECT_CONTROL.md` e inicializar `.specs/project/*` para governança TLC desde o dia 1.
14. Registrar no SDD quais itens vieram prontos da base T3 e quais foram customizados no bootstrap.

---

## 1. Contexto e Escopo

### 1.1 Contexto do produto (obrigatório)
- Problema que o projeto resolve:
- Público-alvo:
- Objetivo de negócio:

### 1.2 Escopo in/out (obrigatório)
- In scope (nesta fase):
- Out of scope (fora desta fase):

### 1.3 Stakeholders e papéis (obrigatório)
- Product Owner:
- Tech Lead:
- Design:
- QA:
- Segurança:

---

## 2. Requisitos funcionais

### 2.1 Lista de features (obrigatório)
- F01:
- F02:
- F03:

### 2.2 Fluxos críticos (obrigatório)
- Fluxo 1:
- Fluxo 2:
- Fluxo 3:

### 2.3 Regras de negócio-chave (obrigatório)
- RN01:
- RN02:
- RN03:

---

## 3. Requisitos não funcionais

### 3.1 Segurança
- AuthN/AuthZ: sessão, expiração, refresh
- RBAC por rota/página e por ação
- Validação de entrada no client e server
- Proteção de segredos e dados sensíveis
- Auditoria de ações sensíveis

### 3.2 Performance
- Metas de LCP/INP por rota crítica
- Limite de bundle por rota

### 3.3 Acessibilidade
- Meta WCAG (nível alvo)
- Checklist operacional em PR (teclado, foco, aria, contraste)

### 3.4 Confiabilidade/Operação
- Logs mínimos
- Métricas mínimas
- Alertas críticos

---

## 4. Arquitetura e Stack

### 4.1 Stack obrigatória do projeto
- Framework: Next.js (App Router) + React + TypeScript
- UI: shadcn/ui (new-york style, componentes locais) + Radix primitives
- CSS: Tailwind CSS v4 (`@theme inline` para design tokens)
- API: tRPC + React Query
- Banco: PostgreSQL + Drizzle ORM
- Auth: Better Auth (sessão + OTP; social opcional por projeto)
- Formulários: React Hook Form ou TanStack Form (`@tanstack/react-form`)
- Validação: Zod compartilhado entre front e backend
- Tabelas/Listas: TanStack Table (`@tanstack/react-table`) + TanStack Virtual (`@tanstack/react-virtual`) quando houver alto volume
- Ícones: Lucide React
- Testes: Vitest (unit/integration) + Playwright (E2E)
- Qualidade: ESLint + TypeScript strict
- Dev DX: TanStack Query Devtools em ambiente de desenvolvimento

Observação: o boilerplate T3 entrega uma fundação enxuta; itens adicionais deste padrão (como shadcn/ui completo, formulários e matriz RBAC) devem ser adicionados no bootstrap seguindo a seção 0.2.

### 4.2 Decisões arquiteturais (ADRs resumidos)
- ADR-001: Fluxos de criação/edição devem ocorrer via modal por padrão.
- ADR-002: RBAC obrigatório por rota e por ação, com validação no backend.
- ADR-003: Layout autenticado padronizado com Sidebar inset + Header global (padrão shadcn-admin).
- ADR-004: Estados de tela obrigatórios por feature (`loading`, `vazio`, `erro`, `sem permissão`).
- ADR-005: Contrato único de erro para feedback consistente no frontend.
- ADR-006: ThemeProvider client-side com script blocking inline para evitar FOUC em dark mode.
- ADR-007: Botões de ação no header/sidebar usam `variant="outline"` para garantir contraste em dark mode.

### 4.3 Estrutura de pastas base
```
src/
├── app/
│   ├── (auth)/          # Layout público
│   ├── (dashboard)/     # Layout autenticado
│   ├── api/
│   │   ├── auth/[...all]/route.ts
│   │   └── trpc/[trpc]/route.ts
│   └── layout.tsx       # Root layout (ThemeProvider, TooltipProvider)
├── components/
│   ├── ui/              # shadcn/ui (não editar diretamente)
│   ├── layout/          # AppSidebar, Header
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
- `SidebarFooter`: User button com dropdown (avatar + nome + email + ChevronsUpDown), usar `bg-card text-card-foreground` para contraste no dark mode
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
- Grid de conteúdo adicional (`lg:grid-cols-7`) com áreas de overview e detalhes
- CardHeader com `flex flex-row items-center justify-between` para ícone de métrica

### 5.2 Sistema de tema (dark mode)

Implementação obrigatória para todos os projetos:

**ThemeProvider:**
- Context provider client-side que gerencia estado `light | dark | system`
- Persistência em `localStorage`
- Escuta mudanças de `prefers-color-scheme` para tema system
- Aplica/remover classes `light`/`dark` no `<html>`

**Script blocking inline (anti-FOUC):**
```html
<head>
  <script dangerouslySetInnerHTML={{ __html: `
    (function() {
      try {
        var theme = localStorage.getItem('<STORAGE_KEY>') || 'system';
        var dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.add(dark ? 'dark' : 'light');
      } catch (e) {}
    })();
  `}} />
</head>
```
Este script roda ANTES de qualquer CSS/paint, garantindo que a classe `dark` ou `light` já esteja no `<html>` quando o navegador renderizar. Sem isso, ícones e textos ficam invisíveis no dark mode durante a hidratação.

**CSS obrigatório em `globals.css`:**
```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

/* ... variáveis :root e .dark ... */

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@theme inline {
  /* ... mapeamento de cores ... */
}
```

O `@layer base` com `bg-background text-foreground` no body é **obrigatório** — sem ele, `currentColor` herda a cor preta padrão do navegador em vez de `--foreground` (que é claro no dark mode).

**Root layout obrigatório:**
```tsx
<html suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
  </head>
  <body>
    <ThemeProvider>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </ThemeProvider>
  </body>
</html>
```

### 5.3 Componentes globais obrigatórios

| Componente | Arquivo | Descrição |
|---|---|---|
| `ThemeProvider` | `src/components/theme-provider.tsx` | Context provider de tema (light/dark/system) com localStorage |
| `useTheme()` | hook do theme-provider | Acesso ao tema atual e setter |
| `ThemeSwitch` | `src/components/theme-switch.tsx` | Botão dropdown Sun/Moon, variant="outline", opções Claro/Escuro/Sistema |
| `Search` | `src/components/search.tsx` | Botão de busca com ícone e atalho ⌘K |
| `ProfileDropdown` | `src/components/profile-dropdown.tsx` | Dropdown de perfil com avatar, nome, email e logout, variant="outline" |
| `AppSidebar` | `src/components/layout/app-sidebar.tsx` | Sidebar completa com nav filtrada por role e user button no footer |
| `Header` | `src/components/layout/header.tsx` | Navbar com SidebarTrigger, Search, ThemeSwitch e ProfileDropdown |

### 5.4 Componentes shadcn/ui obrigatórios
- `sidebar` (com `SidebarProvider`, `Sidebar`, `SidebarInset`, `SidebarTrigger`, `SidebarRail`, etc.)
- `sheet` (usado internamente pela sidebar para mobile drawer)
- `separator`
- `breadcrumb`
- `skeleton`
- `button`, `avatar`, `dropdown-menu`, `tooltip`, `input`, `card`

### 5.5 Padrão de página
- Header (título, subtítulo, ação primária)
- Barra de filtros/busca
- Conteúdo em cards (sem conteúdo principal solto)
- Estado loading/vazio/erro/sem permissão
- Grid de conteúdo no estilo bento para dashboards e páginas analíticas

### 5.6 Padrão de listagens
- Toolbar padrão
- Tabela padrão
- Paginação padrão
- Shape de erro padrão no front
- Toolbar com busca, filtros, reset de filtros e controle de colunas

### 5.7 Padrão de formulários
- Validação
- Mensagens de erro
- Submit/loading/disable
- Comportamento de sucesso/falha
- Zod como fonte de verdade do schema (client + server)
- Botão submit desabilitado durante envio

---

## 6. RBAC e autorização

### 6.1 Matriz de permissões (obrigatório)
| Recurso/Página | View | Create | Update | Delete | Ações especiais |
|---|---|---|---|---|---|
| Exemplo: Usuários | Admin, Manager | Admin | Admin, Manager | Admin | Reset senha: Admin |

### 6.2 Regras de front-end
- Sem permissão: não renderiza botão/ação
- Sem permissão de página: não renderiza conteúdo da rota
- Sidebar/menu devem respeitar a mesma matriz RBAC

### 6.3 Regras de back-end
- Toda action crítica valida permissão no servidor
- Procedures por perfil quando aplicável (`adminProcedure`, `managerProcedure`, `memberProcedure`)
- Nunca confiar na ocultação de ação no frontend

---

## 7. Contratos técnicos

### 7.1 Contrato de estados por feature
- Loading
- Vazio
- Erro
- Sem permissão
- Esses 4 estados devem existir antes da feature ser considerada pronta

### 7.2 Contrato de erro de API
- Shape único (exemplo):
```json
{
  "code": "FORBIDDEN",
  "message": "Você não tem permissão para esta ação",
  "details": null,
  "traceId": "..."
}
```

### 7.3 Contrato de auditoria
- Campos mínimos: `userId`, `entity`, `action`, `timestamp`, `result`

### 7.4 Convenção de URL e filtros
- Filtros, ordenação e paginação devem viver na querystring da URL.
- Padrão sugerido:
  - `q` para busca textual
  - `page` e `pageSize` para paginação
  - `sort` para ordenação (ex.: `createdAt.desc`)
  - `filters[...]` para filtros estruturados
- Regras:
  - a tela deve carregar estado inicial a partir da URL
  - alterações de filtro/ordenação/página devem atualizar a URL
  - URLs devem ser compartilháveis e reprodutíveis

### 7.5 Estratégia de cache e invalidação (React Query)
- Definir `query keys` por domínio e recurso, com padrão estável.
- Toda mutation deve declarar estratégia pós-sucesso:
  - invalidar queries afetadas, ou
  - atualizar cache local diretamente quando seguro
- Usar optimistic update apenas quando houver rollback claro.
- Evitar refetch global; preferir invalidação específica por key.

### 7.6 Política de migração de schema (Drizzle)
- Fluxo obrigatório:
  1. gerar migration
  2. revisar SQL gerado
  3. aplicar em ambiente de teste
  4. validar impacto em queries e dados existentes
- Toda mudança de schema deve prever rollback ou estratégia de recuperação.
- Não aplicar alterações destrutivas sem plano explícito de compatibilidade.

---

## 8. Plano de entrega

### 8.1 Roadmap por fase
- Fase 1:
- Fase 2:
- Fase 3:

### 8.2 Sequência sugerida de implementação
1. App shell + autenticação
2. RBAC + guards de rota/ação
3. CRUD principal com padrões de página
4. Observabilidade e hardening
5. Testes de regressão e aceite

---

## 9. Testes e qualidade

### 9.1 Estratégia de teste
- Unitário:
- Integração:
- E2E:

### 9.2 Gates de CI
- Lint
- Typecheck
- Testes
- Scanner de segurança
- Build da aplicação

### 9.3 Definition of Done (DoD) por página/feature
- Layout final aplicado
- Responsividade validada
- Acessibilidade validada
- Estados de tela implementados
- Permissões aplicadas no front e back
- Testes mínimos passando
- Padrão visual consistente com App Shell e padrões de página/listagem/formulário

---

## 10. Riscos, trade-offs e decisões abertas

### 10.1 Riscos
- R01:
- R02:

### 10.2 Trade-offs
- T01:
- T02:

### 10.3 Decisões pendentes
- D01:
- D02:

---

## 11. Rastreabilidade (requisito -> implementação -> teste)

| Requisito  | Implementação (arquivo/módulo) | Teste | Status |
| ---------- | ------------------------------ | ----- | ------ |
| F01        |                                |       |        |
| RN01       |                                |       |        |
| NFR-Seg-01 |                                |       |        |
