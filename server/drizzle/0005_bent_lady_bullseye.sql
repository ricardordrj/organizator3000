CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`category` text NOT NULL,
	`kind` text NOT NULL,
	`due_day` integer NOT NULL,
	`last_paid_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `expenses_category_idx` ON `expenses` (`category`);--> statement-breakpoint
CREATE TABLE `savings_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`target_cents` integer NOT NULL,
	`current_cents` integer DEFAULT 0 NOT NULL,
	`deadline` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
