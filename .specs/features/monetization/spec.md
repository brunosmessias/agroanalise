# Monetização — Planos e Pagamento

## Problem Statement

O AgroAnalise precisa gerar receita para se sustentar. O modelo de negócio é SaaS: agrônomos pagam assinatura mensal para usar a ferramenta. Atualmente não há sistema de planos, controle de limites por plano, cobrança recorrente ou gestão de assinatura. Sem monetização, o projeto não é viável a longo prazo.

## Goals

- [ ] Agrônomo consegue usar gratuitamente com limites (até 3 relatórios/mês, 1 fazenda)
- [ ] Agrônomo consegue assinar plano profissional (relatórios ilimitados, fazendas ilimitadas, subdomínio, PDF, logo)
- [ ] Cobrança recorrente mensal via Stripe
- [ ] Sistema controla limites por plano automaticamente
- [ ] Agrônomo consegue cancelar assinatura a qualquer momento

## Out of Scope

| Feature | Reason |
|---------|--------|
| Plano Enterprise/Team | v1 é single-user |
| Ano gratuito / trial | Freemium já serve como trial |
| Cupons de desconto | Implementar depois dos planos básicos |
| Fatura detalhada / NF | Stripe envia recibo, NF é complexidade fiscal |
| Webhook para ERP/contabilidade | Não é necessidade atual |
| Multi-moeda (USD, etc) | MVP é BR — BRL via Stripe Brasil |

---

## User Stories

### P1: Plano gratuito com limites ⭐ MVP

**User Story**: Como agrônomo usando o plano gratuito, quero ter acesso limitado à ferramenta para testar antes de pagar, mas com limites claros que me incentivem a upgrade.

**Why P1**: Sem freemium não há funil de conversão. O plano gratuito é a porta de entrada.

**Acceptance Criteria**:

1. WHEN agrônomo se cadastra THEN system SHALL atribuir plano "free" automaticamente
2. WHEN agrônomo no plano free tenta criar análise THEN system SHALL verificar se já atingiu limite de 3 relatórios no mês
3. WHEN limite atingido THEN system SHALL exibir modal "Você atingiu o limite do plano gratuito" com CTA para upgrade
4. WHEN agrônomo no plano free tenta cadastrar 2ª fazenda THEN system SHALL bloquear e exibir CTA upgrade
5. WHEN limite é renovado (novo mês) THEN system SHALL resetar contagem de relatórios do mês
6. WHEN agrônomo no plano free compartilha link THEN system SHALL funcionar normalmente (sem watermark)

**Independent Test**: Criar conta, cadastrar 1 fazenda e 3 análises. Tentar criar 4ª análise — verificar bloqueio. Verificar que novo mês reseta contagem.

---

### P2: Plano profissional com Stripe

**User Story**: Como agrônomo, quero assinar o plano profissional via cartão de crédito para desbloquear todos os recursos.

**Why P2**: É o motor de receita — sem pagamento integrado, monetização não funciona.

**Acceptance Criteria**:

1. WHEN agrônomo clica em "Upgrade" THEN system SHALL redirecionar para checkout Stripe
2. WHEN checkout completa THEN system SHALL atualizar plano para "pro" e liberar recursos
3. WHEN cobrança mensal falha THEN system SHALL rebaixar para "free" após 3 tentativas (grace period de 7 dias)
4. WHEN agrônomo cancela assinatura THEN system SHALL manter acesso pro até o final do período pago
5. WHEN agrônomo no plano pro THEN system SHALL permitir: relatórios ilimitados, fazendas ilimitadas, logo personalizada, PDF, subdomínio, histórico completo
6. WHEN webhook do Stripe recebe `checkout.session.completed` THEN system SHALL atualizar plano no banco
7. WHEN webhook recebe `customer.subscription.deleted` THEN system SHALL rebaixar plano para "free"

**Independent Test**: Fluxo completo: clicar upgrade → checkout Stripe (test mode) → verificar que plano muda para pro → criar 5+ análises sem bloqueio.

---

### P3: Página de planos e pricing

**User Story**: Como visitante/agrônomo, quero ver uma página clara com os planos e preços para decidir se assino.

**Why P3**: Página de pricing é essencial pra conversão — sem ela o agrônomo não sabe que existe plano pago.

**Acceptance Criteria**:

