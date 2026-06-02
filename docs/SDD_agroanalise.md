# SDD — AgroAnalise

Status: Documento de especificação oficial
Data: 2026-06-02

---

## 0. Como usar este template
- Documento base para Specification-Driven Development (SDD).
- Todas as seções obrigatórias foram preenchidas.

### 0.1 Base obrigatória para novos projetos
- Base oficial: Create T3 App (boilerplate T3 com Next.js 16 + tRPC + Drizzle + Better Auth)
- Regra: projeto iniciado clonando a base, sem estrutura vazia.

### 0.2 Primeiros passos de adaptação da base T3 para o padrão SDD
1. ✅ Renomear projeto para `agroanalise` e ajustar metadados (`package.json`, `README`, `.env.example`).
2. ✅ Confirmar stack: Next.js App Router + TypeScript strict + tRPC + Drizzle + Better Auth.
3. ✅ Substituir schema placeholder pelo schema do domínio agronômico (client, analysis, analysisPhoto).
4. ✅ Criar migration inicial e validar ciclo local (`db:generate`, `db:migrate`, `db:studio`).
5. ✅ shadcn/ui já presente na base — adicionar componentes necessários.
6. ✅ App Shell autenticado (Sidebar inset + Header global) já existente na base.
7. ✅ RBAC simplificado para projeto single-user (agrônomo).
8. ✅ React Hook Form + Zod compartilhado entre client e server.
9. ✅ Contrato de erro já padronizado na base.
10. ✅ Qualidade: lint, typecheck, format configurados.
11. ✅ `docs/PROJECT_CONTROL.md` e `.specs/project/*`.
12. ✅ Itens que vieram da base: auth, app shell, tRPC setup, UI components, theme system.

---

## 1. Contexto e Escopo

### 1.1 Contexto do produto
- **Problema que o projeto resolve:** Agrônomos realizam visitas técnicas a propriedades rurais e precisam registrar análises visuais (fotos + texto descritivo). Atualmente esse processo é feito de forma desorganizada (WhatsApp, papel, fotos soltas), sem padronização e sem uma apresentação profissional ao cliente.
- **Público-alvo:** Agrônomos autônomos e consultores agrícolas que prestam serviço a produtores rurais.
- **Objetivo de negócio:** Oferecer ao agrônomo uma ferramenta simples para cadastrar clientes, registrar análises de visitas com fotos e descrições, e gerar links únicos ou PDFs com apresentação visual profissional para enviar ao cliente.

### 1.2 Escopo in/out
**In scope (nesta fase):**
- Cadastro de clientes (nome, documento, contato, endereço, observações, foto)
- Registro de análises de visita com step form (título, data, fotos + texto)
- Upload e armazenamento de imagens no MinIO
- Geração de URL única pública para visualização da análise
- Geração de PDF da análise
- Interface de visualização pública bonita e responsiva para o cliente
- IA para melhorar textos das descrições
- Dashboard com visão geral
- Perfil do agrônomo (dados de contato, empresa, bio, foto)
- Onboarding wizard para primeiro acesso
- Landing page pública
- Perfil da fazenda do cliente

**Out of scope (fora desta fase):**
- App mobile nativo
- Agendamento de visitas
- Notificações push
- Integração com sistemas de gestão agrícola
- Multi-tenant / múltiplos agrônomos (v1 é single-user)
- Pagamento / assinatura
- Histórico de versões de análises

### 1.3 Stakeholders e papéis
- **Product Owner:** Bruno (dono do produto)
- **Tech Lead:** Bruno
- **Design:** Bruno (com referências visuais)
- **QA:** Bruno
- **Segurança:** Bruno

---

## 2. Requisitos funcionais

