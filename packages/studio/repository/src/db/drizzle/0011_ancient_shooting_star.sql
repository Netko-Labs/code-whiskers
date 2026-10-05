CREATE TABLE "triage_activity" (
	"id" uuid PRIMARY KEY NOT NULL,
	"scope" text NOT NULL,
	"item_kind" text NOT NULL,
	"item_ref" text NOT NULL,
	"kind" text NOT NULL,
	"actor_user_id" text,
	"data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "triage_state" ADD COLUMN "resolve_mode" text;--> statement-breakpoint
ALTER TABLE "triage_state" ADD COLUMN "archive_mode" text;--> statement-breakpoint
ALTER TABLE "triage_state" ADD COLUMN "archive_value" text;--> statement-breakpoint
ALTER TABLE "triage_state" ADD COLUMN "mirrored_at" timestamp;--> statement-breakpoint
ALTER TABLE "triage_activity" ADD CONSTRAINT "triage_activity_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "triage_activity_item" ON "triage_activity" USING btree ("scope","item_kind","item_ref","created_at");--> statement-breakpoint
-- Issues are archived now, not snoozed. A snooze that already ran out is open again; the rest keep
-- their wake-up time. `mirrored_at` stays null so the reconcile sweep pushes them to whiskers.
UPDATE "triage_state" SET
	"status" = CASE WHEN "snoozed_until" IS NULL OR "snoozed_until" > (now() AT TIME ZONE 'utc') THEN 'archived' ELSE 'open' END,
	"archive_mode" = CASE
		WHEN "snoozed_until" IS NULL THEN 'forever'
		WHEN "snoozed_until" > (now() AT TIME ZONE 'utc') THEN 'until'
	END,
	"archive_value" = CASE
		WHEN "snoozed_until" > (now() AT TIME ZONE 'utc') THEN to_char("snoozed_until", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
	END
WHERE "item_kind" = 'issue' AND "status" = 'snoozed';
