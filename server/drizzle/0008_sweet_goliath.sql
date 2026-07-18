CREATE TABLE `upgrade_items` (
	`id` text PRIMARY KEY NOT NULL,
	`phase_id` text NOT NULL,
	`title` text NOT NULL,
	`notes` text,
	`price_cents` integer,
	`is_done` integer DEFAULT false NOT NULL,
	`order_index` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`phase_id`) REFERENCES `upgrade_phases`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `upgrade_items_phase_idx` ON `upgrade_items` (`phase_id`);--> statement-breakpoint
CREATE INDEX `upgrade_items_order_idx` ON `upgrade_items` (`order_index`);--> statement-breakpoint
CREATE TABLE `upgrade_phases` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`order_index` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `upgrade_phases_order_idx` ON `upgrade_phases` (`order_index`);
--> statement-breakpoint
-- Seed: plano de upgrade importado de UpgradePC.md
INSERT INTO `upgrade_phases` (`id`, `title`, `order_index`, `created_at`, `updated_at`) VALUES ('2d838fb3-a254-4f5e-b860-d39c139541b5', 'Fase 1: Segurança e Estabilidade (Energia)', 0, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_phases` (`id`, `title`, `order_index`, `created_at`, `updated_at`) VALUES ('68eacc54-0bf2-49a1-bbd6-ace16063dbb1', 'Fase 2: O Salto de Performance (CPU)', 1, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_phases` (`id`, `title`, `order_index`, `created_at`, `updated_at`) VALUES ('0150d21c-c929-4a72-ad58-4c5c58d38fe9', 'Fase 3: Organização de Storage e Dual Boot (Fresh Start)', 2, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_phases` (`id`, `title`, `order_index`, `created_at`, `updated_at`) VALUES ('03e120d6-1e5d-4f54-8ad0-d5bd99b1082d', 'Fase 4: Expansão de Conectividade (Placa-mãe)', 3, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_phases` (`id`, `title`, `order_index`, `created_at`, `updated_at`) VALUES ('515712cd-3eed-49fa-bdc2-dfff4142d7ea', 'Fase 5: Upgrade Final de Storage', 4, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('dc5109e1-eddb-4b8d-a549-9589c4abf374', '2d838fb3-a254-4f5e-b860-d39c139541b5', 'Comprar Fonte MSI MAG A650BN 650W', NULL, 33000, false, 0, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('8fbb3608-622a-4a24-b023-c9361450df90', '2d838fb3-a254-4f5e-b860-d39c139541b5', 'Instalação profissional + Limpeza interna (Loja)', NULL, NULL, false, 1, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('0b691895-06a2-4116-8f0d-1aeb671f8db0', '2d838fb3-a254-4f5e-b860-d39c139541b5', 'Validar selo de garantia e organização dos cabos', NULL, NULL, false, 2, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('8e7ef749-2b22-425e-89fe-9367f5d2032a', '68eacc54-0bf2-49a1-bbd6-ace16063dbb1', 'Comprar Processador AMD Ryzen 7 5700X', NULL, 115000, false, 0, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('f3aca92c-561b-45a6-a851-28305feccfc2', '68eacc54-0bf2-49a1-bbd6-ace16063dbb1', 'Comprar Air Cooler DeepCool AK400', NULL, 16000, false, 1, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('da4fc680-da50-45ef-9838-10f0cc98aaac', '68eacc54-0bf2-49a1-bbd6-ace16063dbb1', 'Atenção Loja: Atualizar BIOS da B450M (F60+) antes da troca física', NULL, NULL, false, 2, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('42d7c1da-ab5c-40f4-a0ac-81a8c0a0f194', '68eacc54-0bf2-49a1-bbd6-ace16063dbb1', 'Instalar novo CPU + Cooler com pasta térmica de qualidade', NULL, NULL, false, 3, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('1d96b123-b116-47ed-892a-9f957dbdffdb', '68eacc54-0bf2-49a1-bbd6-ace16063dbb1', 'Ativar XMP/DOCP na BIOS para memórias rodarem a 3200MHz', NULL, NULL, false, 4, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('f2b1acb2-de83-4ead-94b5-285d8e53c038', '0150d21c-c929-4a72-ad58-4c5c58d38fe9', 'Backup do acervo de fotos para o HD de 2TB', NULL, NULL, false, 0, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('c30b0eac-ed58-4376-9404-449c2e5bf4a3', '0150d21c-c929-4a72-ad58-4c5c58d38fe9', 'Loja: Formatação limpa do Windows no SSD NVMe 1TB', NULL, NULL, false, 1, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('d9aabcd0-6678-4de3-990b-296a0583540f', '0150d21c-c929-4a72-ad58-4c5c58d38fe9', 'Loja: Instalação do Ubuntu no SSD SATA 120GB (Dev Mode)', NULL, NULL, false, 2, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('f9fd3757-666f-42ac-bd68-f6d752e18540', '0150d21c-c929-4a72-ad58-4c5c58d38fe9', 'Configurar GRUB para Dual Boot entre drives físicos distintos', NULL, NULL, false, 3, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('06a537f6-a925-4927-9bdc-5523e5786ee4', '03e120d6-1e5d-4f54-8ad0-d5bd99b1082d', 'Comprar Placa-mãe MSI B550M Pro-VDH WiFi', NULL, 85000, false, 0, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('72427b7c-2836-490c-a474-dc4b0199f01e', '03e120d6-1e5d-4f54-8ad0-d5bd99b1082d', 'Migrar componentes (Ganho de 2º slot NVMe e PCIe 4.0)', NULL, NULL, false, 1, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('b67e0d5a-c1dc-4d42-8fb5-eb02f8bc925e', '515712cd-3eed-49fa-bdc2-dfff4142d7ea', 'Comprar Novo SSD NVMe 1TB (Ex: Kingston NV3)', NULL, 42000, false, 0, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('adfe2077-3460-4a94-b491-070130bfbe23', '515712cd-3eed-49fa-bdc2-dfff4142d7ea', 'Instalar no slot M.2 secundário da B550', NULL, NULL, false, 1, 1784331867844, 1784331867844);
--> statement-breakpoint
INSERT INTO `upgrade_items` (`id`, `phase_id`, `title`, `notes`, `price_cents`, `is_done`, `order_index`, `created_at`, `updated_at`) VALUES ('38c5a911-9e3a-401f-8d0f-7e2ec92b861d', '515712cd-3eed-49fa-bdc2-dfff4142d7ea', 'Transferir Ubuntu do SSD SATA para este novo NVMe (Opcional)', NULL, NULL, false, 2, 1784331867844, 1784331867844);