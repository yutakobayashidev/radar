CREATE TABLE `radar_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`source` text NOT NULL,
	`source_name` text NOT NULL,
	`domain` text NOT NULL,
	`category` text NOT NULL,
	`summary` text NOT NULL,
	`image` text NOT NULL,
	`url` text NOT NULL,
	`timestamp` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`source`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`domain` text NOT NULL,
	`url` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`article_count` integer DEFAULT 0 NOT NULL,
	`last_updated` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
