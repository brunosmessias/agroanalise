# Assistente IA para Textos de Análise

## Problem Statement

Agrônomos escrevem análises técnicas no campo, muitas vezes com pressa, resultando em textos informais, incompletos ou com linguagem inadequada para um relatório profissional. Precisam de uma ferramenta que reformule esses textos de forma automática, mantendo o conteúdo técnico mas com redação profissional, clara e bem estruturada.

## Goals

- [ ] Agrônomo consegue reescrever a descrição da análise com 1 clique
- [ ] Texto reescrito mantém o conteúdo original mas com redação profissional
- [ ] Agrônomo mantém controle total — pode aceitar, descartar ou voltar ao original
- [ ] Funciona também para descrições de fotos individuais

## Out of Scope

| Feature | Reason |
|---------|--------|
| Geração automática de texto do zero | Agrônomo deve ser autor; IA apenas reescreve |
| Correção gramatical isolada | Reescrita profissional já inclui correção |
| Análise de imagens por IA | Escopo diferente, seria outra feature |
| Chat conversacional com IA | MVP é reescrita em 1 clique, não chat |
| Tradução de idiomas | Não é necessidade atual |
| Integração com múltiplos provedores de IA | MVP usa um provedor |

---

## User Stories

### P1: Reescrever descrição da análise ⭐ MVP

**User Story**: Como agrônomo, quero que a IA reescreva a descrição da minha análise para que o texto fique profissional, claro e adequado para compartilhar com clientes.

**Why P1**: É o ponto de maior impacto — a descrição é o texto principal da análise e vai para o relatório público.

**Acceptance Criteria**:

1. WHEN agrônomo clica em "Melhorar com IA" ao lado do campo Descrição THEN system SHALL enviar o texto atual para a IA e exibir um loading no botão
2. WHEN IA retorna o texto reescrito THEN system SHALL exibir o texto reescrito no campo de descrição, substituindo o original
3. WHEN texto reescrito é exibido THEN system SHALL mostrar toast "Texto melhorado com IA!" e habilitar o botão "Desfazer" para restaurar o texto original
4. WHEN agrônomo clica em "Desfazer" THEN system SHALL restaurar o texto anterior à última reescrita
5. WHEN campo de descrição está vazio THEN system SHALL desabilitar o botão "Melhorar com IA"
6. WHEN IA retorna erro THEN system SHALL exibir toast de erro e manter o texto original inalterado
7. WHEN IA está processando THEN system SHALL desabilitar o botão e mostrar spinner

**Independent Test**: Abrir uma análise, escrever um texto informal na descrição, clicar "Melhorar com IA", verificar que o texto é reescrito profissionalmente, clicar "Desfazer" e verificar que o texto original volta.

---

### P2: Reescrever descrição de fotos

**User Story**: Como agrônomo, quero que a IA reescreva a descrição de cada foto individualmente para que as legendas fiquem profissionais.

**Why P2**: Complementa a P1 — fotos também têm descrições que vão para o relatório, mas é secundário em relação ao texto principal.

**Acceptance Criteria**:

1. WHEN agrônomo clica em "Melhorar com IA" ao lado do campo de descrição de uma foto THEN system SHALL reescrever apenas aquela descrição
2. WHEN IA retorna o texto reescrito THEN system SHALL atualizar apenas aquela foto e aplicar o debounce de salvamento existente
3. WHEN IA retorna erro THEN system SHALL exibir toast de erro e manter a descrição original da foto

**Independent Test**: Abrir uma análise, ir para o step de Fotos, escrever uma legenda informal, clicar "Melhorar com IA", verificar reescrita.

---

### P3: Reescrever título da análise

**User Story**: Como agrônomo, quero sugestões de título mais profissional para minha análise.

**Why P3**: O título é curto e o agrônomo geralmente já escreve adequadamente — é nice-to-have.

**Acceptance Criteria**:

1. WHEN agrônomo clica em "Melhorar com IA" ao lado do campo Título THEN system SHALL reescrever o título mantendo concisão

---

## Edge Cases

- WHEN texto tem menos de 10 caracteres THEN system SHALL mostrar toast "Texto muito curto para melhorar"
- WHEN IA demora mais de 30 segundos THEN system SHALL cancelar e mostrar toast de timeout
- WHEN texto contém informações sensíveis (CPF, telefone) THEN system SHALL preservar intacto na reescrita
- WHEN agrônomo clica "Melhorar" múltiplas vezes seguidas THEN system SHALL cancelar requisição anterior e usar apenas a última

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| AI-01 | P1: Reescrever descrição | Design | Pending |
| AI-02 | P1: Reescrever descrição | Design | Pending |
| AI-03 | P1: Botão desfazer | Design | Pending |
| AI-04 | P1: Desabilitar quando vazio | Design | Pending |
| AI-05 | P1: Tratamento de erro | Design | Pending |
| AI-06 | P1: Loading state | Design | Pending |
| AI-07 | P2: Reescrever descrição de foto | - | Pending |
| AI-08 | P2: Debounce salvamento foto | - | Pending |
| AI-09 | P2: Tratamento de erro foto | - | Pending |
| AI-10 | P1: Texto curto | - | Pending |
| AI-11 | P1: Timeout | - | Pending |
| AI-12 | P1: Cancelar requisição anterior | - | Pending |

**Coverage**: 12 total, 0 mapped to tasks, 12 unmapped ⚠️

---

## Success Criteria

- [ ] Agrônomo consegue reescrever descrição da análise em < 5 segundos
- [ ] Texto reescrito é profissional, mantém conteúdo técnico original
- [ ] Agrônomo pode desfazer a reescrita e voltar ao texto original
- [ ] Funciona tanto para descrição da análise quanto para legendas de fotos