### 2.1 Lista de features
- **F01:** Autenticação do agrônomo (login/register/logout) — ✅ *implementado*
- **F02:** App shell com sidebar e header — ✅ *implementado*
- **F03:** CRUD de clientes (nome, documento, email, telefone, endereço, cidade, estado, observações, foto) com listagem, busca e criação via modal — ✅ *implementado*
- **F04:** CRUD de análises por cliente — criar análise com step form de 3 passos (Detalhes → Fotos → Revisão) — ✅ *implementado*
- **F05:** Upload de fotos para MinIO — múltiplas fotos por análise, com preview, descrição e remoção — ✅ *implementado*
- **F06:** IA para melhoria de texto — campo "melhorar com IA" em cada descrição de foto e na descrição geral da análise — 🔲 *pendente*
- **F07:** Visualização pública da análise — URL única (`/a/{slug}`) com galeria, lightbox, design responsivo — ✅ *implementado*
- **F08:** Geração de PDF da análise — botão para exportar análise em PDF com layout profissional — 🔲 *pendente*
- **F09:** Dashboard — visão geral com total de clientes, análises, fotos, análises do mês, análises recentes — ✅ *implementado*
- **F10:** Perfil do agrônomo — editar nome, telefone, empresa, bio, foto de avatar — ✅ *implementado*
- **F11:** Onboarding wizard — formulário de primeiro acesso para completar o perfil — ✅ *implementado*
- **F12:** Landing page — página pública de apresentação do produto — ✅ *implementado*
- **F13:** Perfil da fazenda — dados da propriedade rural vinculados ao cliente — ✅ *implementado*

### 2.2 Fluxos críticos
- **Fluxo 1 — Primeiro acesso:**
  Agrônomo se cadastra → é redirecionado para onboarding wizard → preenche nome, telefone, empresa, bio, foto → salva → é redirecionado ao dashboard.

- **Fluxo 2 — Cadastro de cliente e primeira análise:**
  Agrônomo acessa dashboard → clica em "Novo Cliente" → preenche dados → salva → é redirecionado para página do cliente → clica em "Nova Análise" → passo 1: preenche título e data → passo 2: adiciona fotos com descrições → passo 3: revisa e copia link público → salva.

- **Fluxo 3 — Compartilhamento com cliente:**
  Agrônomo abre análise → clica em "Compartilhar" → copia link único → envia ao cliente via WhatsApp/email → cliente acessa link → vê apresentação visual profissional com fotos e descrições → pode ampliar fotos no lightbox → pode baixar PDF (futuro).

- **Fluxo 4 — Upload de fotos:**
  Agrônomo cria/edita análise (passo 2) → clica em adicionar foto → seleciona arquivo(s) do dispositivo → imagem é enviada direto ao MinIO via presigned URL → preview aparece na tela → agrônomo adiciona descrição textual → pode usar IA para melhorar (futuro) → reordena ou remove fotos → avança para revisão.

### 2.3 Regras de negócio-chave
- **RN01:** Cada análise possui um slug único gerado automaticamente (UUID) para URL pública.
- **RN02:** A URL pública da análise é acessível sem autenticação (qualquer pessoa com o link).
- **RN03:** Cada foto de uma análise deve ter um texto descritivo associado.
- **RN04:** O limite máximo de fotos por análise é de 20 imagens.
- **RN05:** O tamanho máximo por imagem é de 10MB, formatos aceitos: JPG, PNG, WebP.
- **RN06:** A funcionalidade de IA pode ser usada opcionalmente em cada campo de texto (descrição geral da análise e descrição de cada foto).
- **RN07:** O PDF gerado deve seguir o mesmo layout da visualização pública.
- **RN08:** Um cliente pode ter múltiplas análises associadas.
- **RN09:** A análise só fica disponível publicamente após ser salva (não em rascunho — MVP sem conceito de rascunho).
- **RN10:** O agrônomo pode copiar o link de compartilhamento a qualquer momento após salvar.
- **RN11:** O onboarding é obrigatório no primeiro acesso — o dashboard redireciona para `/onboarding` até o perfil ser completado.
- **RN12:** Upload de fotos é feito diretamente do navegador para o MinIO via presigned URLs — não passa pelo servidor da aplicação.

---

## 3. Requisitos não funcionais

