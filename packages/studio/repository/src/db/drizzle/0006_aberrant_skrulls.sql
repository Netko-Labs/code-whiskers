CREATE TABLE "review_rule" (
	"id" uuid PRIMARY KEY NOT NULL,
	"installation_id" bigint NOT NULL,
	"body" text NOT NULL,
	"scope" text DEFAULT '**' NOT NULL,
	"effect" text NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"author_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "review_rule" ADD CONSTRAINT "review_rule_installation_id_organization_installation_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."organization"("installation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_rule" ADD CONSTRAINT "review_rule_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "review_rule_installation" ON "review_rule" USING btree ("installation_id");