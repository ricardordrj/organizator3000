# Roadmap

Lista de melhorias planejadas para o organizador pessoal. Conforme forem sendo usadas e testadas no dia a dia, atualizamos esse arquivo (movendo pra "Feito" ou ajustando prioridade).

## Bugs conhecidos

- [ ] **Ícone do PWA aparece cinza com "R" no Android** — causa confirmada: o Cloudflare Access protege o domínio inteiro, inclusive `manifest.json` e `icon-192.png`/`icon-512.png`. Quem busca esses arquivos pra "instalar" o app não é o celular, é um servidor do Google, sem os cookies de login — então ele recebe um redirect (302) pra tela de login em vez do ícone de verdade, e o Android cai no ícone genérico (primeira letra do domínio). **Fix**: no painel Cloudflare, Zero Trust → Access → Applications, criar uma Application nova cobrindo `ricardordrj.com/manifest.json`, `/icon-192.png` e `/icon-512.png` com política **Bypass** (libera só essas rotas, sem exigir login; o resto do site continua protegido normal). Depois de aplicar, desinstalar o atalho errado do celular e instalar de novo.

## Infraestrutura

- [x] **Hospedar o app na internet** — VPS Vultr (São Paulo, vc2-1c-1gb + backup automático) + domínio `ricardordrj.com` via Cloudflare, no ar. Passo a passo em [DEPLOY.md](DEPLOY.md).
- [x] **Deploy automático (GitHub Actions)** — validado de ponta a ponta: push na `main` dispara SSH na VPS, `git pull` + `npm ci` + build + migração + restart do serviço via `deploy/deploy.sh`. Chave de deploy dedicada (`VPS_SSH_KEY`) rotacionada por segurança durante a configuração (a original foi exposta sem querer numa conversa e revogada no servidor antes de qualquer uso).
- [ ] **Proteger o acesso (Cloudflare Access)** — login via Google (uso diário) + One-Time PIN por e-mail (fallback, e forma de liberar acesso pontual pra alguém sem precisar mexer no app). Tudo configurado no painel da Cloudflare, sem código. Passo a passo em [DEPLOY.md](DEPLOY.md#8-proteger-o-acesso-cloudflare-access).

## Próximas melhorias (confirmadas)

- [ ] **Mesão de Commander — contador de vida em `/mesao`** — pra usar direto no celular durante as partidas com Marchesi, Gabigol, Serjão, Daniel e Ricardo (uso esperado: 1-2x/mês). Dinâmica decidida:
  - [x] Jogadores fixos (perfis reaproveitados entre mesões, com foto/avatar e cor próprios, editáveis aos poucos)
  - [x] Cada um só mexe na própria vida diretamente; dano de outro jogador vira **solicitação pendente** até quem tomou confirmar, ajustar o valor ou descartar — resolve o caso de "calculou errado enquanto conversava"
  - [x] Card do jogador mostra a vida; abrindo o detalhe dá pra ver o dano de comandante recebido de cada oponente (barra até 21, a régua de "quase morrendo de comandante") e o histórico da mesa
  - [x] Visual com ícones (espada pra combate, coroa pra comandante) e feedback ao vivo (número da vida pisca ao mudar)
  - [x] Sincronização entre celulares por polling (a cada ~1.5s), simples o bastante pro volume de uso — sem necessidade de websocket
  - [x] Já em produção (`ricardordrj.com/mesao`), deploy automático de sempre
  - [x] **Dano global**: botão "Dano global" causa o mesmo valor a todos os outros jogadores sentados na mesa de uma vez (efeitos de carta tipo "causa X de dano a todos os jogadores"), criando uma solicitação pendente por vítima — cada um confirma na própria tela, sem mudar a regra de "só quem apanhou decide"
  - [ ] **Acesso: solução provisória pra jogar hoje** — o Cloudflare Access do domínio inteiro já existe e só libera o e-mail do Ricardo, então dar acesso aos amigos ali liberaria o site inteiro (Finanças incluso). Solução: criar uma **segunda Application no Cloudflare Access, com path `ricardordrj.com/mesao*` + `ricardordrj.com/api/commander-*`**, política própria só com os e-mails de Marchesi/Gabigol/Serjão/Daniel (login por One-Time PIN). Cloudflare usa a regra mais específica por caminho, então o resto do site continua protegido só pro Ricardo. Por isso o carregamento de jogadores do mesão foi separado do `hydrate()` geral do app (`useAppStore.ts`) — sem isso, a tela ficaria vazia pra quem só tem acesso a `/mesao`, já que a carga geral falha inteira se qualquer endpoint fora do commander for bloqueado.
  - [ ] **Decisão definitiva de acesso**: depois de testar hoje, decidir entre manter esse esquema de duas Applications, ou trocar por outro modelo (link de convite por pessoa, etc.) — ver histórico da conversa sobre os prós/contras de cada um.
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
- **Mesão de Commander — controlador de turnos**: ao iniciar a mesão (junto com seleção dos participantes e vida inicial), definir também quem começa e a sequência/ordem de jogada, além do tempo definido por turno. Tela indica de quem é a vez; quando o tempo do jogador da vez acaba, dispara um alarme sonoro/visual avisando, e ele ganha mais X segundos (configurável) pra finalizar a jogada antes de passar a vez adiante.

## Feito

- **Dashboard mais completo** — nova seção de tarefas bloqueadas (com motivo do bloqueio e botão de desbloquear direto ali), card "Concluídas (7 dias)", e atalhos pra Upgrade PC e Dark Fantasy mostrando progresso só em contagem (itens comprados, páginas por categoria) — de propósito sem nenhum valor de finanças na tela.
- **Seção Dark Fantasy** — wiki de world-building em `/dark-fantasy` pro projeto pessoal [github.com/ricardordrj/DarkFantasy](https://github.com/ricardordrj/DarkFantasy): categorias (Visão Geral, Personagens, Mundo, Facções, Narrativa, Referências) com páginas de texto formatável (`## títulos`, `- listas`, `> citações`, `**negrito**`, `[[termo]]` pra destacar conceitos) e imagens clicáveis (abrem em visualização ampliada). Conteúdo original do repositório (11 páginas, 3 artes conceituais do Kael e do Véu Morto) já importado como ponto de partida; CRUD completo de categorias e páginas pra você continuar incrementando pelo app.
- **Redesign de navegação mobile-first** — ícone por seção (inclusive nos títulos das páginas); barra de navegação inferior fixa no mobile com os 4 itens mais usados (Dashboard, Tarefas, Finanças, Dark Fantasy) + botão "Mais" com o restante num popover, em vez do menu hambúrguer antigo; Cadastros movido pro fim da lista de links; Roadmap deixou de ser link próprio: agora é um botão "Ver roadmap" em Configurações que abre o conteúdo em um modal (`/roadmap` redireciona pra lá); camada decorativa de glow (gradientes ciano/magenta/dourado via CSS, sem imagens) atrás do conteúdo.
- **Dashboard: seção "Próximos prazos"** — lista compacta (até 4) das próximas tarefas com prazo definido que ainda não estão em alerta, complementando os cards de atrasadas/próximas do prazo já existentes, sem inflar a tela com mais números.
- **Fix: overlay de diálogo travado podia bloquear cliques na página inteira** — quando a animação de fechar de um Dialog/Popover emperra (mesmo cenário de aba em segundo plano já documentado abaixo), o overlay ficava com `pointer-events: auto` mesmo já "fechado" logicamente, travando qualquer clique na tela até recarregar. Agora `[data-closed]` força `pointer-events: none` via CSS, independente da animação travar ou não.
- **Fix: textarea com URL longa causava scroll horizontal nos modais de editar do Dark Fantasy** — a propriedade `field-sizing: content` (auto-ajuste de tamanho) ignorava a quebra de linha e a largura do container quando o texto tinha uma palavra/URL sem espaços (ex: links de imagem do GitHub), empurrando o modal pra fora da tela. Campos de conteúdo e imagens agora usam `field-sizing: fixed`, deixando o texto quebrar normalmente dentro da largura do modal (que continua podendo ser mais largo no desktop).
- **Plano de upgrade do PC** — tela nova em `/upgrade-pc`: fases e itens (com preço estimado opcional, notas e checkbox de "comprado"), totais ao vivo (investimento estimado, já comprado, restante, itens concluídos). Migrado do plano em `UpgradePC.md`, com as 5 fases e 17 itens originais já importados no banco. CRUD completo de fases e itens. Testado localmente (toggle, criar e remover item).
- **Perfis financeiros separados** — tela `/financas` agora suporta múltiplos perfis isolados (Ricardo, Mãe), cada um com suas próprias despesas, rendas, compras de vale e metas de economia; seletor de perfil no topo da página.
- **Syntax highlighting nas respostas** — código colado em respostas/anexos de tarefa é exibido com destaque de sintaxe (`CodeBlock.tsx`, usado em `TaskAttachments`) em vez de texto puro.
- **Notificação no navegador para prazos** — `useTaskDeadlineNotifications`, ligado no layout principal, dispara notificação quando uma tarefa está perto do prazo ou atrasada.
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
