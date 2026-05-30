CREATE INDEX `statements_created_at_idx` ON `statements` (`created_at`);--> statement-breakpoint
CREATE INDEX `transactions_status_date_id_idx` ON `transactions` (`status`,`date`,`id`);--> statement-breakpoint
CREATE INDEX `transactions_date_id_idx` ON `transactions` (`date`,`id`);--> statement-breakpoint
CREATE INDEX `transactions_date_merchant_idx` ON `transactions` (`date`,`merchant`);--> statement-breakpoint
CREATE INDEX `transactions_statement_id_idx` ON `transactions` (`statement_id`);--> statement-breakpoint
CREATE INDEX `transactions_category_id_idx` ON `transactions` (`category_id`);
