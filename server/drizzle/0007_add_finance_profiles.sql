-- Custom SQL migration file, put your code below! --
CREATE TABLE `finance_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `finance_profiles` (`id`, `name`, `created_at`, `updated_at`) VALUES ('aac0e1a8-967d-4fd4-bee2-2de3f2e89796', 'Ricardo', 1784217821499, 1784217821499);
--> statement-breakpoint
INSERT INTO `finance_profiles` (`id`, `name`, `created_at`, `updated_at`) VALUES ('9fb2e5d6-181b-4ec9-b8fa-bb4bc08a5b30', 'Mãe', 1784217821499, 1784217821499);
--> statement-breakpoint
ALTER TABLE `expenses` ADD `profile_id` text NOT NULL REFERENCES finance_profiles(id) DEFAULT 'aac0e1a8-967d-4fd4-bee2-2de3f2e89796';
--> statement-breakpoint
CREATE INDEX `expenses_profile_idx` ON `expenses` (`profile_id`);
--> statement-breakpoint
ALTER TABLE `incomes` ADD `profile_id` text NOT NULL REFERENCES finance_profiles(id) DEFAULT 'aac0e1a8-967d-4fd4-bee2-2de3f2e89796';
--> statement-breakpoint
CREATE INDEX `incomes_profile_idx` ON `incomes` (`profile_id`);
--> statement-breakpoint
ALTER TABLE `meal_voucher_purchases` ADD `profile_id` text NOT NULL REFERENCES finance_profiles(id) DEFAULT 'aac0e1a8-967d-4fd4-bee2-2de3f2e89796';
--> statement-breakpoint
CREATE INDEX `meal_voucher_purchases_profile_idx` ON `meal_voucher_purchases` (`profile_id`);
--> statement-breakpoint
ALTER TABLE `savings_goals` ADD `profile_id` text NOT NULL REFERENCES finance_profiles(id) DEFAULT 'aac0e1a8-967d-4fd4-bee2-2de3f2e89796';
--> statement-breakpoint
CREATE INDEX `savings_goals_profile_idx` ON `savings_goals` (`profile_id`);
