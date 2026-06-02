# AgroAnalise — Project Control

**Última atualização:** 2026-06-01
**Status:** Bootstrap concluído, pronto para implementação de features

---

## Estado atual

### ✅ Concluído
- [x] Clone da base T3
- [x] Renomeação do projeto (package.json, layout, theme, sidebar)
- [x] Schema Drizzle (client, analysis, analysisPhoto)
- [x] tRPC routers (client, analysis, photo)
- [x] Configuração MinIO (storage/minio.ts)
- [x] Variáveis de ambiente (.env.example, env.js)
- [x] Typecheck passando
- [x] SDD preenchido

### 🔲 Pendente (Fase 2 — CRUD Core)
- [ ] Página de listagem de clientes
- [ ] Modal de criação de cliente
- [ ] Página de detalhes do cliente
- [ ] Listagem de análises por cliente
- [ ] Formulário de criação de análise
- [ ] Upload de fotos com MinIO
- [ ] Remoção de cliente e análise

### 🔲 Pendente (Fase 3 — Visualização)
- [ ] Página pública de análise (/a/[slug])
- [ ] Design premium da página pública
- [ ] Geração de PDF
- [ ] Botão de compartilhar link

### 🔲 Pendente (Fase 4 — IA e Polish)
- [ ] Integração IA para melhoria de textos
- [ ] Dashboard com métricas
- [ ] Refinamentos visuais
- [ ] Testes E2E

---

## Decisões técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Armazenamento | MinIO | S3-compatible, self-hosted |
| Schema | 3 tabelas de domínio | client, analysis, analysisPhoto |
| Auth | Better Auth | Já na base T3 |
| PDF | A definir | Fase 3 |
| IA | A definir | Fase 4 |
