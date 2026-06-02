# 📊 Dashboard

> Visão geral do trabalho do agrônomo com métricas e atividades recentes.

## Visão Geral

O dashboard é a **página inicial** do painel do agrônomo. Ele oferece uma visão rápida e organizada do que está acontecendo: quantos clientes estão cadastrados, quantas análises foram feitas, e quais foram as visitas mais recentes.

É o primeiro lugar que o agrônomo vê ao fazer login, servindo como **hub de navegação** para as funcionalidades principais.

## Como Funciona

### Cards de métricas

Na parte superior, 4 cards apresentam os números principais:

| Card | O que mostra |
|------|-------------|
| 👤 **Total de clientes** | Quantidade de clientes cadastrados |
| 🔬 **Total de análises** | Quantidade de análises realizadas |
| 📸 **Total de fotos** | Quantidade de fotos enviadas |
| 📅 **Análises este mês** | Quantas análises foram criadas no mês atual |

### Análises recentes

Abaixo dos cards, uma seção lista as **análises mais recentes** com:
- Título da análise
- Nome do cliente
- Data da visita
- Thumbnail da primeira foto
- Link para abrir a análise

### Ações rápidas

O dashboard também oferece atalhos para:
- ➕ Criar novo cliente
- ➕ Criar nova análise

```mermaid
flowchart TB
    subgraph Dashboard["📊 Dashboard"]
        Metrics["📈 Cards de Métricas"]
        Recent["🕐 Análises Recentes"]
        Actions["⚡ Ações Rápidas"]
    end

    Metrics --- |"4 indicadores"| M1["👤 Clientes"]
    Metrics --- |""| M2["🔬 Análises"]
    Metrics --- |""| M3["📸 Fotos"]
    Metrics --- |""| M4["📅 Este Mês"]

    Recent --> OpenAnalysis["🔬 Ver Análise"]
    Recent --> OpenClient["👤 Ver Cliente"]
    Actions --> NewClient["➕ Novo Cliente"]
    Actions --> NewAnalysis["➕ Nova Análise"]
```

## Regras Importantes

| Regra | Detalhe |
|-------|---------|
| 🔒 Dados do agrônomo | O dashboard mostra apenas dados do agrônomo logado |
| 📊 Cálculo em tempo real | As métricas são calculadas a cada acesso (não cacheadas) |
| 📅 Mês atual | "Análises este mês" considera o mês corrente (do dia 1 ao último dia) |
| 🕐 Ordenação | Análises recentes ordenadas pela data de criação (mais recentes primeiro) |

## Quem Pode Fazer O Que

| Ação | 🧑‍🌾 Agrônomo |
|------|-----------|
| Ver o dashboard | ✅ |
| Ver métricas | ✅ |
| Ver análises recentes | ✅ |
| Usar ações rápidas | ✅ |

> O dashboard é exclusivo do agrônomo — clientes e visitantes não têm acesso.

## Perguntas Frequentes

**As métricas atualizam automaticamente?**
Sim. Cada vez que o agrônomo acessa o dashboard, os dados são buscados no banco de dados em tempo real.

**Posso filtrar as métricas por período?**
Na versão atual, não. O dashboard mostra o total geral e o comparativo do mês atual. Filtros por período estão no roadmap futuro.

**O dashboard funciona no celular?**
Sim. O layout é responsivo — no celular, os cards de métricas empilham em 2 colunas e as análises recentes ficam em lista vertical.
