CREATE TABLE `lore_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`order_index` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `lore_categories_order_idx` ON `lore_categories` (`order_index`);--> statement-breakpoint
CREATE TABLE `lore_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`images_json` text NOT NULL,
	`order_index` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `lore_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `lore_entries_category_idx` ON `lore_entries` (`category_id`);--> statement-breakpoint
CREATE INDEX `lore_entries_order_idx` ON `lore_entries` (`order_index`);--> statement-breakpoint
-- Seed: wiki Dark Fantasy importado de github.com/ricardordrj/DarkFantasy
INSERT INTO `lore_categories` (`id`, `title`, `order_index`, `created_at`, `updated_at`) VALUES ('521551e8-b52e-419f-a589-c489fba260df', 'Visão Geral', 0, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_categories` (`id`, `title`, `order_index`, `created_at`, `updated_at`) VALUES ('c5777944-bc75-44ee-8fd0-66c118255f2e', 'Personagens', 1, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_categories` (`id`, `title`, `order_index`, `created_at`, `updated_at`) VALUES ('8024ecf8-07d5-4e20-8749-bae3887e9b24', 'Mundo', 2, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_categories` (`id`, `title`, `order_index`, `created_at`, `updated_at`) VALUES ('8cf90562-6f82-4453-be3c-31734c4a4d52', 'Facções', 3, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_categories` (`id`, `title`, `order_index`, `created_at`, `updated_at`) VALUES ('9202533d-117d-484b-a9bd-c870eacadc7d', 'Narrativa', 4, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_categories` (`id`, `title`, `order_index`, `created_at`, `updated_at`) VALUES ('b3b87d9a-b4f5-45de-944d-7db975411828', 'Referências', 5, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_entries` (`id`, `category_id`, `title`, `content`, `images_json`, `order_index`, `created_at`, `updated_at`) VALUES ('972a8eb5-f1b1-455f-923b-8d0957da9df1', '521551e8-b52e-419f-a589-c489fba260df', 'Véu Morto — Visão Geral', '# Véu Morto
Projeto conceitual de dark fantasy existencialista.

## Pilares do Projeto

- Horror existencial
- Violência como consequência social
- Decadência humana
- Humanidade residual
- Hollow emocional
- Religião como sobrevivência espiritual
- O abismo como vazio existencial

## Inspirações

- Berserk
- Dark Souls
- Bloodborne
- Existencialismo
- Horror cósmico
- Niilismo

## Objetivo Atual

Consolidar:
- identidade visual;
- filosofia;
- tom narrativo;
- personagens;
- e atmosfera.

Ainda NÃO estamos definindo:
- cronologia final;
- lore definitiva.', '[]', 0, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_entries` (`id`, `category_id`, `title`, `content`, `images_json`, `order_index`, `created_at`, `updated_at`) VALUES ('dfc91c95-1beb-4876-8e07-8560023a0525', 'c5777944-bc75-44ee-8fd0-66c118255f2e', 'Kael', '[[Kael]] não é herói.
Também não é um demônio.
Ele é o resultado inevitável de um mundo brutalizado além do limite.

## Antes da Queda

[[Kael]] era:
- humano;
- bondoso;
- introspectivo;
- e incapaz de aceitar a crueldade natural daquele mundo.

Ele presencia:
- guerras;
- fome;
- exploração religiosa;
- e violência cotidiana.

Tudo isso lentamente destrói sua humanidade.

## O Lamento Carmesim

[[Kael]] encontra uma foice oriunda do abismo.
Uma arma viva.
Todos os antigos portadores foram consumidos.

[[Kael]] sobrevive porque:
- não resiste;
- não tenta manter sanidade;
- e se entrega completamente ao vazio.

## O Hollow

[[Kael]] gradualmente perde:
- identidade;
- emoções humanas;
- memória;
- propósito.

Mas fragmentos residuais continuam existindo.
Exemplos:
- apego a objetos antigos;
- proteção instintiva;
- reações emocionais involuntárias;
- memórias incompletas.

## Conceito Filosófico

[[Kael]] é poderoso porque:
> não restou humanidade suficiente nele para o abismo destruir.', '["https://raw.githubusercontent.com/ricardordrj/DarkFantasy/master/arte/personagens/kael/concept-kael-1.png","https://raw.githubusercontent.com/ricardordrj/DarkFantasy/master/arte/personagens/kael/concept-kael-2.png"]', 0, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_entries` (`id`, `category_id`, `title`, `content`, `images_json`, `order_index`, `created_at`, `updated_at`) VALUES ('247443f4-96ad-496e-840f-fc2e263f1f11', '8024ecf8-07d5-4e20-8749-bae3887e9b24', 'Véu Morto', 'O [[Véu Morto]] é uma montanha colossal localizada no centro das Terras Silentes.
Durante séculos acreditou-se tratar de um vulcão adormecido.
Porém no topo da montanha não existe lava.
Existe apenas:
- um buraco;
- vazio absoluto;
- ausência de luz;
- e uma sensação constante de distorção.

O céu parece ser puxado para dentro dele.

## Interpretação Filosófica

O [[Véu Morto]] representa:
- vazio existencial;
- ausência divina;
- decadência inevitável;
- medo do desconhecido.

## Efeitos no Mundo

Próximo ao [[Véu Morto]]:
- criaturas deformadas surgem;
- pessoas enlouquecem;
- emoções violentas aumentam;
- sonhos se tornam perturbadores;
- e alguns indivíduos começam a perder identidade.', '["https://raw.githubusercontent.com/ricardordrj/DarkFantasy/master/arte/mundo/veu-morto-concept-1.png"]', 0, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_entries` (`id`, `category_id`, `title`, `content`, `images_json`, `order_index`, `created_at`, `updated_at`) VALUES ('bdda2afc-4e40-483e-a73d-fe6b60cb2ef0', '8024ecf8-07d5-4e20-8749-bae3887e9b24', 'O Abismo', 'O [[abismo]] NÃO é um inferno clássico.
Ele funciona como:
- vazio;
- dissolução de identidade;
- sofrimento acumulado;
- violência internalizada;
- e ausência de propósito.

## Funcionamento

O [[abismo]]:
- corrói emoções;
- amplifica impulsos violentos;
- enfraquece identidade;
- e altera percepção da realidade.

## Observações

O [[abismo]] não parece possuir moralidade.
Ele apenas existe.

## Teoria Inicial

Existe a possibilidade de que o [[abismo]] seja um reflexo do sofrimento acumulado da própria humanidade.', '[]', 1, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_entries` (`id`, `category_id`, `title`, `content`, `images_json`, `order_index`, `created_at`, `updated_at`) VALUES ('56e7e6ca-35da-423f-92bb-46223b23ca7e', '8cf90562-6f82-4453-be3c-31734c4a4d52', 'Igreja da Última Luz', 'Principal organização religiosa das Terras Silentes.
A igreja vende esperança para populações miseráveis.

## Estrutura

A organização possui:
- sacerdotes sinceros;
- inquisidores violentos;
- políticos religiosos;
- e líderes corruptos.

## Importante

A proposta NÃO é:
"religião = mal".

A fé existe porque:
- pessoas precisam acreditar em algo;
- o mundo é brutal demais;
- e esperança ainda possui valor emocional.

## Contradição Central

Mesmo dentro da corrupção:
- ainda existem indivíduos genuinamente bons.', '[]', 0, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_entries` (`id`, `category_id`, `title`, `content`, `images_json`, `order_index`, `created_at`, `updated_at`) VALUES ('75b5d2c4-d5f5-4303-bab2-20340ff6a3a5', '9202533d-117d-484b-a9bd-c870eacadc7d', 'Ato 1 — O Homem', '## Objetivo Narrativo

Mostrar:
- humanidade;
- cotidiano;
- relações pessoais;
- e decadência gradual do mundo.

## Eventos Base

- Introdução das Terras Silentes.
- Introdução da Igreja.
- Violência cotidiana.
- Pequenos momentos humanos.
- [[Kael]] ainda funcional emocionalmente.
- Primeiras menções ao Véu Morto.', '[]', 0, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_entries` (`id`, `category_id`, `title`, `content`, `images_json`, `order_index`, `created_at`, `updated_at`) VALUES ('61ddb7da-3689-4e8f-88be-cb5378c42999', '9202533d-117d-484b-a9bd-c870eacadc7d', 'Ato 2 — O Hollow', '## Objetivo Narrativo

Mostrar a dissolução gradual da identidade de [[Kael]].

## Eventos Base

- Encontro com o Lamento Carmesim.
- Contato profundo com o abismo.
- Violência crescente.
- Transformação física e emocional.
- [[Kael]] começa a ser temido.', '[]', 1, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_entries` (`id`, `category_id`, `title`, `content`, `images_json`, `order_index`, `created_at`, `updated_at`) VALUES ('7b497ac4-914d-4a48-87b3-24f732028f69', '9202533d-117d-484b-a9bd-c870eacadc7d', 'Ato 3 — O Presságio', '## Objetivo Narrativo

[[Kael]] deixa de ser homem e passa a funcionar como símbolo do colapso do mundo.

## Eventos Base

- Grandes guerras.
- Expansão do abismo.
- Religião entrando em crise.
- Povos desesperados.
- [[Kael]] cada vez mais vazio.
- Pequenos vislumbres residuais de humanidade.', '[]', 2, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_entries` (`id`, `category_id`, `title`, `content`, `images_json`, `order_index`, `created_at`, `updated_at`) VALUES ('a94a9c90-ed6e-40c5-a089-340b14e5c749', '9202533d-117d-484b-a9bd-c870eacadc7d', 'Finais Possíveis', '## Conceito Atual

[[Kael]] eventualmente recupera fragmentos de consciência.
Não como redenção completa.
Mas como:
- último ato humano;
- sacrifício silencioso;
- tentativa de impedir outro ciclo.

## Inspiração Temática

A ideia NÃO é:
- heroísmo clássico;
- vitória absoluta;
- final feliz.

E sim:
- melancolia;
- humanidade residual;
- tragédia;
- e continuidade.', '[]', 3, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_entries` (`id`, `category_id`, `title`, `content`, `images_json`, `order_index`, `created_at`, `updated_at`) VALUES ('9cbda487-3db7-4202-82f3-8621f5d6eef2', 'b3b87d9a-b4f5-45de-944d-7db975411828', 'Identidade Visual', '# Paleta

- preto úmido;
- ferrugem;
- vermelho coagulado;
- cinza pálido;
- fumaça branca.

## Arquitetura

- brutalismo medieval;
- estruturas opressivas;
- cidades em camadas;
- ferrugem;
- pedra desgastada.

## Criaturas

Evitar:
- demônio clássico;
- fantasia genérica.

Priorizar:
- distorção humana;
- vazio;
- corpos incompletos;
- horror existencial.', '[]', 0, 1784352064137, 1784352064137);
--> statement-breakpoint
INSERT INTO `lore_entries` (`id`, `category_id`, `title`, `content`, `images_json`, `order_index`, `created_at`, `updated_at`) VALUES ('c6d4b295-a828-45c8-96ef-96705517c8f6', 'b3b87d9a-b4f5-45de-944d-7db975411828', 'Inspirações', '## Filosofia

- Nietzsche
- Existencialismo
- Niilismo
- Horror cósmico

## Narrativa

- Berserk
- Dark Souls
- Bloodborne
- Gael
- Artorias

## Objetivo

Usar inspirações como:
- base filosófica;
- tom;
- estrutura emocional.

Evitar:
- copiar estética diretamente;
- repetir arquétipos sem adaptação;
- depender apenas de referência visual.', '[]', 1, 1784352064137, 1784352064137);
