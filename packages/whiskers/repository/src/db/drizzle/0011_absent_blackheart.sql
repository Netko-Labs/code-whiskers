ALTER TABLE "finding" ADD COLUMN "fingerprint" text;--> statement-breakpoint
ALTER TABLE "finding" ADD COLUMN "done_when" text;--> statement-breakpoint
ALTER TABLE "finding" ADD COLUMN "evidence" text;--> statement-breakpoint
ALTER TABLE "finding" ADD COLUMN "since_round" integer;--> statement-breakpoint
ALTER TABLE "finding" ADD COLUMN "thread_url" text;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "loop_verdict" text;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "round" integer;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "fixed_since_last_round" text[] DEFAULT '{}' NOT NULL;