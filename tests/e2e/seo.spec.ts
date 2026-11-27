import { expect, test } from "@playwright/test";
import { uniqueSlug } from "./helpers/auth";
import { createProfile, createPublishedProfile, deleteUsers } from "./helpers/db";
import { uniqueEmail } from "./helpers/users";

const createdEmails: string[] = [];
const baseUrl = (process.env.E2E_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

test.afterEach(async () => {
	await deleteUsers(createdEmails);
});

test("should expose title, description and canonical", async ({ page }) => {
	const email = uniqueEmail("seo-meta");
	createdEmails.push(email);
	const slug = uniqueSlug("seo-meta");
	await createPublishedProfile({
		email,
		slug,
		fullName: "Meta Wayne",
		headline: "CEO & Filantropo",
		bio: "Bio curta para o teste de SEO.",
	});

	const response = await page.goto(`/${slug}`);
	expect(response?.status()).toBe(200);
	expect(await page.title()).toBe("Meta Wayne — CEO & Filantropo | FolioCraft");
	await expect(page.locator('meta[name="description"]')).toHaveAttribute(
		"content",
		"Bio curta para o teste de SEO.",
	);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${baseUrl}/${slug}`);
});

test("should render a valid Person json-ld", async ({ page }) => {
	const email = uniqueEmail("seo-jsonld");
	createdEmails.push(email);
	const slug = uniqueSlug("seo-jsonld");
	await createPublishedProfile({
		email,
		slug,
		fullName: "Json Wayne",
		githubUrl: "https://github.com/json-wayne",
		linkedinUrl: "https://www.linkedin.com/in/json-wayne",
	});

	await page.goto(`/${slug}`);
	const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
	expect(raw).toBeTruthy();
	const json = JSON.parse(raw ?? "{}");
	expect(json["@type"]).toBe("Person");
	expect(json.name).toBe("Json Wayne");
	expect(json.sameAs).toEqual([
		"https://github.com/json-wayne",
		"https://www.linkedin.com/in/json-wayne",
	]);
});

test("should serve a png og image for a published profile", async ({ request }) => {
	const email = uniqueEmail("seo-og");
	createdEmails.push(email);
	const slug = uniqueSlug("seo-og");
	await createPublishedProfile({ email, slug, fullName: "Og Wayne" });

	const response = await request.get(`/${slug}/opengraph-image`);
	expect(response.status()).toBe(200);
	expect(response.headers()["content-type"]).toContain("image/png");
});

test("should 404 the og image of a draft", async ({ request }) => {
	const email = uniqueEmail("seo-og-draft");
	createdEmails.push(email);
	const slug = uniqueSlug("seo-og-draft");
	await createProfile({ email, slug, fullName: "Rascunho Wayne" });

	const response = await request.get(`/${slug}/opengraph-image`);
	expect(response.status()).toBe(404);
});

test("should list only published profiles in the sitemap", async ({ request }) => {
	const publishedEmail = uniqueEmail("seo-sitemap-pub");
	const draftEmail = uniqueEmail("seo-sitemap-draft");
	createdEmails.push(publishedEmail, draftEmail);
	const publishedSlug = uniqueSlug("seo-sitemap-pub");
	const draftSlug = uniqueSlug("seo-sitemap-draft");
	await createPublishedProfile({ email: publishedEmail, slug: publishedSlug });
	await createProfile({ email: draftEmail, slug: draftSlug });

	const response = await request.get("/sitemap.xml");
	expect(response.status()).toBe(200);
	const body = await response.text();
	expect(body).toContain(`${baseUrl}/${publishedSlug}`);
	expect(body).not.toContain(draftSlug);
});

test("should disallow the dashboard in robots.txt", async ({ request }) => {
	const response = await request.get("/robots.txt");
	expect(response.status()).toBe(200);
	const body = await response.text();
	expect(body).toContain("Allow: /");
	for (const path of [
		"/dashboard",
		"/api/",
		"/login",
		"/signup",
		"/forgot-password",
		"/reset-password",
	]) {
		expect(body).toContain(`Disallow: ${path}`);
	}
	expect(body).toContain(`Sitemap: ${baseUrl}/sitemap.xml`);
});
