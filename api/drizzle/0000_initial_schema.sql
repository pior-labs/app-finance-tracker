CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `password_hash` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

--> statement-breakpoint
CREATE TABLE `categories` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `description` text NOT NULL,
  `keywords` text NOT NULL,
  `is_default` integer DEFAULT true NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);

--> statement-breakpoint
CREATE TABLE `statements` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `uploaded_by` integer NOT NULL,
  `filename` text NOT NULL,
  `original_filename` text NOT NULL,
  `institution` text,
  `period_start` text,
  `period_end` text,
  `raw_text` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

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
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`statement_id`) REFERENCES `statements`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
CREATE TABLE `category_examples` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `category_id` integer NOT NULL,
  `transaction_description` text NOT NULL,
  `notes` text,
  `source` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
