CREATE TABLE `shopping_items` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`title` text NOT NULL,
	`notes` text,
	`price_cents` integer,
	`urgency` text DEFAULT 'media' NOT NULL,
	`is_done` integer DEFAULT false NOT NULL,
	`order_index` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `shopping_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `shopping_items_profile_idx` ON `shopping_items` (`profile_id`);--> statement-breakpoint
CREATE INDEX `shopping_items_order_idx` ON `shopping_items` (`order_index`);--> statement-breakpoint
CREATE INDEX `shopping_items_urgency_idx` ON `shopping_items` (`urgency`);--> statement-breakpoint
CREATE TABLE `shopping_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
-- Seed: perfis padrão por modalidade de compra
INSERT INTO `shopping_profiles` (`id`, `name`, `created_at`, `updated_at`) VALUES ('5df939da-c863-42de-8874-3fa8774ecda8', 'Peças', 1784386376635, 1784386376635);
--> statement-breakpoint
INSERT INTO `shopping_profiles` (`id`, `name`, `created_at`, `updated_at`) VALUES ('27d42944-92a8-4f4b-a501-7065e987e6cd', 'Utensílios domésticos', 1784386376635, 1784386376635);
--> statement-breakpoint
INSERT INTO `shopping_profiles` (`id`, `name`, `created_at`, `updated_at`) VALUES ('892dc476-51dd-44c3-bb33-c2267bdc5b0d', 'Roupas', 1784386376635, 1784386376635);
--> statement-breakpoint
INSERT INTO `shopping_profiles` (`id`, `name`, `created_at`, `updated_at`) VALUES ('5d1a2e2f-b3a7-4a90-aa5d-4e6a1987b078', 'Produtos', 1784386376635, 1784386376635);
--> statement-breakpoint
ALTER TABLE `lore_categories` ADD `kind` text DEFAULT 'dark_fantasy' NOT NULL;--> statement-breakpoint
CREATE INDEX `lore_categories_kind_idx` ON `lore_categories` (`kind`);