1. WHEN visitante acessa `/planos` THEN system SHALL exibir comparação entre plano gratuito e profissional
2. WHEN página exibe preços THEN SHALL mostrar preço fundador "R$ 19,90/mês" (preço de lançamento)
3. WHEN agrônomo logado acessa `/planos` THEN SHALL exibir plano atual e botão "Upgrade" ou "Plano atual"
4. WHEN página é acessada THEN SHALL destacar benefícios do plano pro com ícones e descrições

**Independent Test**: Acessar `/planos` deslogado — ver comparação. Logar — ver plano atual + CTA.

---

### P4: Subdomínio personalizado

**User Story**: Como agrônomo pro, quero meu perfil público em um subdomínio personalizado (ex: joao.agroanalise.com.br) para passar mais profissionalismo ao cliente.

**Why P4**: Diferencial do plano pro — adiciona valor percebido e justifica o preço.

**Acceptance Criteria**:

1. WHEN agrônomo pro configura subdomínio THEN system SHALL validar formato (apenas letras, números, hífens)
2. WHEN subdomínio é salvo THEN system SHALL criar entrada DNS/CNAME apontando para o app
3. WHEN cliente acessa `{subdominio}.agroanalise.com.br` THEN system SHALL exibir perfil público do agrônomo com suas análises
4. WHEN subdomínio já está em uso THEN system SHALL rejeitar e sugerir alternativas
5. WHEN agrônomo downgrade pra free THEN system SHALL manter subdomínio reservado mas redirecionar pra URL padrão

**Independent Test**: Configurar subdomínio "joaosilva", acessar joaosilva.agroanalise.com.br, verificar perfil do agrônomo.

---

### P5: Logo personalizada nos relatórios

**User Story**: Como agrônomo pro, quero que minha logo apareça nos relatórios PDF e páginas públicas de análise para reforçar minha marca.

**Why P5**: Personalização é um dos principais motivos para upgrade — agrônomos querem marca própria.

**Acceptance Criteria**:

1. WHEN agrônomo pro faz upload de logo THEN system SHALL exibir logo no header da página pública e PDF
2. WHEN agrônomo pro não tem logo THEN system SHALL usar nome textual como fallback
3. WHEN agrônomo free THEN system SHALL exibir branding AgroAnalise (sem customização)

**Independent Test**: Upload logo, abrir análise pública, verificar logo no header.

---

## Edge Cases

- WHEN Stripe webhook chega atrasado (propagação) THEN sistema pode ter estado inconsistente — resolver via polling periódico do status da subscription
- WHEN agrônomo faz upgrade e downgrade no mesmo mês THEN cobrança proporcional via Stripe proration
- WHEN cartão expira THEN Stripe envia email de recuperação — sistema marca como "pending_payment"
- WHEN subdomínio contém termos proibidos (admin, www, api) THEN rejeitar com mensagem clara
- WHEN agrônomo apaga a conta THEN cancelar subscription automaticamente

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| PAY-01 | P1: Plano free automático | Design | Pending |
| PAY-02 | P1: Limite 3 relatórios/mês | Design | Pending |
| PAY-03 | P1: Limite 1 fazenda | Design | Pending |
| PAY-04 | P1: Modal upgrade | Design | Pending |
| PAY-05 | P2: Checkout Stripe | Design | Pending |
| PAY-06 | P2: Upgrade automático via webhook | Design | Pending |
| PAY-07 | P2: Grace period falha | Design | Pending |
| PAY-08 | P2: Cancelamento com acesso até fim do período | Design | Pending |
| PAY-09 | P2: Recursos liberados no pro | Design | Pending |
| PAY-10 | P3: Página /planos | Design | Pending |
| PAY-11 | P3: Preço fundador | Design | Pending |
| PAY-12 | P4: Subdomínio personalizado | Design | Pending |
| PAY-13 | P4: Validação subdomínio | Design | Pending |
| PAY-14 | P5: Logo nos relatórios | Design | Pending |

**Coverage**: 14 total, 0 mapped to tasks, 14 unmapped ⚠️

---

## Success Criteria

- [ ] Checkout Stripe funcional em modo teste (cartão de teste)
- [ ] Limites do plano free são enforced corretamente
- [ ] Webhook do Stripe atualiza plano em < 30 segundos
- [ ] Página de pricing clara com CTA de conversão
- [ ] Subdomínio funciona e resolve para o perfil do agrônomo
- [ ] MRR trackable via Stripe Dashboard
