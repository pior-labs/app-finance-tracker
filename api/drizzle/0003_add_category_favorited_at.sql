ALTER TABLE `categories` ADD `favorited_at` integer;--> statement-breakpoint
UPDATE `categories` SET `favorited_at` = `created_at` WHERE `is_favorite` = 1;
