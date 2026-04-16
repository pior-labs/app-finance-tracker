ALTER TABLE `categories` RENAME COLUMN `user_defined` TO `is_default`;
--> statement-breakpoint
ALTER TABLE `categories` ADD COLUMN `created_at` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
UPDATE `categories`
SET `created_at` = CAST(strftime('%s', 'now') AS integer) * 1000,
    `is_default` = true
WHERE `created_at` = 0;
--> statement-breakpoint
ALTER TABLE `category_examples` ADD COLUMN `created_at` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
UPDATE `category_examples`
SET `created_at` = CAST(strftime('%s', 'now') AS integer) * 1000
WHERE `created_at` = 0;
--> statement-breakpoint
ALTER TABLE `statements` RENAME COLUMN `user_id` TO `uploaded_by`;
--> statement-breakpoint
ALTER TABLE `statements` RENAME COLUMN `upload_date` TO `created_at`;
--> statement-breakpoint
ALTER TABLE `statements` RENAME COLUMN `statement_period_start` TO `period_start`;
--> statement-breakpoint
ALTER TABLE `statements` RENAME COLUMN `statement_period_end` TO `period_end`;
--> statement-breakpoint
ALTER TABLE `statements` ADD COLUMN `original_filename` text NOT NULL DEFAULT '';
--> statement-breakpoint
UPDATE `statements` SET `original_filename` = `filename` WHERE `original_filename` = '';
--> statement-breakpoint
ALTER TABLE `transactions` RENAME TO `transactions__old`;
--> statement-breakpoint
CREATE TABLE `transactions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `statement_id` integer NOT NULL,
  `date` text NOT NULL,
  `description` text NOT NULL,
  `amount` integer NOT NULL,
  `type` text NOT NULL,
  `category_id` integer,
  `confidence_score` real,
  `status` text DEFAULT 'needs_review' NOT NULL,
  `categorized_by` text,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`statement_id`) REFERENCES `statements`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `transactions` (
  `id`,
  `statement_id`,
  `date`,
  `description`,
  `amount`,
  `type`,
  `category_id`,
  `confidence_score`,
  `status`,
  `categorized_by`,
  `created_at`
)
SELECT
  `id`,
  `statement_id`,
  `date`,
  `description`,
  CAST(ROUND(`amount` * 100) AS integer),
  `type`,
  `category_id`,
  `confidence_score`,
  `status`,
  CASE
    WHEN `status` = 'needs_review' AND `category_id` IS NULL THEN NULL
    ELSE `categorized_by`
  END,
  `created_at`
FROM `transactions__old`;
--> statement-breakpoint
DROP TABLE `transactions__old`;
