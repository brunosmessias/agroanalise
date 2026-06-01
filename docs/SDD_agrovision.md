# SDD — AgroVision

Status: Documento de especificação oficial
Data: 2026-06-01

---

## 0. Como usar este template
- Documento base para Specification-Driven Development (SDD).
- Todas as seções obrigatórias foram preenchidas.

### 0.1 Base obrigatória para novos projetos
- Base oficial: `Pessoal/projeto-base` (boilerplate T3 com Next.js 16 + tRPC + Drizzle + Better Auth)
- Regra: projeto iniciado clonando a base, sem estrutura vazia.

### 0.2 Primeiros passos de adaptação da base T3 para o padrão SDD
1. ✅ Renomear projeto para `agrovision` e ajustar metadados (`package.json`, `README`, `.env.example`).
2. ✅ Confirmar stack: Next.js App Router + TypeScript strict + tRPC + Drizzle + Better Auth.
3. ✅ Substituir schema placeholder pelo schema do domínio agronômico (client, analysis, analysisPhoto).
4. ✅ Criar migration inicial e validar ciclo local (`db:generate`, `db:migrate`, `db:studio`).
5. ✅ shadcn/ui já presente na base — adicionar componentes necessários.
6. ✅ App Shell autenticado (Sidebar inset + Header global) já existente na base.
7. ✅ RBAC customizado — simplificado para projeto single-user (agrônomo).
8. ✅ TanStack Form + Zod compartilhado.
9. ✅ Contrato de erro já padronizado na base.
10. ✅ Qualidade: lint, typecheck, testes configurados.
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
- Cadastro de clientes (nome apenas)
- Registro de análises de visita (fotos + texto)
- Upload e armazenamento de imagens no MinIO
- Geração de URL única pública para visualização da análise
- Geração de PDF da análise
- Interface de visualização pública bonita e responsiva para o cliente
- IA para melhorar textos das descrições
- Dashboard com visão geral

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
- **F01:** Autenticação do agrônomo (login/register/logout) — *já existe na base*
- **F02:** App shell com sidebar e header — *já existe na base*
- **F03:** CRUD de clientes (nome apenas) com listagem, busca e criação via modal
- **F04:** CRUD de análises por cliente — criar análise com título, data da visita, e conjunto de fotos + texto
- **F05:** Upload de fotos para MinIO — múltiplas fotos por análise, com preview e remoção
- **F06:** IA para melhoria de texto — campo "melhorar com IA" em cada descrição de foto e na descrição geral da análise
- **F07:** Visualização pública da análise — URL única (`/a/{slug}`) com design bonito, responsivo e profissional
- **F08:** Geração de PDF da análise — botão para exportar análise em PDF com layout profissional
- **F09:** Dashboard — visão geral com total de clientes, análises recentes, análises do mês

### 2.2 Fluxos críticos
- **Fluxo 1 — Cadastro de cliente e primeira análise:**
  Agrônomo acessa dashboard → clica em "Novo Cliente" → preenche nome → salva → é redirecionado para página do cliente → clica em "Nova Análise" → preenche título, data, adiciona fotos com descrições → usa IA para melhorar textos → salva → visualiza preview da análise pública.

- **Fluxo 2 — Compartilhamento com cliente:**
  Agrônomo abre análise → clica em "Compartilhar" → copia link único → envia ao cliente via WhatsApp/email → cliente acessa link → vê apresentação visual profissional com fotos e descrições → pode baixar PDF.

- **Fluxo 3 — Upload de fotos:**
  Agrônomo cria/edita análise → clica em adicionar foto → seleciona arquivo(s) do dispositivo → imagem é enviada ao MinIO → preview aparece na tela → agrônomo adiciona descrição texttual → pode usar IA para melhorar → salva.

