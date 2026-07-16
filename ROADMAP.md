# Roadmap

Lista de melhorias planejadas para o organizador pessoal. Conforme forem sendo usadas e testadas no dia a dia, atualizamos esse arquivo (movendo pra "Feito" ou ajustando prioridade).

## Bugs conhecidos

- [ ] **Prazo no mesmo dia usa o horário atual** — em `DeadlineField.tsx`, ao escolher uma data no calendário o horário aplicado é sempre o horário atual (`now.getHours()/getMinutes()`). Ao definir o prazo pra hoje, o horário fica igual (ou passa a ser passado poucos segundos depois), fazendo a tarefa parecer atrasada assim que é criada. Esperado: quando a data escolhida for hoje, aplicar o último horário do dia (23:59) em vez do horário atual.
- [ ] **Diálogos podem ficar presos na animação de fechar** — todo `Dialog` do app (`components/ui/dialog.tsx`, base-ui) espera a animação CSS de saída terminar antes de desmontar. Em teste automatizado (navegador headless, `prefers-reduced-motion: reduce` forçado) essa animação ficou congelada em `currentTime: 0` e o diálogo nunca fechou sozinho após salvar — reproduzido tanto no `TaskFormDialog` (já existente) quanto nos novos diálogos de finanças, então não é regressão do módulo novo. Provavelmente é artefato do ambiente de teste (aba em segundo plano/throttling), não reproduzido no uso normal até agora — mas vale prestar atenção caso algum dia um diálogo "não feche" de verdade pra você, principalmente se usar "reduzir movimento" nas configurações do sistema/navegador.

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

- **Finanças pessoais** — tela `/financas` nova, fora do domínio de tarefas: contas a pagar e assinaturas recorrentes (com "marcar como pago" por ciclo mensal), total gasto por mês, gasto por categoria, e metas de economia com barra de progresso e contribuições. Testado localmente e já em produção (`ricardordrj.com`).
- Anexos (imagens e código) em tarefas e respostas
- Thread de respostas por tarefa
- Cadastro de tags e pessoas (devs/POs)
- Bloqueio/desbloqueio de tarefas com histórico
- Confirmação antes de excluir tarefa + feedback de erro nas ações rápidas (concluir/bloquear/anexar/remover)