### 3.1 Segurança
- AuthN/AuthZ: sessão via Better Auth com expiração de 7 dias
- RBAC simplificado: apenas o agrônomo autenticado acessa o painel admin; rotas públicas apenas para visualização de análises
- Validação de entrada com Zod no client e server
- Imagens servidas via MinIO com URLs assinadas para upload e acesso privado no painel
- URLs públicas de análise usam slug não-sequencial (UUID) para dificultar enumeração
- MinIO configurado com bucket privado; acesso público apenas via presigned URLs ou proxy

### 3.2 Performance
- LCP < 2.5s na página pública de análise
- LCP < 2.0s no dashboard
- Upload de imagens com feedback visual de progresso
- Imagens otimizadas via Next.js Image (resize automático)

### 3.3 Acessibilidade
- Meta WCAG 2.1 AA
- Navegação por teclado em todos os formulários
- Contraste adequado em toda a interface
- Imagens com alt text preenchido a partir das descrições

### 3.4 Confiabilidade/Operação
- Logs mínimos de erros de upload e geração de PDF
- Tratamento de erro em upload com retry manual
- Backup do banco PostgreSQL (responsabilidade do ambiente de deploy)

---

## 4. Arquitetura e Stack

### 4.1 Stack obrigatória do projeto
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 6
- **UI:** shadcn/ui (new-york) + Radix primitives + Lucide icons
- **CSS:** Tailwind CSS v4 (`@theme` para design tokens)
- **API:** tRPC v11 + React Query v5
- **Banco:** PostgreSQL + Drizzle ORM v0.45
- **Auth:** Better Auth v1.6 (sessão cookie)
- **Armazenamento:** MinIO (S3-compatible) para imagens
- **Formulários:** React Hook Form v7 + Zod v4
- **Geração PDF:** A definir (Fase 3)
- **IA:** API externa (OpenAI ou similar) para melhoria de textos
- **Testes:** Vitest (unit/integration) + Playwright (E2E)
- **Qualidade:** ESLint + TypeScript strict
- **Package manager:** pnpm

### 4.2 Decisões arquiteturais (ADRs)
- **ADR-001:** Criação/edição de clientes via modal (Dialog). Criação/edição de análises via página dedicada com step form.
- **ADR-002:** RBAC simplificado — projeto single-user (agrônomo), sem necessidade de sistema complexo de roles. Apenas autenticação do agrônomo e rotas públicas para análises.
- **ADR-003:** Layout autenticado com Sidebar inset + Header global (herdado da base).
- **ADR-004:** Estados obrigatórios por feature: loading, vazio, erro (herdado).
- **ADR-005:** Contrato único de erro (herdado).
- **ADR-006:** Imagens armazenadas no MinIO com upload direto via presigned URLs. Não armazenar imagens no banco.
- **ADR-007:** Página pública de análise é uma rota separada sem autenticação, com slug UUID na URL (`/a/{slug}`).
- **ADR-008:** IA de melhoria de texto é uma chamada tRPC que consome API externa. O campo de texto original é preservado; o texto melhorado substitui apenas se o usuário confirmar.
- **ADR-009:** PDF gerado server-side, com layout consistente com a visualização pública. Estratégia: renderizar HTML + converter para PDF.
- **ADR-010:** Step form de 3 passos para criação de análise (Detalhes → Fotos → Revisão). Guia o fluxo sequencial e impede pulos.
- **ADR-011:** Onboarding obrigatório no primeiro acesso. O dashboard layout verifica `onboardingCompleted` e redireciona para `/onboarding` se falso.

