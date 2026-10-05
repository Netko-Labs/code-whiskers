ALTER TABLE "issue" ALTER COLUMN "status" SET DEFAULT 'unresolved';--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "user_key" text;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "resolved_in_release" text;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "resolved_at" timestamp;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "archived_until" timestamp;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "archive_until_events" integer;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "archive_until_users" integer;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "regressed_at" timestamp;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "user_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "last_release" text;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "culprit" text;--> statement-breakpoint
-- `open` was never written as anything else: every existing issue starts unresolved, and studio's
-- reconcile sweep pushes the decisions humans already made.
UPDATE "issue" SET "status" = 'unresolved' WHERE "status" NOT IN ('unresolved', 'resolved', 'archived');--> statement-breakpoint
-- bun-sql stored payloads as jsonb strings; `#>> '{}'` unwraps those. Mirrors `userKeyOf`.
WITH "keyed" AS (
	SELECT "id", coalesce(
		nullif("p"->'user'->>'id', ''),
		nullif("p"->'user'->>'email', ''),
		nullif(nullif("p"->'user'->>'ip_address', ''), '{{auto}}')
	) AS "raw"
	FROM (
		SELECT "id", CASE WHEN jsonb_typeof("payload") = 'string' THEN ("payload" #>> '{}')::jsonb ELSE "payload" END AS "p"
		FROM "event"
	) "e"
	WHERE jsonb_typeof("p"->'user') = 'object'
)
UPDATE "event" SET "user_key" = encode(sha256(convert_to("keyed"."raw", 'UTF8')), 'hex')
FROM "keyed" WHERE "event"."id" = "keyed"."id" AND "keyed"."raw" IS NOT NULL;--> statement-breakpoint
UPDATE "issue" SET "user_count" = "u"."n"
FROM (
	SELECT "issue_id", count(DISTINCT "user_key")::int AS "n" FROM "event"
	WHERE "user_key" IS NOT NULL GROUP BY "issue_id"
) "u"
WHERE "issue"."id" = "u"."issue_id";--> statement-breakpoint
UPDATE "issue" SET "last_release" = "l"."release"
FROM (
	SELECT DISTINCT ON ("issue_id") "issue_id", "release" FROM "event"
	WHERE "release" IS NOT NULL ORDER BY "issue_id", "received_at" DESC
) "l"
WHERE "issue"."id" = "l"."issue_id";--> statement-breakpoint
-- Mirrors `culpritOf`: the last in-app frame of the thrown exception in the newest event.
WITH "latest" AS (
	SELECT DISTINCT ON ("issue_id") "issue_id",
		CASE WHEN jsonb_typeof("payload") = 'string' THEN ("payload" #>> '{}')::jsonb ELSE "payload" END AS "p"
	FROM "event" ORDER BY "issue_id", "received_at" DESC
), "thrown" AS (
	SELECT "issue_id", (CASE WHEN jsonb_typeof("p"->'exception') = 'array' THEN "p"->'exception' ELSE "p"->'exception'->'values' END)->-1->'stacktrace'->'frames' AS "frames"
	FROM "latest"
), "top" AS (
	SELECT DISTINCT ON ("issue_id") "issue_id",
		coalesce("f"."frame"->>'module', "f"."frame"->>'filename', "f"."frame"->>'abs_path') AS "file",
		"f"."frame"->>'function' AS "fn"
	FROM "thrown",
		jsonb_array_elements(CASE WHEN jsonb_typeof("frames") = 'array' THEN "frames" ELSE '[]'::jsonb END) WITH ORDINALITY AS "f"("frame", "n")
	WHERE jsonb_typeof("f"."frame") = 'object'
		AND coalesce("f"."frame"->>'in_app', '') <> 'false'
		AND coalesce("f"."frame"->>'filename', '') NOT LIKE '%node_modules%'
	ORDER BY "issue_id", "f"."n" DESC
)
UPDATE "issue" SET "culprit" = coalesce("top"."file", '') || ':' || coalesce("top"."fn", '')
FROM "top" WHERE "issue"."id" = "top"."issue_id" AND ("top"."file" IS NOT NULL OR "top"."fn" IS NOT NULL);--> statement-breakpoint
CREATE INDEX "event_issue_received" ON "event" USING btree ("issue_id","received_at");--> statement-breakpoint
CREATE INDEX "event_issue_user" ON "event" USING btree ("issue_id","user_key");--> statement-breakpoint
CREATE INDEX "event_project_release" ON "event" USING btree ("project_id","release","received_at");--> statement-breakpoint
CREATE INDEX "issue_project_status_last_seen" ON "issue" USING btree ("project_id","status","last_seen");
