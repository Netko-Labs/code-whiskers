CREATE TABLE "alert_firing" (
	"id" uuid PRIMARY KEY NOT NULL,
	"rule_id" uuid NOT NULL,
	"installation_id" bigint NOT NULL,
	"trigger" text,
	"subject_kind" text,
	"subject_ref" text,
	"project_id" text,
	"title" text NOT NULL,
	"text" text NOT NULL,
	"url" text,
	"status" text NOT NULL,
	"deliveries" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_rule" ALTER COLUMN "kind" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_rule" ADD COLUMN "triggers" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_rule" ADD COLUMN "project_ids" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_rule" ADD COLUMN "environment" text;--> statement-breakpoint
ALTER TABLE "alert_rule" ADD COLUMN "min_level" text;--> statement-breakpoint
ALTER TABLE "alert_rule" ADD COLUMN "release" text;--> statement-breakpoint
ALTER TABLE "alert_rule" ADD COLUMN "notify_all" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_rule" ADD COLUMN "destination_ids" uuid[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_rule" ADD COLUMN "action_interval_minutes" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_rule" ADD COLUMN "default_for" text;--> statement-breakpoint
ALTER TABLE "alert_rule" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_firing" ADD CONSTRAINT "alert_firing_rule_id_alert_rule_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."alert_rule"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_firing" ADD CONSTRAINT "alert_firing_installation_id_organization_installation_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."organization"("installation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alert_firing_rule_created" ON "alert_firing" USING btree ("rule_id","created_at");--> statement-breakpoint
CREATE INDEX "alert_firing_installation_created" ON "alert_firing" USING btree ("installation_id","created_at");--> statement-breakpoint
CREATE INDEX "alert_firing_rule_subject" ON "alert_firing" USING btree ("rule_id","subject_ref","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "alert_rule_default_for" ON "alert_rule" USING btree ("installation_id","default_for");--> statement-breakpoint
UPDATE "alert_rule" SET "triggers" = ARRAY["kind"] WHERE "kind" IS NOT NULL AND cardinality("triggers") = 0;--> statement-breakpoint
UPDATE "alert_rule" SET "project_ids" = ARRAY["project_id"] WHERE "project_id" IS NOT NULL AND cardinality("project_ids") = 0;
