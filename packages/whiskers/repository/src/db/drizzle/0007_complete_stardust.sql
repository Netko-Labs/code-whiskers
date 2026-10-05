CREATE SEQUENCE "public"."project_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "project_key" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"public_key" text NOT NULL,
	"label" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"last_used_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "public_key" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_key" ADD CONSTRAINT "project_key_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_key_public_key" ON "project_key" USING btree ("public_key");--> statement-breakpoint
CREATE INDEX "project_key_project" ON "project_key" USING btree ("project_id");;--> statement-breakpoint
-- Each project's single key becomes its first client key. Skips projects that already have one and
-- keys already taken (two dev self-provisioned projects could share an SDK's key).
INSERT INTO "project_key" ("id", "project_id", "public_key", "label", "is_enabled", "created_at")
SELECT gen_random_uuid(), "p"."id", "p"."public_key", 'Default', true, "p"."created_at"
FROM "project" "p"
WHERE "p"."public_key" IS NOT NULL
	AND NOT EXISTS (SELECT 1 FROM "project_key" "k" WHERE "k"."project_id" = "p"."id")
ON CONFLICT ("public_key") DO NOTHING;--> statement-breakpoint
-- A project whose key lost that conflict still needs one that ingests: mint a fresh key from
-- gen_random_uuid (a CSPRNG), 32 hex like newPublicKey.
INSERT INTO "project_key" ("id", "project_id", "public_key", "label", "is_enabled", "created_at")
SELECT gen_random_uuid(), "p"."id", replace(gen_random_uuid()::text, '-', ''), 'Default', true, now()
FROM "project" "p"
WHERE NOT EXISTS (SELECT 1 FROM "project_key" "k" WHERE "k"."project_id" = "p"."id");--> statement-breakpoint
-- Ids were max + 1; the sequence starts past every numeric id already handed out.
SELECT setval('"public"."project_id_seq"', coalesce((SELECT max("id"::bigint) FROM "project" WHERE "id" ~ '^[0-9]+$'), 0) + 1, false);
