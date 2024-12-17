CREATE TABLE `oauth_account` (
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`provider`, `provider_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_account_provider_user_id_unique` ON `oauth_account` (`provider_user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
