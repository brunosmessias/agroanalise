# Geração de PDF de Análise

## Problem Statement

Agrônomos precisam entregar relatórios profissionais aos clientes. Atualmente a análise pode ser compartilhada via link público, mas não há exportação em PDF. O cliente do agrônomo muitas vezes prefere receber um arquivo PDF por email ou WhatsApp, e o agrônomo precisa de uma versão imprimível para anexar em processos ou laudos.

## Goals

- [ ] Agrônomo consegue gerar PDF de qualquer análise com 1 clique
- [ ] PDF tem layout visual consistente com a página pública da análise
- [ ] PDF inclui todas as fotos com descrições, dados do cliente e dados do agrônomo
- [ ] PDF funciona em análise com até 20 fotos sem travar

## Out of Scope

| Feature | Reason |
|---------|--------|
| Customização de template do PDF | MVP usa template fixo |
| Geração em lote (múltiplas análises) | Não é necessidade atual |
| Marca d'água ou senha no PDF | Complexidade desnecessária pro MVP |
| Assinatura digital do PDF | Fora do escopo agronômico |
| Escolha de orientação (landscape/portrait) | Template fixo portrait |

---

## User Stories

### P1: Gerar PDF da análise ⭐ MVP

**User Story**: Como agrônomo, quero clicar em "Exportar PDF" na página de visualização da análise para baixar um arquivo PDF profissional com todas as informações.

**Why P1**: É o fluxo principal faltante — sem PDF o agrônomo não consegue entregar relatório formal ao cliente.

**Acceptance Criteria**:

1. WHEN agrônomo clica em "Exportar PDF" na página da análise THEN system SHALL gerar PDF server-side e iniciar download
2. WHEN PDF está sendo gerado THEN system SHALL exibir loading state no botão
3. WHEN PDF é gerado com sucesso THEN system SHALL baixar arquivo nomeado como `analise-{titulo-slug}.pdf`
4. WHEN PDF inclui conteúdo THEN system SHALL conter: header com branding do agrônomo, título da análise, data, nome do cliente, descrição geral, galeria de fotos com descrições, footer com contato do agrônomo
5. WHEN análise tem mais de 10 fotos THEN system SHALL paginar corretamente sem cortar fotos ao meio
6. WHEN erro na geração THEN system SHALL exibir toast de erro e manter o botão habilitado para retry
7. WHEN link público da análise THEN botão "Exportar PDF" também estará disponível para o visitante

**Independent Test**: Abrir uma análise com 5 fotos e descrições, clicar "Exportar PDF", verificar que o PDF baixa com layout profissional, todas as fotos e textos.

---

### P2: PDF na página pública do cliente

**User Story**: Como cliente do agrônomo, quero baixar o PDF da análise diretamente da página pública que recebi por link.

**Why P2**: O cliente pode querer arquivar o relatório — ter o botão na página pública elimina a necessidade de pedir ao agrônomo.

**Acceptance Criteria**:

1. WHEN visitante acessa `/a/{slug}` THEN system SHALL exibir botão "Baixar PDF" na página pública
2. WHEN visitante clica em "Baixar PDF" THEN system SHALL gerar e baixar o mesmo PDF que o agrônomo

---

## Edge Cases

- WHEN análise não tem fotos THEN system SHALL gerar PDF apenas com texto e dados
- WHEN foto URL está quebrada THEN system SHALL pular a foto e incluir placeholder "Imagem indisponível"
- WHEN PDF demora mais de 30 segundos THEN system SHALL cancelar e exibir erro
- WHEN texto da descrição é muito longo THEN system SHALL quebrar em múltiplas páginas

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| PDF-01 | P1: Gerar PDF | Execute | Done |
| PDF-02 | P1: Loading state | Execute | Done |
| PDF-03 | P1: Download nomeado | Execute | Done |
| PDF-04 | P1: Conteúdo completo | Execute | Done |
| PDF-05 | P1: Paginação | Execute | Done |
| PDF-06 | P1: Tratamento de erro | Execute | Done |
| PDF-07 | P1: Botão na página pública | Execute | Done |
| PDF-08 | P2: Botão na página pública visitante | Execute | Done |

**Coverage**: 8 total, 8 mapped to tasks, 0 unmapped ✅

---

## Success Criteria

- [ ] PDF gerado em < 10 segundos para análise com 20 fotos
- [ ] Layout visual consistente com a página pública
- [ ] Funciona tanto no painel do agrônomo quanto na página pública
- [ ] PDF abre corretamente em leitores padrão (Chrome, Adobe, Preview)
