import { relations, sql } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const templateEnum = pgEnum("template", ["minimal", "developer", "modern"]);
export const colorModeEnum = pgEnum("color_mode", ["light", "dark"]);
export const monogramStyleEnum = pgEnum("monogram_style", ["gradient", "solid", "outline"]);
export const experienceKindEnum = pgEnum("experience_kind", [
	"formal",
	"freelance",
	"open-source",
	"academic",
	"volunteer",
]);

export const profiles = pgTable("profiles", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull().unique(),
	slug: text("slug").unique(),
	fullName: text("full_name"),
	headline: text("headline"),
	bio: text("bio"),
	location: text("location"),
	contactEmail: text("contact_email"),
	githubUrl: text("github_url"),
	linkedinUrl: text("linkedin_url"),
	monogramStyle: monogramStyleEnum("monogram_style").notNull().default("gradient"),
	template: templateEnum("template").notNull().default("modern"),
	colorMode: colorModeEnum("color_mode").notNull().default("dark"),
	isPublished: boolean("is_published").notNull().default(false),
	publishedAt: timestamp("published_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const experiences = pgTable(
	"experiences",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		profileId: uuid("profile_id")
			.notNull()
			.references(() => profiles.id, { onDelete: "cascade" }),
		kind: experienceKindEnum("kind").notNull().default("formal"),
		role: text("role").notNull(),
		company: text("company").notNull(),
		period: text("period").notNull(),
		description: text("description").notNull(),
		sortOrder: integer("sort_order").notNull().default(0),
	},
	(table) => [index("experiences_profile_id_sort_order_idx").on(table.profileId, table.sortOrder)],
);

export const projects = pgTable(
	"projects",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		profileId: uuid("profile_id")
			.notNull()
			.references(() => profiles.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		description: text("description").notNull(),
		repoUrl: text("repo_url"),
		demoUrl: text("demo_url"),
		tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
		sortOrder: integer("sort_order").notNull().default(0),
	},
	(table) => [index("projects_profile_id_sort_order_idx").on(table.profileId, table.sortOrder)],
);

export const skills = pgTable(
	"skills",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		profileId: uuid("profile_id")
			.notNull()
			.references(() => profiles.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		sortOrder: integer("sort_order").notNull().default(0),
	},
	(table) => [index("skills_profile_id_sort_order_idx").on(table.profileId, table.sortOrder)],
);

export const slugHistory = pgTable(
	"slug_history",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		profileId: uuid("profile_id")
			.notNull()
			.references(() => profiles.id, { onDelete: "cascade" }),
		slug: text("slug").notNull().unique(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [index("slug_history_profile_id_idx").on(table.profileId)],
);

export const profilesRelations = relations(profiles, ({ many }) => ({
	experiences: many(experiences),
	projects: many(projects),
	skills: many(skills),
}));

export const experiencesRelations = relations(experiences, ({ one }) => ({
	profile: one(profiles, {
		fields: [experiences.profileId],
		references: [profiles.id],
	}),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
	profile: one(profiles, {
		fields: [projects.profileId],
		references: [profiles.id],
	}),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
	profile: one(profiles, {
		fields: [skills.profileId],
		references: [profiles.id],
	}),
}));

export const slugHistoryRelations = relations(slugHistory, ({ one }) => ({
	profile: one(profiles, {
		fields: [slugHistory.profileId],
		references: [profiles.id],
	}),
}));

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Experience = typeof experiences.$inferSelect;
export type NewExperience = typeof experiences.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type ProfileWithRelations = Profile & {
	experiences: Experience[];
	projects: Project[];
	skills: Skill[];
};
export type ProfileCard = Pick<Profile, "slug" | "fullName" | "headline"> & { skills: string[] };
