# Roadmap

Lista de melhorias planejadas para o organizador pessoal. Conforme forem sendo usadas e testadas no dia a dia, atualizamos esse arquivo (movendo pra "Feito" ou ajustando prioridade).

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

- Anexos (imagens e código) em tarefas e respostas
- Thread de respostas por tarefa
- Cadastro de tags e pessoas (devs/POs)
- Bloqueio/desbloqueio de tarefas com histórico
- Confirmação antes de excluir tarefa + feedback de erro nas ações rápidas (concluir/bloquear/anexar/remover)
