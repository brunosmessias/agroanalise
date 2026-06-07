# AgroAnalise — STATE

**Last Updated:** 2026-06-07
**Current Work:** PWA instalável (manifest + ícones + banner) — concluído

---

## Recent Decisions (Last 60 days)

### AD-001: Stack base T3 (2026-06-01)
**Decision:** Usar Create T3 App como boilerplate base
**Reason:** Padronização do stack e aceleração de setup
**Trade-off:** Configuração extra para adaptar ao padrão SDD
**Impact:** Estrutura de pastas, tRPC, Drizzle e Better Auth já configurados

### AD-002: MinIO para armazenamento de imagens (2026-06-01)
**Decision:** Usar MinIO (S3-compatible) como storage
**Reason:** Self-hosted, custo controlado, API S3 familiar
**Trade-off:** Exige infraestrutura separada
**Impact:** Upload via presigned URLs, imagens não armazenadas no banco

### AD-003: Single-user na v1 (2026-06-01)
**Decision:** Sem RBAC complexo, apenas agrônomo autenticado
**Reason:** MVP rápido, um usuário por instância
**Trade-off:** Não escalável para multi-user sem refatoração
**Impact:** Sem tabelas de role/permission

### AD-004: Schema simplificado com 3 tabelas de domínio (2026-06-01)
**Decision:** client, analysis, analysisPhoto como tabelas principais
**Reason:** Modela o domínio corretamente com mínima complexidade
**Trade-off:** Análise não tem conceito de rascunho na v1
**Impact:** Todas as análises são públicas após salvas

### AD-005: Terminologia unificada — "Análise" (2026-06-01)
**Decision:** Usar "Análise" como termo único no UI (substitui "Visita Técnica")
**Reason:** "Análise" e "Visita Técnica" referem-se ao mesmo conceito na prática; misturar termos confunde o usuário
**Trade-off:** Vocabulário do schema (`analysis`) passa a alinhar 100% com o UI
**Impact:** Páginas, dialogs, toasts e onboarding atualizados

### AD-006: Cadastro de análise com step form (2026-06-01)
**Decision:** Página de edição de análise usa step form de 3 passos (Detalhes → Fotos → Concluído) em vez de Tabs
**Reason:** Step form guia melhor o fluxo sequencial de preenchimento
**Trade-off:** Não é possível pular para uma seção arbitrária sem completar a anterior
**Impact:** Stepper no topo da página, navegação Voltar/Próximo/Salvar, tela de revisão final com link público

### AD-007: OpenRouter + Gemma 3 27B para reescrita de IA (2026-06-02)
**Decision:** Usar OpenRouter com modelo gratuito `google/gemma-3-27b-it:free` para reescrita de textos
**Reason:** Gratuito, boa qualidade para PT-BR, 262K contexto, API compatível com OpenAI SDK
**Trade-off:** Rate limit de 20 req/min, 200 req/dia; dependência de serviço externo
**Impact:** API route `/api/ai/rewrite`, componente `<AiRewriteButton>` reutilizável, env var OPENROUTER_API_KEY

### AD-008: PWA instalável sem Service Worker (2026-06-07)
**Decision:** Implementar PWA instalável (manifest + meta tags + ícones + banner) sem Service Worker no MVP
**Reason:** SW complexifica deploy e debug; offline sync já é coberto pela spec offline-sync via IndexedDB. Browser nativo + prompt `beforeinstallprompt` cobrem 100% do objetivo da spec
**Trade-off:** Sem cache offline de páginas HTML (mas criação offline de dados continua funcionando via offline-sync)
**Impact:** Manifest estático em `public/`, hook `useInstallPrompt`, banner em `(dashboard)/layout.tsx`, ícones 192/512/180 gerados via sharp

---

## Active Blockers

(nenhum)

---

## Lessons Learned

- MinIO já traz tipos próprios — não precisa de @types/minio
- tRPC v11 exige z.object() como input, não funções

---

## Deferred Ideas

- [ ] Login social (Google, GitHub)
- [ ] Recuperação de senha
- [ ] Conceito de rascunho para análises
- [ ] Multi-tenant / múltiplos agrônomos
- [ ] Notificações push
- [ ] App mobile

---

## Todos

- [x] Setup do projeto a partir da base T3
- [x] Schema do banco (client, analysis, analysisPhoto)
- [x] tRPC routers (client, analysis, photo)
- [x] Configuração MinIO
- [x] SDD preenchido
- [x] Página de listagem de clientes
- [x] Modal de criação/edição de cliente
- [x] Página de detalhes do cliente
- [x] CRUD de análises por cliente
- [x] Upload de fotos com MinIO
- [x] Página pública de análise (/a/[slug])
- [x] Step form de análise (Detalhes → Fotos → Concluído)
- [x] Unificação de terminologia (Análise / Visita Técnica)
- [ ] Geração de PDF
- [x] Integração IA para melhoria de textos
- [x] Dashboard com métricas
- [x] PWA instalável (manifest + banner)
