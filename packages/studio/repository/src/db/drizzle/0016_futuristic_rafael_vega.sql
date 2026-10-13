CREATE TABLE "memory_activity" (
	"id" uuid PRIMARY KEY NOT NULL,
	"installation_id" bigint NOT NULL,
	"note_id" uuid NOT NULL,
	"action" text NOT NULL,
	"actor_user_id" text,
	"actor_label" text,
	"before" jsonb,
	"after" jsonb,
	"undone_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_note" (
	"id" uuid PRIMARY KEY NOT NULL,
	"installation_id" bigint NOT NULL,
	"repository_id" bigint,
	"kind" text NOT NULL,
	"body" text NOT NULL,
	"paths" text[] DEFAULT '{}' NOT NULL,
	"source" text NOT NULL,
	"source_url" text,
	"author_user_id" text,
	"author_label" text,
	"status" text DEFAULT 'active' NOT NULL,
	"uses" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp,
	"search" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', "body")) STORED,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memory_activity" ADD CONSTRAINT "memory_activity_installation_id_organization_installation_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."organization"("installation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_activity" ADD CONSTRAINT "memory_activity_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_note" ADD CONSTRAINT "memory_note_installation_id_organization_installation_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."organization"("installation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_note" ADD CONSTRAINT "memory_note_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_note" ADD CONSTRAINT "memory_note_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "memory_activity_installation" ON "memory_activity" USING btree ("installation_id","created_at");--> statement-breakpoint
CREATE INDEX "memory_note_installation" ON "memory_note" USING btree ("installation_id","status");--> statement-breakpoint
CREATE INDEX "memory_note_repository" ON "memory_note" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "memory_note_search" ON "memory_note" USING gin ("search");--> statement-breakpoint
INSERT INTO "memory_note" ("id", "installation_id", "kind", "body", "paths", "source", "author_user_id", "status", "created_at", "updated_at")
SELECT "id", "installation_id",
	CASE "effect" WHEN 'blocker' THEN 'rule' WHEN 'filter' THEN 'dont_flag' ELSE 'preference' END,
	"body",
	CASE WHEN "scope" IN ('**', '*') THEN '{}'::text[] ELSE ARRAY["scope"] END,
	'human', "author_user_id",
	CASE WHEN "is_muted" THEN 'retired' ELSE 'active' END,
	"created_at", "updated_at"
FROM "review_rule";
