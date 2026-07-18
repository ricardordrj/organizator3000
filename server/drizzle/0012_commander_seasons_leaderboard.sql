CREATE TABLE `commander_seasons` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `commander_seasons_status_idx` ON `commander_seasons` (`status`);--> statement-breakpoint
ALTER TABLE `commander_game_players` ADD `placement` integer;--> statement-breakpoint
ALTER TABLE `commander_games` ADD `season_id` text REFERENCES commander_seasons(id);--> statement-breakpoint
CREATE INDEX `commander_games_season_idx` ON `commander_games` (`season_id`);