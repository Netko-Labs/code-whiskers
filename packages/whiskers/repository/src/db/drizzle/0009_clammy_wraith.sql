CREATE TABLE "deploy" (
	"id" uuid PRIMARY KEY NOT NULL,
	"release_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"deployed_at" timestamp NOT NULL,
	"url" text,
	"name" text
);
--> statement-breakpoint
CREATE TABLE "release_commit" (
	"release_id" uuid NOT NULL,
	"sha" text NOT NULL,
	"message" text NOT NULL,
	"author_name" text NOT NULL,
	"author_login" text,
	"author_avatar" text,
	"committed_at" timestamp NOT NULL,
	"pr_number" integer,
	"files" jsonb NOT NULL,
	CONSTRAINT "release_commit_release_id_sha_pk" PRIMARY KEY("release_id","sha")
);
--> statement-breakpoint
CREATE TABLE "release" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"version" text NOT NULL,
	"repository" text,
	"commit_sha" text,
	"first_seen" timestamp NOT NULL,
	"last_seen" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"commits_synced_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "deploy" ADD CONSTRAINT "deploy_release_id_release_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."release"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "release_commit" ADD CONSTRAINT "release_commit_release_id_release_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."release"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "release" ADD CONSTRAINT "release_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deploy_release_deployed" ON "deploy" USING btree ("release_id","deployed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "release_project_version" ON "release" USING btree ("project_id","version");--> statement-breakpoint
CREATE INDEX "release_project_first_seen" ON "release" USING btree ("project_id","first_seen");--> statement-breakpoint
-- Every release events already carry becomes a row, in one grouped pass; a rerun changes nothing.
INSERT INTO "release" ("id", "project_id", "version", "first_seen", "last_seen", "created_at")
SELECT gen_random_uuid(), "project_id", "release", min("received_at"), max("received_at"), now()
FROM "event"
WHERE "release" IS NOT NULL
GROUP BY "project_id", "release"
ON CONFLICT ("project_id", "version") DO NOTHING;