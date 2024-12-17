PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_oauth_account` (
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`user_id` integer NOT NULL,
	PRIMARY KEY(`provider`, `provider_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oauth_account`("provider", "provider_user_id", "user_id") SELECT "provider", "provider_user_id", "user_id" FROM `oauth_account`;--> statement-breakpoint
DROP TABLE `oauth_account`;--> statement-breakpoint
ALTER TABLE `__new_oauth_account` RENAME TO `oauth_account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_account_provider_user_id_unique` ON `oauth_account` (`provider_user_id`);--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "user_id", "expires_at") SELECT "id", "user_id", "expires_at" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `googleId`;