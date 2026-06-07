# Otimização Inteligente de Imagens

## Problem Statement

Fotos tiradas por smartphones modernos têm entre 5 MB e 15 MB cada. Uma análise com 10 fotos pode chegar a 100 MB em armazenamento e minutos de upload em conexões móveis lentas (comum em propriedades rurais). Isso aumenta custos de storage no MinIO, degrada a experiência de uso em campo e torna o carregamento da página pública lento.

## Goals

- [ ] Imagens são automaticamente comprimidas e convertidas para WebP no upload
- [ ] Redução superior a 80% no tamanho de armazenamento por imagem
- [ ] Miniaturas geradas automaticamente para listagens (carregamento rápido)
- [ ] Upload em conexões 3G/4G completes em < 5 segundos por imagem
- [ ] Imagem original preservada para download futuro (opcional)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Compressão client-side antes do upload | Complexidade elevada no MVP — backend resolve |
| CDN para imagens | Adicionar depois se necessário |
| Detecção de duplicatas | Não é problema atual |
| Edição de imagem (crop, rotate) no browser | Fora do escopo — agrônomo edita no celular antes |
| Lazy loading de imagens originais | Next.js Image já faz isso |

---

## User Stories

### P1: Compressão automática no upload ⭐ MVP

**User Story**: Como agrônomo, quero que minhas fotos sejam automaticamente comprimidas quando faço upload para que o envio seja rápido mesmo em conexões lentas no campo.

**Why P1**: É o gargalo principal — sem compressão, upload em campo é inviável e custo de storage explode.

**Acceptance Criteria**:

1. WHEN agrônomo faz upload de foto THEN system SHALL comprimir a imagem no backend antes de salvar no MinIO
2. WHEN imagem original é JPEG ou PNG THEN system SHALL converter para WebP
3. WHEN compressão é aplicada THEN quality SHALL ser entre 75% e 85%
4. WHEN imagem tem largura > 2048px THEN system SHALL redimensionar mantendo proporção com max 2048px
5. WHEN compressão finaliza THEN system SHALL salvar apenas a versão otimizada no MinIO (sobrescrever original)
6. WHEN upload completa THEN system SHALL exibir preview da imagem otimizada
7. WHEN erro na compressão THEN system SHALL salvar a imagem original como fallback e logar o erro

**Independent Test**: Fazer upload de uma foto de 12 MB (iPhone/Android). Verificar que o arquivo salvo no MinIO é WebP com < 1 MB. Verificar que o preview funciona normalmente.

---

### P2: Geração de miniaturas

**User Story**: Como agrônomo, quero que as listagens de análises e clientes carreguem rapidamente com miniaturas leves, sem precisar carregar as fotos em tamanho original.

**Why P2**: Miniaturas reduzem drasticamente o tempo de carregamento das listagens e melhoram a experiência geral.

**Acceptance Criteria**:

1. WHEN foto é salva THEN system SHALL gerar uma miniatura de max 300px de largura em WebP
2. WHEN listagem de análises é exibida THEN system SHALL usar miniaturas nos cards
3. WHEN listagem de clientes é exibida THEN system SHALL usar miniaturas nos cards
4. WHEN agrônomo clica na miniatura ou abre lightbox THEN system SHALL carregar a imagem otimizada (2048px)
5. WHEN miniatura é gerada THEN system SHALL salvar no MinIO com sufixo `_thumb` no path

**Independent Test**: Verificar que listagem de análises carrega miniaturas (< 50 KB cada). Verificar que clicar abre a imagem maior.

---

### P3: Otimização de imagens existentes

**User Story**: Como agrônomo, quero que minhas fotos já cadastradas sejam otimizadas retroativamente para reduzir o uso de armazenamento.

**Why P3**: Importante mas não bloqueia novo uso — pode rodar como background job.

**Acceptance Criteria**:

1. WHEN script de migração é executado THEN system SHALL processar todas as imagens existentes
2. WHEN imagem é processada THEN system SHALL aplicar as mesmas regras de compressão + miniatura
3. WHEN processamento finaliza THEN system SHALL logar total de imagens processadas e economia em MB

**Independent Test**: Rodar script em ambiente de dev. Verificar que todas as imagens foram convertidas e miniaturas geradas.

---

## Edge Cases

- WHEN imagem já é WebP com < 500 KB THEN system SHALL pular compressão (já otimizada)
- WHEN imagem é GIF animado THEN system SHALL manter como GIF sem comprimir (WebP animado é instável)
- WHEN imagem tem menos de 100px de largura THEN system SHALL manter original (miniatura seria inútil)
- WHEN erro no Sharp (formato não suportado) THEN system SHALL salvar original e logar warning
- WHEN upload é de avatar (não foto de análise) THEN system SHALL aplicar compressão mas gerar miniatura quadrada (300x300)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status | Task |
|----------------|-------|-------|--------|
| IMG-01 | P1: Compressão automática | Execute | Done | T1, T3 |
| IMG-02 | P1: Conversão WebP | Execute | Done | T1, T3 |
| IMG-03 | P1: Quality 75-85% | Execute | Done | T1 |
| IMG-04 | P1: Resize max 2048px | Execute | Done | T1 |
| IMG-05 | P1: Fallback em erro | Execute | Done | T3 |
| IMG-06 | P2: Miniatura 300px | Execute | Done | T1, T3 |
| IMG-07 | P2: Miniatura em listagens | Execute | Done | T7 |
| IMG-08 | P2: Sufixo _thumb no path | Execute | Done | T2, T3 |
| IMG-09 | P3: Migração retroativa | Execute | Done | T8 |
| IMG-10 | P3: Log de economia | Execute | Done | T8 |

**Coverage**: 10 total, 10 mapped to tasks, 0 unmapped ✅

---

## Success Criteria

- [x] Imagem de 10 MB é reduzida para < 1 MB após compressão
- [x] Miniatura tem < 50 KB
- [ ] Upload em 3G completa em < 5 segundos
- [x] Nenhuma perda visual perceptível na imagem comprimida
- [x] Listagens carregam 3x mais rápido com miniaturas
