import { expect, type Locator, test } from "@playwright/test";
import {
	createPublishedProfile,
	deleteUsers,
	login,
	loginDemo,
	signUpAndVerify,
	uniqueSlug,
} from "./helpers/auth";
import { uniqueEmail } from "./helpers/users";

const createdEmails: string[] = [];

async function templateTokens(locator: Locator): Promise<string[]> {
	return locator.evaluate((element) => {
		const styles = window.getComputedStyle(element);
		return ["--accent", "--bg", "--fg"].map(
			(name) => `${name}: ${styles.getPropertyValue(name).trim()}`,
		);
	});
}

test.afterEach(async () => {
	await deleteUsers(createdEmails);
});

test("should publish a draft and expose it at /slug", async ({ page }) => {
	const email = uniqueEmail("public-publish");
	createdEmails.push(email);
	const slug = uniqueSlug("pub");

	await createPublishedProfile(page, {
		email,
		slug,
		headline: "CEO & Filantropo",
		skills: ["Next.js", "Estratégia"],
	});

	const response = await page.goto(`/${slug}`);
	expect(response?.status()).toBe(200);
	await expect(page.getByRole("heading", { name: "Bruce Wayne" })).toBeVisible();
	await expect(page.getByText("CEO & Filantropo")).toBeVisible();
	const skills = page.getByRole("list", { name: "Habilidades" });
	await expect(skills).toContainText("Next.js");
	await expect(skills).toContainText("Estratégia");
});

test("should return 404 for a draft slug", async ({ page }) => {
	const email = uniqueEmail("public-draft");
	createdEmails.push(email);
	const slug = uniqueSlug("draft");

	await signUpAndVerify(page, email, "password123");
	await login(page, email, "password123");
	await page.getByLabel("Nome Completo").fill("Bruce Wayne");
	await page.getByLabel("Slug Público (/seunome)").fill(slug);
	await expect(page.getByText("Rascunho sincronizado")).toBeVisible();

	const response = await page.goto(`/${slug}`);
	expect(response?.status()).toBe(404);
	await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
	await expect(page.getByRole("link", { name: "Voltar para o início" })).toHaveAttribute(
		"href",
		"/",
	);
});

// ISR invalidation itself is asserted in actions.integration.spec.ts; dev
// renders on demand, so this only proves the published edit is visible.
test("should show a published edit on the public page", async ({ page }) => {
	const email = uniqueEmail("public-revalidate");
	createdEmails.push(email);
	const slug = uniqueSlug("rev");

	await createPublishedProfile(page, { email, slug, headline: "Headline Antigo" });

	await page.goto(`/${slug}`);
	await expect(page.getByText("Headline Antigo")).toBeVisible();

	await page.goto("/dashboard");
	await page.getByLabel("Cargo / Headline").fill("Headline Novo");
	await expect(page.getByText("Rascunho sincronizado")).toBeVisible();

	await page.goto(`/${slug}`);
	await page.reload();
	await expect(page.getByText("Headline Novo")).toBeVisible();
	await expect(page.getByText("Headline Antigo")).toHaveCount(0);
});

test("should render the same template and css variables in preview, public page and print", async ({
	page,
}) => {
	await loginDemo(page);
	await expect(page.getByLabel("Cargo / Headline")).toBeVisible();

	const preview = page.locator("[data-template]").first();
	await expect(preview).toHaveAttribute("data-template", "modern");
	const previewTokens = await templateTokens(preview);

	await page.goto("/bruce-wayne");
	const publicArticle = page.locator("[data-template]").first();
	await expect(publicArticle).toHaveAttribute("data-template", "modern");
	expect(await templateTokens(publicArticle)).toEqual(previewTokens);

	await page.goto("/bruce-wayne/print");
	const printArticle = page.locator("[data-template]").first();
	await expect(printArticle).toHaveAttribute("data-template", "modern");
	expect(await templateTokens(printArticle)).toEqual(previewTokens);

	const pdf = await page.request.get("/api/pdf/bruce-wayne");
	expect(pdf.status()).toBe(200);
	expect(pdf.headers()["content-type"]).toContain("application/pdf");
});

test("should be reachable from the landing demo link", async ({ page, request }) => {
	// Task 14 seeds /bruce-wayne; only create it when the seed is absent.
	const seeded = await request.get("/bruce-wayne");
	if (seeded.status() !== 200) {
		const email = uniqueEmail("public-demo");
		createdEmails.push(email);
		await createPublishedProfile(page, {
			email,
			slug: "bruce-wayne",
			headline: "CEO & Filantropo",
		});
	}

	await page.goto("/");
	await page.getByRole("link", { name: "Ver demo" }).click();
	await expect(page).toHaveURL(/\/bruce-wayne/);
	await expect(page.getByRole("heading", { name: "Bruce Wayne" })).toBeVisible();
});
