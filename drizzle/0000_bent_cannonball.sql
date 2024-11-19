CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comment` text NOT NULL,
	`slug` text NOT NULL,
	`authorId` text NOT NULL,
	`taskId` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`taskId`) REFERENCES `tasks`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `slug_idx` ON `comments` (`slug`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`owner_id` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `slug_idx` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`owner_id` text NOT NULL,
	`project_id` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `slug_idx` ON `tasks` (`slug`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`hash` text NOT NULL,
	`salt` text NOT NULL,
	`created_at` integer
);
