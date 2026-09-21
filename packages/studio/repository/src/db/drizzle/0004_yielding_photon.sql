CREATE TABLE "triage_state" (
	"id" uuid PRIMARY KEY NOT NULL,
	"installation_id" bigint,
	"scope" text NOT NULL,
	"item_kind" text NOT NULL,
	"item_ref" text NOT NULL,
	"status" text NOT NULL,
	"assignee_user_id" text,
	"snoozed_until" timestamp,
	"note" text,
	"updated_by" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "triage_state" ADD CONSTRAINT "triage_state_assignee_user_id_user_id_fk" FOREIGN KEY ("assignee_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triage_state" ADD CONSTRAINT "triage_state_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "triage_state_item" ON "triage_state" USING btree ("scope","item_kind","item_ref");--> statement-breakpoint
CREATE INDEX "triage_state_scope" ON "triage_state" USING btree ("scope");