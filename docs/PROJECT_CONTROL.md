# AgroAnalise — Project Control

**Última atualização:** 2026-06-02
**Status:** Fase 2 e 3 parciais concluídas — CRUD + página pública + dashboard implementados

---

## Estado atual

### ✅ Concluído
- [x] Clone da base T3
- [x] Renomeação do projeto para AgroAnalise (branding, metadata, logo)
- [x] Landing page
- [x] Schema Drizzle (client, analysis, analysisPhoto + user profile fields)
- [x] Migration inicial
- [x] tRPC routers (client, analysis, photo, dashboard, user)
- [x] Configuração MinIO (storage/minio.ts)
- [x] Storage proxy route (/api/storage/[...path])
- [x] Variáveis de ambiente (.env.example, env.js)
- [x] Página de listagem de clientes (cards + busca)
- [x] Modal de criação de cliente (todos os campos)
- [x] Edição de cliente
- [x] Página de detalhes do cliente (stats + análises)
- [x] Perfil da fazenda do cliente
- [x] CRUD de análises por cliente (step form 3 passos)
- [x] Upload de fotos com MinIO (presigned URLs)
- [x] Página pública da análise (/a/[slug]) com galeria e lightbox
- [x] Dashboard com métricas (clientes, análises, fotos, mês)
- [x] Perfil do agrônomo (foto, telefone, empresa, bio)
- [x] Onboarding wizard (primeiro acesso)
- [x] Dark mode completo
- [x] SDD preenchido
- [x] README.md
- [x] Documentação didática (visão geral + 5 módulos)

### 🔲 Pendente (Fase 3 — Visualização)
- [ ] Geração de PDF da análise

### 🔲 Pendente (Fase 4 — IA e Polish)
- [ ] Integração IA para melhoria de textos
- [ ] Refinamentos visuais
- [ ] Testes E2E

---

## Decisões técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Armazenamento | MinIO (S3-compatible) | Self-hosted, custo controlado |
| Schema | 3 tabelas de domínio | client, analysis, analysisPhoto |
| Auth | Better Auth | Já na base T3, sessão cookie |
| Step form | 3 passos sequenciais | Guiar o fluxo de criação de análise |
| Onboarding | Wizard de perfil | Completar dados no primeiro acesso |
| PDF | A definir | Fase 3 |
| IA | A definir | Fase 4 |

---

## Arquitetura de rotas

| Rota | Tipo | Acesso |
|------|------|--------|
| `/` | Landing page | Público |
| `/login` | Autenticação | Público |
| `/register` | Cadastro | Público |
| `/onboarding` | Wizard de perfil | Autenticado (obrigatório) |
| `/dashboard` | Painel com métricas | Autenticado |
| `/clients` | Listagem de clientes | Autenticado |
| `/clients/[id]` | Detalhes do cliente | Autenticado |
| `/clients/[id]/analyses/[analysisId]` | Edição de análise | Autenticado |
| `/clients/[id]/analyses/new` | Criação de análise | Autenticado |
| `/clients/[id]/profile` | Perfil da fazenda | Autenticado |
| `/profile` | Perfil do agrônomo | Autenticado |
| `/a/[slug]` | Página pública da análise | Público |
| `/api/auth/[...all]` | Better Auth | Público |
| `/api/trpc/[trpc]` | tRPC API | Misto |
| `/api/storage/[...path]` | Proxy MinIO | Autenticado |