### 4.3 Estrutura de pastas (implementada)
```
src/
├── app/
│   ├── (auth)/              # Login, register
│   ├── (dashboard)/         # Painel do agrônomo (protegido)
│   │   ├── clients/         # CRUD de clientes + análises
│   │   │   └── [id]/
│   │   │       ├── analyses/
│   │   │       │   ├── new/           # Criar análise (step form)
│   │   │       │   └── [analysisId]/  # Editar análise
│   │   │       └── profile/           # Perfil da fazenda
│   │   ├── dashboard/       # Dashboard com métricas
│   │   └── profile/         # Perfil do agrônomo
│   ├── (onboarding)/        # Wizard de primeiro acesso
│   ├── a/[slug]/            # Visualização pública da análise
│   ├── api/
│   │   ├── auth/[...all]/   # Better Auth
│   │   ├── trpc/[trpc]/     # tRPC API
│   │   └── storage/[...path] # Proxy MinIO
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components (não editar)
│   ├── layout/              # AppSidebar, Header
│   ├── auth/                # LoginForm, RegisterForm
│   ├── clients/             # Componentes de clientes
│   └── landing/             # Componentes da landing page
├── server/
│   ├── api/routers/         # tRPC routers (client, analysis, photo, dashboard, user)
│   ├── better-auth/         # Configuração do auth
│   ├── db/                  # Schema + conexão
│   └── storage/             # Cliente MinIO
├── shared/schemas/          # Zod schemas compartilhados (client/server)
├── trpc/                    # tRPC setup (React provider + server caller)
├── hooks/                   # Custom hooks
├── lib/                     # Utils (cn, auth-client)
└── styles/                  # Tailwind globals
```

---

## 5. Sistema de design e layout

### 5.1 App shell padrão (painel do agrônomo)
- Sidebar com navegação: Dashboard, Clientes, Perfil
- Header com toggle sidebar, busca global e ações do usuário
- Sidebar com `variant="inset"`, colapso por ícone em desktop, drawer em mobile
- Logo AgroAnalise no header da sidebar

### 5.2 Padrão de página — Painel do agrônomo
- **Dashboard:** Cards com métricas (total clientes, análises, fotos, análises do mês) + seção de análises recentes
- **Clientes:** Header com título + botão "Novo Cliente", barra de busca, lista em cards com total de análises e última visita
- **Detalhes do cliente:** Informações completas + estatísticas + lista de análises + ações (editar, nova análise, ver perfil da fazenda)
- **Criação de análise:** Página dedicada com step form de 3 passos (Detalhes → Fotos → Revisão)
- **Edição de análise:** Mesma página de step form, preenchida com dados existentes
- **Perfil do agrônomo:** Página dedicada com formulário de edição (nome, telefone, empresa, bio, avatar)

### 5.3 Padrão de listagens
- Toolbar com busca e filtros
- Cards com informações resumidas e thumbnails
- Paginação quando necessário
- Estados: loading (skeleton), vazio (ilustração + texto), erro

### 5.4 Padrão de formulários
- React Hook Form + Zod
- Validação client + server
- Mensagens de erro inline
- Submit com loading state
- Upload de fotos com drag-and-drop + preview

### 5.5 Página pública de análise
- **Objetivo:** Apresentação visual premium da análise para o cliente do agricultor
- **Layout:**
  - Hero com imagem de destaque (primeira foto)
  - Título da análise + nome do cliente + data da visita
  - Nome do agrônomo e contato
  - Galeria de fotos com descrições e lightbox para ampliar
  - Rodapé com branding do agrônomo e link para contato
- **Responsivo:** Mobile-first, fotos empilhadas verticalmente em mobile
- **Metadados OG:** Preview automático ao compartilhar no WhatsApp/redes sociais
- **Performance:** Imagens otimizadas com Next.js Image, lazy loading

### 5.6 Landing page
- Página pública de apresentação do produto (`/`)
- Logotipo, descrição do produto, call-to-action para cadastro
- Navegação com login/register

### 5.7 Onboarding
- Wizard de 3 etapas no primeiro acesso
- Coleta: nome completo, telefone, empresa, bio, foto de avatar
- Obrigatório — dashboard redireciona até ser completado

---

## 6. RBAC e autorização

### 6.1 Decisão simplificada
- **RBAC não é necessário na v1** — projeto é single-user (um agrônomo).
- Apenas 2 níveis de acesso:
  1. **Agrônomo autenticado** — acesso total ao painel (CRUD de clientes, análises, fotos, perfil, dashboard)
  2. **Visitante anônimo** — acesso apenas à visualização pública de análises (`/a/[slug]`) e landing page

