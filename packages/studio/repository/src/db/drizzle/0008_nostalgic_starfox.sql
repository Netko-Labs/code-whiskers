CREATE TABLE "integration" (
	"id" uuid PRIMARY KEY NOT NULL,
	"installation_id" bigint NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"url_encrypted" text NOT NULL,
	"url_host" text NOT NULL,
	"created_by" text,
	"last_delivered_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "integration" ADD CONSTRAINT "integration_installation_id_organization_installation_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."organization"("installation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration" ADD CONSTRAINT "integration_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "integration_installation" ON "integration" USING btree ("installation_id");