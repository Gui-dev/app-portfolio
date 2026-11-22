CREATE TYPE "public"."color_mode" AS ENUM('light', 'dark');--> statement-breakpoint
CREATE TYPE "public"."experience_kind" AS ENUM('formal', 'freelance', 'open-source', 'academic', 'volunteer');--> statement-breakpoint
CREATE TYPE "public"."monogram_style" AS ENUM('gradient', 'solid', 'outline');--> statement-breakpoint
CREATE TYPE "public"."template" AS ENUM('minimal', 'developer', 'modern');--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"kind" "experience_kind" DEFAULT 'formal' NOT NULL,
	"role" text NOT NULL,
	"company" text NOT NULL,
	"period" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"slug" text,
	"full_name" text,
	"headline" text,
	"bio" text,
	"location" text,
	"contact_email" text,
	"github_url" text,
	"linkedin_url" text,
	"monogram_style" "monogram_style" DEFAULT 'gradient' NOT NULL,
	"template" "template" DEFAULT 'modern' NOT NULL,
	"color_mode" "color_mode" DEFAULT 'dark' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"repo_url" text,
	"demo_url" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slug_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "slug_history_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slug_history" ADD CONSTRAINT "slug_history_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "experiences_profile_id_sort_order_idx" ON "experiences" USING btree ("profile_id","sort_order");--> statement-breakpoint
CREATE INDEX "projects_profile_id_sort_order_idx" ON "projects" USING btree ("profile_id","sort_order");--> statement-breakpoint
CREATE INDEX "skills_profile_id_sort_order_idx" ON "skills" USING btree ("profile_id","sort_order");--> statement-breakpoint
CREATE INDEX "slug_history_profile_id_idx" ON "slug_history" USING btree ("profile_id");