### 2.3 Regras de negócio-chave
- **RN01:** Cada análise possui um slug único gerado automaticamente (UUID ou hash) para URL pública.
- **RN02:** A URL pública da análise é acessível sem autenticação (qualquer pessoa com o link).
- **RN03:** Cada foto de uma análise deve ter um texto descritivo associado.
- **RN04:** O limite máximo de fotos por análise é de 20 imagens.
- **RN05:** O tamanho máximo por imagem é de 10MB, formatos aceitos: JPG, PNG, WebP.
- **RN06:** A funcionalidade de IA pode ser usada opcionalmente em cada campo de texto (descrição geral da análise e descrição de cada foto).
- **RN07:** O PDF gerado deve seguir o mesmo layout da visualização pública.
- **RN08:** Um cliente pode ter múltiplas análises associadas.
- **RN09:** A análise só fica disponível publicamente após ser salva (não em rascunho — MVP sem conceito de rascunho).
- **RN10:** O agrônomo pode copiar o link de compartilhamento a qualquer momento após salvar.

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
- **Geração PDF:** Puppeteer ou @react-pdf/renderer (a definir)
- **IA:** API externa (OpenAI ou similar) para melhoria de textos
- **Testes:** Vitest (unit/integration) + Playwright (E2E)
- **Qualidade:** ESLint + TypeScript strict
- **Package manager:** pnpm

### 4.2 Decisões arquiteturais (ADRs)
- **ADR-001:** Fluxos de criação/edição via modal por padrão (herdado da base).
- **ADR-002:** RBAC simplificado — projeto single-user (agrônomo), sem necessidade de sistema complexo de roles. Apenas autenticação do agrônomo e rotas públicas para análises.
- **ADR-003:** Layout autenticado com Sidebar inset + Header global (herdado da base).
- **ADR-004:** Estados obrigatórios por feature: loading, vazio, erro (herdado).
- **ADR-005:** Contrato único de erro (herdado).
- **ADR-006:** Imagens armazenadas no MinIO com upload direto via presigned URLs. Não armazenar imagens no banco.
- **ADR-007:** Página pública de análise é uma rota separada sem autenticação, com slug UUID na URL (`/a/{slug}`).
- **ADR-008:** IA de melhoria de texto é uma chamada tRPC que consome API externa. O campo de texto original é preservado; o texto melhorado substitui apenas se o usuário confirmar.
- **ADR-009:** PDF gerado server-side, com layout consistente com a visualização pública. Estratégia: renderizar HTML + converter para PDF.

### 4.3 Estrutura de pastas base
```
src/
├── app/
│   ├── (auth)/          # Login, register
│   ├── (dashboard)/     # Painel do agrônomo (protegido)
│   │   ├── clients/     # CRUD de clientes
│   │   ├── analyses/    # CRUD de análises
│   │   └── page.tsx     # Dashboard
│   ├── a/[slug]/        # Visualização pública da análise
│   └── api/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # AppSidebar, Header
│   └── shared/          # Componentes reutilizáveis
├── features/
│   ├── clients/         # Lógica de clientes
│   ├── analyses/        # Lógica de análises
│   ├── photos/          # Lógica de upload/fotos
│   └── ai/              # Integração com IA
├── server/
│   ├── api/routers/     # tRPC routers
│   ├── better-auth/     # Configuração do auth
│   ├── db/              # Schema + conexão
│   └── storage/         # Configuração MinIO
├── shared/schemas/      # Zod schemas compartilhados
├── lib/
├── hooks/
├── styles/
└── trpc/
```

---

## 5. Sistema de design e layout

### 5.1 App shell padrão (painel do agrônomo)
- Sidebar com navegação: Dashboard, Clientes
- Header com toggle sidebar, busca global e ações do usuário
- Sidebar com `variant="inset"`, colapso por ícone em desktop, drawer em mobile
- Layout herdado da base T3

### 5.2 Padrão de página — Painel do agrônomo
- **Dashboard:** Cards com métricas (total clientes, análises do mês, análises recentes) em grid bento
- **Clientes:** Header com título + botão "Novo Cliente", barra de busca, lista em cards ou tabela
- **Análises por cliente:** Header com nome do cliente + botão "Nova Análise", grid de cards de análise com thumbnail da primeira foto
- **Formulário de análise:** Modal ou página dedicada com campos de título, data, fotos com upload e descrições

### 5.3 Padrão de listagens
- Toolbar com busca e filtros
- Cards ou tabela com TanStack Table
- Paginação quando necessário
- Estados: loading (skeleton), vazio (ilustração + texto), erro

### 5.4 Padrão de formulários
- React Hook Form + Zod
- Validação client + server
- Mensagens de erro inline
- Submit com loading state
- Upload de fotos com drag-and-drop + preview

