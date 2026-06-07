# PWA Instalável

## Problem Statement

Agrônomos acessam o sistema pelo navegador do celular, mas a experiência não se parece com um app nativo — não tem ícone na tela inicial, não abre em tela cheia, e a barra de URL do browser toma espaço. Isso prejudica a percepção de profissionalismo e dificulta o acesso rápido em campo. O agrônomo precisa abrir o browser, digitar a URL, esperar carregar — enquanto um app instalado abriria instantaneamente.

## Goals

- [ ] Agrônomo consegue instalar o AgroAnalise na tela inicial do celular (Android/iOS)
- [ ] App instalado abre em tela cheia, sem barra de URL do browser
- [ ] Ícone e splash screen personalizados com branding AgroAnalise
- [ ] Experiência de uso indistinguível de um app nativo

## Out of Scope

| Feature | Reason |
|---------|--------|
| Push notifications | Feature separada, requer infraestrutura de push |
| Background sync (Service Worker) | Complexidade elevada, sync via eventos online/offline é suficiente |
| App Store / Play Store | PWA instalável via browser é suficiente pro MVP |
| Atualizações automáticas via SW | Next.js já faz reload quando necessário |
| Cache offline de páginas (Service Worker) | MVP offline foca em criação de dados (offline-sync spec), não em cachear o app todo |

---

## User Stories

### P1: Instalar na tela inicial ⭐ MVP

**User Story**: Como agrônomo, quero instalar o AgroAnalise na tela inicial do meu celular para acessar rapidamente como um app, sem precisar abrir o browser e digitar URL.

**Why P1**: É o requisito mínimo pra PWA — sem instalação, não é PWA.

**Acceptance Criteria**:

1. WHEN agrônomo acessa o AgroAnalise no Chrome mobile (Android) THEN system SHALL exibir prompt "Adicionar à tela inicial" automaticamente (beforeinstallprompt)
2. WHEN agrônomo acessa no Safari (iOS) THEN system SHALL exibir banner instrucional "Toque em Compartilhar → Adicionar à Tela de Início"
3. WHEN agrônomo aceita instalar THEN system SHALL criar ícone na tela inicial com logo AgroAnalise
4. WHEN agrônomo abre via ícone THEN system SHALL abrir em tela cheia (standalone), sem barra de URL
5. WHEN app abre THEN splash screen SHALL exibir logo AgroAnalise com cor de fundo do app

**Independent Test**: Acessar AgroAnalise no Chrome Android, verificar que prompt de instalação aparece. Instalar, abrir pelo ícone, verificar que abre standalone com splash screen.

---

### P2: Manifest e metadados

**User Story**: Como sistema, quero que o Web App Manifest esteja completo para que browsers e SOs reconheçam o AgroAnalise como instalável.

**Why P2**: Sem manifest completo, o browser não oferece instalação e a experiência fica incompleta.

**Acceptance Criteria**:

1. WHEN manifest é carregado THEN SHALL conter: name, short_name, description, start_url, display: "standalone", theme_color, background_color, icons (192x192 e 512x512)
2. WHEN icons são referenciados THEN SHALL existir em PNG com fundo opaco (não transparente)
3. WHEN HTML head é renderizado THEN SHALL conter meta tags: theme-color, apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style, apple-touch-icon

**Independent Test**: Auditar manifest com Lighthouse PWA audit. Verificar score > 90.

---

### P3: Banner de instalação customizado

**User Story**: Como agrônomo, quero ver um banner dentro do app me incentivando a instalar, com instruções claras, caso eu não tenha instalado ainda.

**Why P3**: O prompt nativo do browser pode ser ignorado — um banner interno com contexto aumenta conversão.

**Acceptance Criteria**:

1. WHEN agrônomo acessa pelo browser e ainda não instalou THEN system SHALL exibir banner discreto no dashboard "Instale o app para acesso rápido"
2. WHEN agrônomo clica no banner THEN system SHALL disparar prompt de instalação nativo (se disponível) ou mostrar instruções (iOS)
3. WHEN agrônomo já instalou THEN system SHALL não exibir mais o banner
4. WHEN agrônomo fecha o banner THEN system SHALL não exibir novamente por 7 dias

**Independent Test**: Acessar sem ter instalado, verificar banner. Instalar, verificar que banner desaparece.

---

## Edge Cases

- WHEN agrônomo acessa via desktop THEN banner de instalação não deve aparecer (PWA é pra mobile)
- WHEN agrônomo acessa via app já instalado THEN nenhum banner ou prompt de instalação
- WHEN iOS Safari THEN não suporta beforeinstallprompt — mostrar banner instrucional permanente (com ícone de compartilhar)
- WHEN agrônomo limpa dados do site THEN resetar flag de "não mostrar banner por 7 dias"

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| PWA-01 | P1: Prompt instalação Chrome | Design | Pending |
| PWA-02 | P1: Banner instrucional iOS | Design | Pending |
| PWA-03 | P1: Ícone na tela inicial | Design | Pending |
| PWA-04 | P1: Standalone sem barra URL | Design | Pending |
| PWA-05 | P1: Splash screen | Design | Pending |
| PWA-06 | P2: Manifest completo | Design | Pending |
| PWA-07 | P2: Ícones PNG | Design | Pending |
| PWA-08 | P2: Meta tags iOS | Design | Pending |
| PWA-09 | P3: Banner customizado | Design | Pending |
| PWA-10 | P3: Disparar prompt nativo | Design | Pending |
| PWA-11 | P3: Ocultar após instalação | Design | Pending |
| PWA-12 | P3: Não mostrar por 7 dias | Design | Pending |

**Coverage**: 12 total, 0 mapped to tasks, 12 unmapped ⚠️

---

## Success Criteria

- [ ] Lighthouse PWA audit score > 90
- [ ] Instalável no Chrome Android via prompt nativo
- [ ] Instrução clara para iOS Safari
- [ ] Abre standalone com splash screen
- [ ] Ícone correto na tela inicial
