# Roadmap Estratégico - AgroAnálise

## Epic 1 - Estratégia Comercial e Monetização

### Objetivo

Validar a disposição de pagamento dos agrônomos e criar uma receita recorrente sustentável.

### Hipótese

Agrônomos estão dispostos a pagar por uma ferramenta que reduza o tempo gasto na elaboração de relatórios técnicos e aumente o profissionalismo das entregas aos clientes.

### MVP de Monetização

#### Plano Gratuito

- Até 3 relatórios por mês.
- Até 1 fazenda cadastrada.
- Compartilhamento de relatórios via link.

#### Plano Profissional

- Relatórios ilimitados.
- Fazendas ilimitadas.
- Personalização com logo do consultor.
- Exportação para PDF.
- Subdomínio personalizado.
- Histórico completo de visitas.

### Experimentos

- Testar preço de R$ 19,90/mês.
- Testar preço de R$ 29,90/mês.
- Oferecer preço fundador para primeiros clientes.
- Medir taxa de conversão do gratuito para o pago.

### Métricas

- Número de usuários ativos.
- Conversão para plano pago.
- Churn mensal.
- Receita recorrente mensal (MRR).

---

## Epic 2 - Otimização Inteligente de Imagens

### Objetivo

Reduzir custos de armazenamento e melhorar a velocidade de upload de fotos das visitas.

### Problema

Fotos tiradas por smartphones modernos podem possuir entre 5 MB e 15 MB por arquivo, aumentando custos de armazenamento e tempo de envio.

### Funcionalidades

#### Compressão automática

- Comprimir imagens no backend utilizando Sharp.
- Converter imagens para WebP.
- Configurar qualidade entre 75% e 85%.

#### Redimensionamento

- Limitar largura máxima para 2048px.
- Manter proporção original.

#### Geração de miniaturas

- Criar versão reduzida para listagens.
- Melhorar carregamento da aplicação.

### Benefícios Esperados

- Redução superior a 80% no armazenamento.
- Upload mais rápido.
- Melhor experiência em conexões móveis.

### Métricas

- Tamanho médio por visita.
- Espaço consumido por cliente.
- Tempo médio de upload.

---

## Epic 3 - Funcionamento Offline para Campo

### Objetivo

Permitir o registro de visitas técnicas mesmo em locais sem acesso à internet.

### Problema

Muitas propriedades rurais possuem cobertura de internet limitada ou inexistente.

### Funcionalidades

#### Armazenamento local

- Salvar visitas no dispositivo.
- Salvar observações localmente.
- Salvar fotos localmente.

#### Fila de sincronização

- Marcar registros como pendentes.
- Detectar retorno da conexão.
- Sincronizar automaticamente com o servidor.

#### Indicadores de sincronização

Exibir status:

- Sincronizado
- Pendente
- Erro de sincronização

#### PWA Instalável

- Permitir instalação na tela inicial.
- Funcionamento semelhante a aplicativo nativo.

### Tecnologias Sugeridas

- PWA.
- IndexedDB.
- Dexie.
- TanStack Query.
- Service Workers.

### Evoluções Futuras

- Sincronização em segundo plano.
- Captura de áudio offline.
- IA para geração automática de relatórios após sincronização.

### Benefícios Esperados

- Uso confiável em fazendas sem sinal.
- Redução de perda de informações.
- Diferencial competitivo para consultores de campo.

### Métricas

- Quantidade de visitas registradas offline.
- Taxa de sincronização bem-sucedida.
- Número de erros de sincronização.
