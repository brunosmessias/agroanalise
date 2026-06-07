# Sincronização Offline para Campo

## Problem Statement

Muitas propriedades rurais onde agrônomos prestam serviço têm cobertura de internet limitada ou inexistente. Hoje, sem conexão, o agrônomo não consegue cadastrar análises, registrar observações ou tirar fotos no sistema — perdendo informações ou precisando anotar em papel e redigitar depois. Isso quebra o fluxo de trabalho e gera perda de dados.

## Goals

- [ ] Agrônomo consegue criar análises e registrar observações sem internet
- [ ] Fotos são salvas localmente quando offline e sincronizadas quando a conexão volta
- [ ] Sistema exibe indicador claro do status de sincronização (sincronizado, pendente, erro)
- [ ] Sincronização é automática ao detectar retorno da conexão
- [ ] Zero perda de dados — tudo que foi registrado offline chega ao servidor

## Out of Scope

| Feature | Reason |
|---------|--------|
| Sincronização em segundo plano (Background Sync API) | Complexidade elevada, requer service worker avançado |
| Captura de áudio offline | Feature separada, não bloqueia MVP offline |
| Resolução de conflitos (multi-device) | v1 é single-user, um dispositivo por vez |
| IA gerando relatório pós-sync | Evolução futura |
| Cache de dados do servidor para consulta offline | MVP foca em criação, não leitura offline |

---

## User Stories

### P1: Criar análise offline ⭐ MVP

**User Story**: Como agrônomo em campo sem internet, quero poder criar uma análise com título, data, descrição e fotos para que minhas informações não se percam.

**Why P1**: É o fluxo principal — sem isso o agrônomo perde dados toda vez que vai a campo sem sinal.

**Acceptance Criteria**:

1. WHEN agrônomo está sem conexão e acessa "Nova Análise" THEN system SHALL permitir preenchimento normal do step form (título, data, descrição)
2. WHEN agrônomo adiciona fotos offline THEN system SHALL salvar fotos localmente no dispositivo (IndexedDB/Blob)
3. WHEN agrônomo salva análise offline THEN system SHALL armazenar localmente com status "pending" e exibir indicador "Pendente de sincronização"
4. WHEN análise é salva offline THEN system SHALL aparecer na lista de análises do cliente com badge "Pendente"
5. WHEN conexão é restaurada THEN system SHALL sincronizar automaticamente todas as análises pendentes
6. WHEN sincronização completa THEN system SHALL atualizar status para "Sincronizado" e remover badge "Pendente"
7. WHEN erro na sincronização THEN system SHALL manter análise local com status "Erro" e exibir botão "Tentar novamente"

**Independent Test**: Desligar WiFi, criar análise com 3 fotos, verificar que fica "Pendente". Ligar WiFi, verificar que sincroniza automaticamente e fotos aparecem no servidor.

---

### P2: Indicador de status de sincronização

**User Story**: Como agrônomo, quero ver claramente quais análises estão sincronizadas, pendentes ou com erro para ter controle sobre meus dados.

**Why P2**: Transparência essencial — o agrônomo precisa confiar que seus dados estão seguros.

**Acceptance Criteria**:

1. WHEN análise está pendente de sync THEN system SHALL exibir ícone amarelo + badge "Pendente" no card
2. WHEN análise está sincronizada THEN system SHALL exibir ícone verde + badge "Sincronizado" (ou nenhum badge se tudo OK)
3. WHEN análise teve erro de sync THEN system SHALL exibir ícone vermelho + badge "Erro" com botão "Tentar novamente"
4. WHEN existe ao menos 1 análise pendente THEN system SHALL exibir banner no topo do dashboard: "X análises pendentes de sincronização"
5. WHEN agrônomo clica em "Tentar novamente" THEN system SHALL reprocessar a sincronização

**Independent Test**: Ter análises nos 3 estados, verificar que badges e cores estão corretos. Verificar banner no dashboard.

---

### P3: Detecção de conexão e trigger de sync

**User Story**: Como agrônomo, quero que o sistema detecte automaticamente quando volto a ter internet e sincronize sem que eu precise fazer nada.

**Why P3**: Automatização — se o agrônomo precisa lembrar de sincronizar manualmente, o recurso perde utilidade.

**Acceptance Criteria**:

1. WHEN sistema detecta que conexão foi restaurada THEN system SHALL disparar sincronização automática em background
2. WHEN sync está em andamento THEN system SHALL exibir indicador discreto "Sincronizando..."
3. WHEN sync completa com sucesso THEN system SHALL exibir toast "X análises sincronizadas"
4. WHEN sync falha parcialmente THEN system SHALL sincronizar o que der e manter as falhas como "Erro"

**Independent Test**: Com análises pendentes, ligar WiFi. Verificar que sync dispara automaticamente sem interação.

---

## Edge Cases

- WHEN agrônomo fecha o browser com dados pendentes THEN system SHALL manter dados no IndexedDB — ao reabrir, pendências continuam lá
- WHEN fotos offline são muito grandes (> 50 MB total) THEN system SHALL alertar "Armazenamento local cheio" e sugerir comprimir ou reduzir fotos
- WHEN mesma análise é editada offline e depois sync conflita com versão do servidor THEN versão offline prevalece (single-user, sem conflito real)
- WHEN agrônomo tenta acessar página pública offline THEN system SHALL exibir mensagem "Conteúdo disponível apenas online"
- WHEN IndexedDB é limpo pelo browser THEN system SHALL alertar que dados pendentes foram perdidos (não recuperável)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| SYNC-01 | P1: Criar análise offline | Design | Pending |
| SYNC-02 | P1: Salvar fotos localmente | Design | Pending |
| SYNC-03 | P1: Status pending | Design | Pending |
| SYNC-04 | P1: Badge Pendente | Design | Pending |
| SYNC-05 | P1: Auto-sync ao reconectar | Design | Pending |
| SYNC-06 | P1: Status sincronizado | Design | Pending |
| SYNC-07 | P1: Erro com retry | Design | Pending |
| SYNC-08 | P2: Ícone amarelo pendente | Design | Pending |
| SYNC-09 | P2: Ícone verde sincronizado | Design | Pending |
| SYNC-10 | P2: Ícone vermelho erro | Design | Pending |
| SYNC-11 | P2: Banner pendentes no dashboard | Design | Pending |
| SYNC-12 | P3: Detecção automática | Design | Pending |
| SYNC-13 | P3: Indicador sincronizando | Design | Pending |
| SYNC-14 | P3: Toast sucesso | Design | Pending |
| SYNC-15 | P3: Sync parcial | Design | Pending |

**Coverage**: 15 total, 0 mapped to tasks, 15 unmapped ⚠️

---

## Success Criteria

- [ ] Agrônomo consegue criar análise completa (texto + fotos) 100% offline
- [ ] Dados persistem no IndexedDB ao fechar e reabrir o browser
- [ ] Sincronização automática ao reconectar, sem ação do usuário
- [ ] Zero perda de dados em cenário normal de uso
- [ ] Status visual claro em todas as análises pendentes
