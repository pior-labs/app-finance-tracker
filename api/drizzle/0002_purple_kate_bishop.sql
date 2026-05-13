ALTER TABLE `categories` ADD `color` text DEFAULT '#6b8db5' NOT NULL;--> statement-breakpoint
UPDATE `categories`
SET `color` = CASE ((`id` - 1) % 7)
  WHEN 0 THEN '#c96442'
  WHEN 1 THEN '#5b8a5a'
  WHEN 2 THEN '#6b8db5'
  WHEN 3 THEN '#a87cc4'
  WHEN 4 THEN '#d4a55a'
  WHEN 5 THEN '#e2738a'
  ELSE '#7ec1c1'
END;
