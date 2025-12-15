PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_radar_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`source` text NOT NULL,
	`source_name` text NOT NULL,
	`category` text NOT NULL,
	`summary` text NOT NULL,
	`image` text,
	`url` text NOT NULL,
	`timestamp` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`source`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_radar_items`("id", "title", "source", "source_name", "category", "summary", "image", "url", "timestamp", "created_at", "updated_at") SELECT "id", "title", "source", "source_name", "category", "summary", "image", "url", "timestamp", "created_at", "updated_at" FROM `radar_items`;--> statement-breakpoint
DROP TABLE `radar_items`;--> statement-breakpoint
ALTER TABLE `__new_radar_items` RENAME TO `radar_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;