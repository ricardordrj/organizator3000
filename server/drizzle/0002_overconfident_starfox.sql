CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `people_name_unique` ON `people` (`name`);--> statement-breakpoint
ALTER TABLE `tasks` ADD `assignee_id` text REFERENCES people(id);--> statement-breakpoint
ALTER TABLE `tasks` ADD `reporter_id` text REFERENCES people(id);