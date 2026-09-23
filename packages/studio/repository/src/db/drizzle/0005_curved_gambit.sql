CREATE TABLE "triage_comment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"scope" text NOT NULL,
	"item_kind" text NOT NULL,
	"item_ref" text NOT NULL,
	"author_user_id" text,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "triage_comment" ADD CONSTRAINT "triage_comment_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "triage_comment_item" ON "triage_comment" USING btree ("scope","item_kind","item_ref","created_at");