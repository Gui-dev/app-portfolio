import { expect, test } from "@playwright/test";
import { uniqueSlug } from "./helpers/auth";
import { createProfile, createPublishedProfile, deleteUsers } from "./helpers/db";
import { uniqueEmail } from "./helpers/users";

const createdEmails: string[] = [];

test.afterEach(async () => {
	await deleteUsers(createdEmails);
});

test("should list a published profile", async ({ page }) => {
	const email = uniqueEmail("explore-published");
	createdEmails.push(email);
	const slug = uniqueSlug("explore-published");
	await createPublishedProfile({
		email,
		slug,
		fullName: "Explore Wayne",
		headline: "Explorador de código",
		skills: ["Next.js", "Drizzle", "SEO"],
	});

	const response = await page.goto("/explore");
	expect(response?.status()).toBe(200);
	const card = page.locator(`a[href="/${slug}"]`);
	await expect(card).toContainText("Explore Wayne");
	await expect(card).toContainText("Explorador de código");
	await expect(card).toContainText("Next.js");
});

test("should not list a draft", async ({ page }) => {
	const email = uniqueEmail("explore-draft");
	createdEmails.push(email);
	const slug = uniqueSlug("explore-draft");
	await createProfile({ email, slug, fullName: "Rascunho Invisível" });

	await page.goto("/explore");
	await expect(page.locator(`a[href="/${slug}"]`)).toHaveCount(0);
	await expect(page.getByRole("heading", { name: "Explore portfólios" })).toBeVisible();
});

test("should paginate at /explore/page/2", async ({ page }) => {
	const fixtures = await Promise.all(
		Array.from({ length: 13 }, (_, index) => {
			const email = uniqueEmail(`explore-page-${index}`);
			createdEmails.push(email);
			return createPublishedProfile({
				email,
				slug: uniqueSlug(`explore-page-${index}`),
				fullName: `Pagina Wayne ${String(index).padStart(2, "0")}`,
				publishedAt: new Date(Date.now() + 120_000 + index * 1000),
			});
		}),
	);
	const oldest = fixtures[0];
	const newest = fixtures[12];

	await page.goto("/explore");
	await expect(page.locator(`a[href="/${oldest.slug}"]`)).toHaveCount(0);
	await expect(page.locator(`a[href="/${newest.slug}"]`)).toBeVisible();

	await page.goto("/explore/page/2");
	await expect(page.locator(`a[href="/${oldest.slug}"]`)).toBeVisible();
	await expect(page.locator(`a[href="/${newest.slug}"]`)).toHaveCount(0);
	await expect(page.getByRole("link", { name: "Página 1" })).toHaveAttribute("href", "/explore");
});

test("should 404 pages beyond the last", async ({ page }) => {
	const response = await page.goto("/explore/page/9999");
	expect(response?.status()).toBe(404);
	await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
});