### 6.2 Implementação
- Rotas `(dashboard)` protegidas por sessão Better Auth
- Rota `(dashboard)` verifica `onboardingCompleted` — redireciona para `/onboarding` se não completado
- Rota `a/[slug]` pública, sem autenticação
- Middleware tRPC: `protectedProcedure` para todas as mutations e queries do painel; `publicProcedure` para consulta de análise por slug

---

## 7. Contratos técnicos

### 7.1 Contrato de estados por feature
- Loading (skeleton)
- Vazio (ilustração + mensagem)
- Erro (mensagem + ação de retry)
- Esses 3 estados devem existir antes da feature ser considerada pronta

### 7.2 Contrato de erro de API
```json
{
  "code": "FORBIDDEN",
  "message": "Você não tem permissão para esta ação",
  "details": null,
  "traceId": "..."
}
```

### 7.3 Contrato de auditoria
- Não aplicável na v1 (single-user). Registrar `createdAt` e `updatedAt` em todas as entidades.

### 7.4 Convenção de URL e filtros
- `/clients?q=&page=1&sort=createdAt.desc`
- `/clients/[id]/analyses?q=&page=1&sort=visitDate.desc`
- `/clients/[id]/analyses/new` — criar análise
- `/clients/[id]/analyses/[analysisId]` — editar análise
- `/clients/[id]/profile` — perfil da fazenda
- `/profile` — perfil do agrônomo
- `/dashboard` — dashboard
- `/onboarding` — wizard de primeiro acesso
- `/a/{slug}` — URL pública de análise

### 7.5 Estratégia de cache e invalidação
- Query keys por domínio: `["clients"]`, `["clients", id]`, `["analyses", clientId]`, `["analysis", slug]`
- Mutations invalidam queries relacionadas
- Query de análise pública com `staleTime` elevado (dados raramente mudam)

### 7.6 Política de migração de schema
- Fluxo padrão: gerar → revisar SQL → aplicar localmente → validar

### 7.7 Upload de imagens
- Solicitação de presigned URL via tRPC mutation (`photo.getUploadUrl`)
- Upload direto browser → MinIO (PUT request)
- Referência salva no banco (imageUrl, descrição, ordem)
- Suporte a avatares (`purpose: "avatar"`) e fotos de análise (`purpose: "analysis"`)

---

## 8. Plano de entrega

### 8.1 Roadmap por fase
- **Fase 1 — Fundação:** ✅ Clone da base, configuração MinIO, schema do banco, migrations
- **Fase 2 — CRUD Core:** ✅ Clientes (CRUD completo) + Análises (CRUD + step form) + Upload de fotos + Perfil da fazenda
- **Fase 3 — Visualização:** 🔲 Geração de PDF (página pública já implementada)
- **Fase 4 — IA e Polish:** 🔲 Integração IA para melhoria de textos + refinamentos visuais + testes

### 8.2 Sequência de implementação
1. ✅ Clone da base + renomear projeto
2. ✅ Configuração do schema Drizzle (client, analysis, analysisPhoto)
3. ✅ Configuração MinIO (variáveis de ambiente, cliente S3)
4. ✅ CRUD de clientes (listagem, criação via modal, edição, exclusão)
5. ✅ CRUD de análises (listagem por cliente, step form de 3 passos, edição)
6. ✅ Upload de fotos com MinIO (presigned URLs, preview, remoção)
7. ✅ Página pública de análise (`/a/[slug]`) com galeria e lightbox
8. ✅ Dashboard com métricas (clientes, análises, fotos, mês)
9. ✅ Perfil do agrônomo (editar dados + avatar)
10. ✅ Onboarding wizard (primeiro acesso)
11. ✅ Landing page
12. ✅ Perfil da fazenda do cliente
13. 🔲 Geração de PDF
14. 🔲 Integração com IA para melhoria de textos
15. 🔲 Testes E2E e refinamentos

---

## 9. Testes e qualidade

### 9.1 Estratégia de teste
- **Unitário:** Schemas Zod, funções de utilidade, formatação
- **Integração:** tRPC routers (clientes, análises) com banco de teste
- **E2E:** Fluxo completo de cadastro de cliente → análise → visualização pública

