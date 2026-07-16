# Roadmap

Lista de melhorias planejadas para o organizador pessoal. Conforme forem sendo usadas e testadas no dia a dia, atualizamos esse arquivo (movendo pra "Feito" ou ajustando prioridade).

## Bugs conhecidos

Nenhum em aberto no momento.

## Infraestrutura

- [x] **Hospedar o app na internet** — VPS Vultr (São Paulo, vc2-1c-1gb + backup automático) + domínio `ricardordrj.com` via Cloudflare, no ar. Falta só validar o auto-deploy (GitHub Actions) de ponta a ponta. Passo a passo em [DEPLOY.md](DEPLOY.md).
- [ ] **Proteger o acesso (Cloudflare Access)** — login via Google (uso diário) + One-Time PIN por e-mail (fallback, e forma de liberar acesso pontual pra alguém sem precisar mexer no app). Tudo configurado no painel da Cloudflare, sem código. Passo a passo em [DEPLOY.md](DEPLOY.md#8-proteger-o-acesso-cloudflare-access).

## Próximas melhorias (confirmadas)

- [ ] **Syntax highlighting nas respostas** — quando colar código em uma resposta de tarefa, exibir com destaque de sintaxe em vez de texto puro (hoje `TaskResponses`/`TaskAttachments` mostram só texto cru no preview de anexos de código).
- [ ] **Notificação no navegador para prazos** — usar a lógica de urgência que já existe (`getTaskUrgency` em `date.utils`) para disparar notificações quando uma tarefa estiver perto do prazo ou atrasada.
- [ ] **Utilitários de dev**
  - [ ] Templates de tarefa para tipos recorrentes (bug, feature, etc.)
  - [ ] Atalho de teclado (Cmd/Ctrl+K) para criar tarefa rápida ou buscar

## Em avaliação

- **Pessoas (devs/POs) e responsável/aberto por** — ficou mais elaborado do que precisava pra um uso 100% pessoal (foi pensado como se fosse multiusuário). Não remover por enquanto — avaliar se dá pra reaproveitar esse cadastro de outra forma (ex: marcar "quem pediu" um ticket externo, ou simplesmente simplificar pra um campo livre de texto).

## Ideias futuras (backlog, sem prioridade definida)

- Filtros na lista de tarefas (tag, responsável, status, prioridade) — hoje só busca por título
- Ordenação customizável (prazo, prioridade, criação)
- Visão Kanban por status
- Visão em calendário dos prazos
- Resumo ao abrir o app ("3 atrasadas, 2 vencendo hoje")
- Gráfico de tarefas concluídas por semana
- Comparativo estimado x executado
- Exportar/importar tarefas em JSON (backup manual)
- Arquivar tarefas concluídas antigas

## Feito

- **Prazo no mesmo dia usa o horário atual** — corrigido em `DeadlineField.tsx`: quando a data escolhida no calendário é hoje, aplica 23:59:59 em vez do horário atual (evitava a tarefa nascer "quase atrasada"). Testado selecionando o dia atual e conferindo o horário exibido.
- **Diálogos podem ficar presos na animação de fechar** — causa raiz confirmada: em aba com `document.hidden = true` (segundo plano), o navegador para de disparar `requestAnimationFrame`, e o base-ui depende disso pra detectar o fim da animação de saída e desmontar o diálogo. É um comportamento do navegador pra abas em background, não um bug do app — numa aba em foco (uso normal) isso não acontece. Mesmo assim, adicionei uma proteção defensiva: com `prefers-reduced-motion: reduce` ativo, a animação do diálogo é removida completamente (`animation: none`), então não há animação pra "travar" nesse caso específico.
- **Redesign visual cyberpunk x Dark Souls** — paleta ciano/magenta/dourado ("ember"), fonte Orbitron nos títulos, glow em cards e botões, scanlines sutis, nav mobile com menu hambúrguer. Testado em 375px sem overflow horizontal.
- **Renda e vale alimentação** — cadastro de salário e outras rendas mensais; vale alimentação funciona como saldo (renda cadastrada menos compras do mês). Despesa rápida de supermercado com descrição obrigatória (o que foi comprado), descontada automaticamente do saldo do vale. Resumo mensal expandido: renda total, gasto total, saldo do mês e saldo do vale, tudo em `/financas`.
- **Finanças pessoais** — tela `/financas` nova, fora do domínio de tarefas: contas a pagar e assinaturas recorrentes (com "marcar como pago" por ciclo mensal), total gasto por mês, gasto por categoria, e metas de economia com barra de progresso e contribuições. Testado localmente e já em produção (`ricardordrj.com`).
- Anexos (imagens e código) em tarefas e respostas
- Thread de respostas por tarefa
- Cadastro de tags e pessoas (devs/POs)
- Bloqueio/desbloqueio de tarefas com histórico
- Confirmação antes de excluir tarefa + feedback de erro nas ações rápidas (concluir/bloquear/anexar/remover)
