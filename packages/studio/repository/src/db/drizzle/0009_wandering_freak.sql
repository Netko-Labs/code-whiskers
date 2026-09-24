CREATE TABLE "alert_rule" (
	"id" uuid PRIMARY KEY NOT NULL,
	"installation_id" bigint NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"project_id" text,
	"threshold" integer DEFAULT 1 NOT NULL,
	"window_minutes" integer DEFAULT 5 NOT NULL,
	"state" text DEFAULT 'armed' NOT NULL,
	"last_fired_at" timestamp,
	"last_evaluated_at" timestamp,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_rule" ADD CONSTRAINT "alert_rule_installation_id_organization_installation_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."organization"("installation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_rule" ADD CONSTRAINT "alert_rule_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alert_rule_installation" ON "alert_rule" USING btree ("installation_id");