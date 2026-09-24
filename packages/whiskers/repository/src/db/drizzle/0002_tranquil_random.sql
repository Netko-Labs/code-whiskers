CREATE TABLE "log_line" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"service" text NOT NULL,
	"level" text NOT NULL,
	"severity" integer DEFAULT 0 NOT NULL,
	"message" text NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"trace_id" text,
	"span_id" text,
	"timestamp" timestamp NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "span" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"trace_id" text NOT NULL,
	"span_id" text NOT NULL,
	"parent_span_id" text,
	"service" text NOT NULL,
	"name" text NOT NULL,
	"kind" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'unset' NOT NULL,
	"start_time" timestamp NOT NULL,
	"duration_ms" double precision NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "log_line" ADD CONSTRAINT "log_line_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "span" ADD CONSTRAINT "span_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "log_line_timestamp_brin" ON "log_line" USING brin ("timestamp");--> statement-breakpoint
CREATE INDEX "log_line_service" ON "log_line" USING btree ("service");--> statement-breakpoint
CREATE INDEX "span_start_time_brin" ON "span" USING brin ("start_time");--> statement-breakpoint
CREATE INDEX "span_trace" ON "span" USING btree ("trace_id");--> statement-breakpoint
CREATE INDEX "span_service" ON "span" USING btree ("service");