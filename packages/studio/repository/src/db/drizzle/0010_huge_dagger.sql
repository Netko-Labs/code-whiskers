CREATE TABLE "saved_query" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"section" text NOT NULL,
	"tab" integer DEFAULT 0 NOT NULL,
	"query" text,
	"service" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saved_query" ADD CONSTRAINT "saved_query_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "saved_query_user" ON "saved_query" USING btree ("user_id");