### 9.2 Gates de CI
- Lint
- Typecheck
- Testes unitários
- Build da aplicação

### 9.3 Definition of Done (DoD) por feature
- Layout final aplicado e responsivo
- Estados de tela (loading, vazio, erro)
- Validação de formulários funcional
- Permissões aplicadas (autenticado vs público)
- Padrão visual consistente

---

## 10. Política de atualização contínua

### 10.1 Atualização por entrega
- Atualizar `docs/PROJECT_CONTROL.md` e `.specs/project/STATE.md`
- Atualizar SDD quando houver mudança de escopo ou arquitetura

### 10.2 Atualização técnica
- Revisão de dependências conforme necessário
- Atualizações incrementais com validação (lint + typecheck + testes + build)

### 10.3 Atualização de banco
- Toda mudança de schema: gerar migration → revisar SQL → validar

### 10.4 Atualização de contratos
- Mudanças em contratos de API ou URLs: atualizar SDD + testes

---

## 11. Riscos, trade-offs e decisões abertas

### 11.1 Riscos
- **R01:** MinIO requer infraestrutura separada — pode complicar deploy inicial. *Mitigação:* usar serviço S3-compatible gerenciado (Cloudflare R2 ou similar) como alternativa.
- **R02:** Geração de PDF server-side pode ser lenta para análises com muitas fotos. *Mitigação:* gerar PDF de forma assíncrona e cache do resultado.
- **R03:** Custos de API de IA podem crescer com uso frequente. *Mitigação:* limitar uso e monitorar consumo.

### 11.2 Trade-offs
- **T01:** Single-user na v1 simplifica implementação mas limita escalabilidade. Trade-off aceito para MVP rápido.
- **T02:** MinIO vs S3 gerenciado — MinIO oferece controle total mas exige manutenção. Trade-off aceito por flexibilidade e custo em self-hosting.

### 11.3 Decisões pendentes
- **D01:** Biblioteca de geração de PDF: Puppeteer (headless browser) vs @react-pdf/renderer (declarativo) — decidir na Fase 3.
- **D02:** Provedor de IA: OpenAI GPT-4o-mini vs modelo local (Ollama) vs outro — decidir na Fase 4.
- **D03:** Deploy target: VPS, Vercel + R2, ou outro — decidir antes do deploy.

---

## 12. Rastreabilidade

| Requisito | Implementação (arquivo/módulo) | Teste | Status |
| --------- | ------------------------------ | ----- | ------ |
| F01 Auth | `src/server/better-auth/`, `src/app/(auth)/` | E2E login/register | ✅ Implementado |
| F02 Shell | `src/components/layout/`, `src/app/(dashboard)/layout.tsx` | Visual | ✅ Implementado |
| F03 Clientes | `src/app/(dashboard)/clients/`, `src/server/api/routers/client.ts` | Integration + E2E | ✅ Implementado |
| F04 Análises | `src/app/(dashboard)/clients/[id]/analyses/`, `src/server/api/routers/analysis.ts` | Integration + E2E | ✅ Implementado |
| F05 Upload fotos | `src/server/storage/minio.ts`, `src/server/api/routers/photo.ts` | Integration | ✅ Implementado |
| F06 IA textos | `src/server/api/routers/` (a criar) | Unit | 🔲 Pendente |
| F07 Página pública | `src/app/a/[slug]/page.tsx` | E2E | ✅ Implementado |
| F08 PDF | `src/server/` (a criar) | Integration | 🔲 Pendente |
| F09 Dashboard | `src/app/(dashboard)/dashboard/`, `src/server/api/routers/dashboard.ts` | Visual | ✅ Implementado |
| F10 Perfil agrônomo | `src/app/(dashboard)/profile/`, `src/server/api/routers/user.ts` | E2E | ✅ Implementado |
| F11 Onboarding | `src/app/(onboarding)/` | E2E | ✅ Implementado |
| F12 Landing page | `src/app/page.tsx`, `src/components/landing/` | Visual | ✅ Implementado |
| F13 Perfil fazenda | `src/app/(dashboard)/clients/[id]/profile/` | Visual | ✅ Implementado |
