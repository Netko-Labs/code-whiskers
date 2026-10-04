-- Retried envelopes stored the same event twice: keep the earliest copy and undo the extra counts.
WITH "duplicate" AS (
	DELETE FROM "event" "later" USING "event" "earlier"
	WHERE "later"."project_id" = "earlier"."project_id"
		AND "later"."event_id" = "earlier"."event_id"
		AND ("later"."received_at", "later"."id") > ("earlier"."received_at", "earlier"."id")
	RETURNING "later"."id", "later"."issue_id"
), "removed" AS (
	SELECT "issue_id", count(DISTINCT "id") AS "n" FROM "duplicate" GROUP BY "issue_id"
)
UPDATE "issue" SET "event_count" = greatest("issue"."event_count" - "removed"."n", 0)
FROM "removed" WHERE "issue"."id" = "removed"."issue_id";--> statement-breakpoint
CREATE UNIQUE INDEX "event_project_event_id" ON "event" USING btree ("project_id","event_id");
