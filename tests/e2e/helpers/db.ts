import { execFileSync } from "node:child_process";
import { uniqueEmail } from "./users";

type Template = "minimal" | "developer" | "modern";
type ColorMode = "light" | "dark";
type MonogramStyle = "gradient" | "solid" | "outline";

export type ProfileFixtureOverrides = {
	email?: string;
	slug?: string;
	fullName?: string;
	headline?: string;
	bio?: string;
	location?: string | null;
	contactEmail?: string;
	githubUrl?: string | null;
	linkedinUrl?: string | null;
	skills?: string[];
	template?: Template;
	colorMode?: ColorMode;
	monogramStyle?: MonogramStyle;
	publishedAt?: Date | null;
};

export type ProfileFixture = {
	id: string;
	userId: string;
	email: string;
	slug: string;
	fullName: string;
	headline: string;
	bio: string;
	location: string | null;
	contactEmail: string;
	githubUrl: string | null;
	linkedinUrl: string | null;
	skills: string[];
	template: Template;
	colorMode: ColorMode;
	monogramStyle: MonogramStyle;
	publishedAt: Date | null;
};

function uniqueSlug(): string {
	return `db-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function literal(value: string | null): string {
	return value === null ? "NULL" : `'${value.replace(/'/g, "''")}'`;
}

function psql(statement: string): void {
	execFileSync(
		"podman",
		[
			"compose",
			"exec",
			"-T",
			"postgres",
			"psql",
			"-U",
			"foliocraft",
			"-d",
			"foliocraft",
			"-v",
			"ON_ERROR_STOP=1",
			"-q",
			"-c",
			statement,
		],
		{ stdio: "pipe" },
	);
}

function insertProfile(fixture: ProfileFixture): ProfileFixture {
	const publishedAt = fixture.publishedAt
		? `'${fixture.publishedAt.toISOString()}'::timestamptz`
		: "NULL";
	const skills = fixture.skills
		.map((skill, index) => `(${literal(fixture.id)}, ${literal(skill)}, ${index})`)
		.join(", ");

	psql(`
		BEGIN;
		INSERT INTO "user" (id, name, email, email_verified)
		VALUES (${literal(fixture.userId)}, ${literal(fixture.fullName)}, ${literal(fixture.email)}, true);
		INSERT INTO profiles (
			id, user_id, slug, full_name, headline, bio, location, contact_email,
			github_url, linkedin_url, monogram_style, template, color_mode, is_published, published_at
		) VALUES (
			${literal(fixture.id)}, ${literal(fixture.userId)}, ${literal(fixture.slug)},
			${literal(fixture.fullName)}, ${literal(fixture.headline)}, ${literal(fixture.bio)},
			${literal(fixture.location)}, ${literal(fixture.contactEmail)},
			${literal(fixture.githubUrl)}, ${literal(fixture.linkedinUrl)},
			${literal(fixture.monogramStyle)}, ${literal(fixture.template)},
			${literal(fixture.colorMode)}, ${fixture.publishedAt ? "true" : "false"}, ${publishedAt}
		);
		${skills ? `INSERT INTO skills (profile_id, name, sort_order) VALUES ${skills};` : ""}
		COMMIT;
	`);

	return fixture;
}

/** Inserts a draft profile directly into the dev database for e2e fixtures. */
export function createProfile(overrides: ProfileFixtureOverrides = {}): ProfileFixture {
	return insertProfile({
		id: crypto.randomUUID(),
		userId: crypto.randomUUID(),
		email: uniqueEmail("db-profile"),
		slug: uniqueSlug(),
		fullName: "Bruce Wayne",
		headline: "CEO & Filantropo",
		bio: "Lidera a Wayne Enterprises e apoia causas sociais.",
		location: "Gotham City",
		contactEmail: "bruce@wayne.dev",
		githubUrl: "https://github.com/bruce-wayne",
		linkedinUrl: "https://www.linkedin.com/in/bruce-wayne",
		skills: ["Estratégia", "Next.js", "Segurança"],
		template: "modern",
		colorMode: "dark",
		monogramStyle: "gradient",
		publishedAt: null,
		...overrides,
	});
}

/** Inserts a published profile with a timestamp ahead of existing fixtures. */
export function createPublishedProfile(overrides: ProfileFixtureOverrides = {}): ProfileFixture {
	return createProfile({
		publishedAt: new Date(Date.now() + 60_000),
		...overrides,
	});
}

/** Deletes the users (and cascading rows) created by a spec. */
export function deleteUsers(emails: string[]): void {
	const pending = emails.splice(0);
	if (pending.length === 0) return;
	const values = pending.map(literal).join(", ");
	psql(`DELETE FROM "user" WHERE email IN (${values});`);
}
