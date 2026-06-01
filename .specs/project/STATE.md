# State

**Last Updated:** 2026-05-13
**Current Work:** Bootstrap do projeto - setup base + auth + permissões

---

## Recent Decisions (Last 60 days)

### AD-001: Stack base T3 (2026-05-13)
**Decision:** Usar Create T3 App como boilerplate base
**Reason:** Padronização do stack e aceleração de setup
**Trade-off:** Configuração extra para adaptar ao padrão SDD
**Impact:** Estrutura de pastas, tRPC, Drizzle e Better Auth já configurados

### AD-002: React Hook Form ao invés de TanStack Form (2026-05-13)
**Decision:** Usar React Hook Form para formulários
**Reason:** Simplicidade inicial, menor curva de aprendizado
**Trade-off:** Menos features avançadas do TanStack Form
**Impact:** Formulários de login, cadastro e gerenciamento de roles

### AD-003: Better Auth Admin Plugin para RBAC (2026-05-13)
**Decision:** Usar o admin plugin nativo do Better Auth
**Reason:** Integração nativa com Better Auth, access control embutido
**Trade-off:** Acoplamento com Better Auth para lógica de permissões
**Impact:** Roles e permissions gerenciados pelo plugin

---

## Active Blockers

(nenhum)

---

## Lessons Learned

(nenhum)

---

## Deferred Ideas

- [ ] Login social (Google, GitHub) — Futuro
- [ ] Recuperação de senha — Futuro
- [ ] Verificação de email — Futuro
- [ ] Dashboard com conteúdo real — Futuro

---

## Todos

- [ ] Setup do projeto a partir da base T3
- [ ] Schema do banco (roles, permissões)
- [ ] Better Auth com admin plugin
- [ ] Páginas de login/cadastro
- [ ] App shell (sidebar + header)
- [ ] Middleware de proteção
- [ ] Página de permissões
