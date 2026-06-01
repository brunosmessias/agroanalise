# Projeto Novo

**Vision:** Sistema web com autenticação e gerenciamento de permissões baseado em RBAC.
**For:** Administradores de sistema que precisam controlar acesso de usuários.
**Solves:** Falta de uma base sólida e reutilizável para auth + RBAC em projetos web.

## Goals

- Login e cadastro funcional com email e senha
- Gerenciamento de roles e permissões via interface admin
- Proteção de rotas e ações por perfil de usuário

## Tech Stack

**Core:**
- Framework: Next.js 15 (App Router)
- Language: TypeScript strict
- Database: PostgreSQL + Drizzle ORM

**Key dependencies:** tRPC, Better Auth (admin plugin), shadcn/ui, Tailwind CSS v4, Zod

## Scope

**v1 includes:**
- Login/cadastro com email e senha
- App shell autenticado (sidebar inset + header)
- Página de gerenciamento de permissões (RBAC)
- Proteção de rotas por role

**Explicitly out of scope:**
- Login social
- Recuperação de senha
- Verificação de email
- 2FA/OTP

## Constraints

- Technical: Base T3 como boilerplate
- Base obrigatória: `Pessoal/base`