### 5.5 Página pública de análise (FOCO ESPECIAL)
- **Objetivo:** Apresentação visual premium da análise para o cliente do agricultor
- **Layout:**
  - Hero com imagem de destaque (primeira foto ou background)
  - Título da análise + nome do cliente + data da visita
  - Nome do agrônomo e contato
  - Grid de fotos com descrições em layout masonry ou alternado (foto à esquerda, texto à direita; depois inverte)
  - Cada foto com animação suave de entrada (fade-in ao scroll)
  - Rodapé com branding do agrônomo e link para contato
- **Responsivo:** Mobile-first, fotos empilhadas verticalmente em mobile
- **Tipografia:** Fonte elegante e legível, hierarquia clara
- **Cores:** Paleta natural/verde associada ao agronegócio, com toques de destaque
- **Interatividade:** Lightbox para ampliar fotos, botão de download PDF
- **Performance:** Imagens otimizadas com Next.js Image, lazy loading

---

## 6. RBAC e autorização

### 6.1 Decisão simplificada
- **RBAC não é necessário na v1** — projeto é single-user (um agrônomo).
- Apenas 2 níveis de acesso:
  1. **Agrônomo autenticado** — acesso total ao painel (CRUD de clientes, análises, fotos)
  2. **Visitante anônimo** — acesso apenas à visualização pública de análises (`/a/[slug]`)

### 6.2 Implementação
- Rotas `(dashboard)` protegidas por sessão Better Auth (já implementado na base)
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
- `/a/{slug}` — URL pública de análise

### 7.5 Estratégia de cache e invalidação
- Query keys por domínio: `["clients"]`, `["clients", id]`, `["analyses", clientId]`, `["analysis", slug]`
- Mutations invalidam queries relacionadas
- Query de análise pública com `staleTime` elevado (dados raramente mudam)

### 7.6 Política de migração de schema
- Fluxo padrão: gerar → revisar SQL → aplicar localmente → validar

---

## 8. Plano de entrega

### 8.1 Roadmap por fase
- **Fase 1 — Fundação:** Clone da base, configuração MinIO, schema do banco, migrations
- **Fase 2 — CRUD Core:** Clientes (CRUD) + Análises (CRUD) + Upload de fotos
- **Fase 3 — Visualização:** Página pública da análise (design premium) + Geração de PDF
- **Fase 4 — IA e Polish:** Integração IA para melhoria de textos + refinamentos visuais + testes

### 8.2 Sequência sugerida de implementação
1. ✅ Clone da base + renomear projeto
2. ✅ Configuração do schema Drizzle (client, analysis, analysisPhoto)
3. ✅ Configuração MinIO (variáveis de ambiente, cliente S3)
4. CRUD de clientes (listagem, criação via modal, edição, exclusão)
5. CRUD de análises (listagem por cliente, criação, edição)
6. Upload de fotos com MinIO (presigned URLs, preview, remoção)
7. Página pública de análise (`/a/[slug]`) com design premium
8. Geração de PDF
9. Integração com IA para melhoria de textos
10. Dashboard com métricas
11. Testes E2E e refinamentos

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
| F01 Auth  | `src/server/better-auth/`, `src/app/(auth)/` | E2E login/register | ✅ Base |
| F02 Shell | `src/components/layout/`, `src/app/(dashboard)/layout.tsx` | Visual | ✅ Base |
| F03 Clientes | `src/features/clients/`, `src/server/api/routers/clients.ts` | Integration + E2E | 🔲 Pendente |
| F04 Análises | `src/features/analyses/`, `src/server/api/routers/analyses.ts` | Integration + E2E | 🔲 Pendente |
| F05 Upload fotos | `src/features/photos/`, `src/server/storage/` | Integration | 🔲 Pendente |
| F06 IA textos | `src/features/ai/`, `src/server/api/routers/ai.ts` | Unit | 🔲 Pendente |
| F07 Página pública | `src/app/a/[slug]/page.tsx` | E2E | 🔲 Pendente |
| F08 PDF | `src/server/pdf/` | Integration | 🔲 Pendente |
| F09 Dashboard | `src/app/(dashboard)/page.tsx` | Visual | 🔲 Pendente |
