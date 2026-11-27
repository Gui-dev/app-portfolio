import { expect, test } from "@playwright/test";
import { uniqueSlug } from "./helpers/auth";
import { createProfile, createPublishedProfile, deleteUsers } from "./helpers/db";
import { uniqueEmail } from "./helpers/users";

const createdEmails: string[] = [];

test.afterEach(async () => {
	await deleteUsers(createdEmails);
});

function pdfPrefix(body: Buffer): string {
	return body.subarray(0, 5).toString();
}

test("should download a valid pdf from the public page", async ({ request }) => {
	const email = uniqueEmail("pdf-download");
	createdEmails.push(email);
	const slug = uniqueSlug("pdf-download");
	await createPublishedProfile({ email, slug, fullName: "Pdf Wayne" });

	const response = await request.get(`/api/pdf/${slug}`);
	expect(response.status()).toBe(200);
	expect(response.headers()["content-type"]).toContain("application/pdf");
	expect(response.headers()["content-disposition"]).toContain(`attachment; filename="${slug}.pdf"`);
	expect(pdfPrefix(await response.body())).toBe("%PDF-");
});

test("should reuse the browser across requests", async ({ request }) => {
	const email = uniqueEmail("pdf-reuse");
	createdEmails.push(email);
	const slug = uniqueSlug("pdf-reuse");
	await createPublishedProfile({ email, slug });

	for (let attempt = 0; attempt < 2; attempt += 1) {
		const response = await request.get(`/api/pdf/${slug}`);
		expect(response.status()).toBe(200);
		expect(pdfPrefix(await response.body())).toBe("%PDF-");
	}
});

test("should 404 the pdf of a draft", async ({ request }) => {
	const email = uniqueEmail("pdf-draft");
	createdEmails.push(email);
	const slug = uniqueSlug("pdf-draft");
	await createProfile({ email, slug, fullName: "Draft Wayne" });

	const response = await request.get(`/api/pdf/${slug}`);
	expect(response.status()).toBe(404);
});

test("should mark the print page as noindex", async ({ page }) => {
	const email = uniqueEmail("pdf-print");
	createdEmails.push(email);
	const slug = uniqueSlug("pdf-print");
	await createPublishedProfile({ email, slug, fullName: "Print Wayne" });

	const response = await page.goto(`/${slug}/print`);
	expect(response?.status()).toBe(200);
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
		"content",
		/noindex.*nofollow|nofollow.*noindex/,
	);
	await expect(page.getByRole("heading", { name: "Print Wayne" })).toBeVisible();
	await expect(page.getByRole("link", { name: "Baixar PDF" })).toHaveCount(0);
	await expect(page.getByText(`/${slug}`, { exact: true })).toHaveCount(0);
});

test("should keep the download button enabled on the public page", async ({ page }) => {
	const email = uniqueEmail("pdf-button");
	createdEmails.push(email);
	const slug = uniqueSlug("pdf-button");
	await createPublishedProfile({ email, slug });

	await page.goto(`/${slug}`);
	const download = page.getByRole("link", { name: "Baixar PDF" });
	await expect(download).toHaveAttribute("href", `/api/pdf/${slug}`);
	await expect(download).toBeEnabled();
});

test("should render a valid pdf for a sparse profile", async ({ request }) => {
	const email = uniqueEmail("pdf-sparse");
	createdEmails.push(email);
	const slug = uniqueSlug("pdf-sparse");
	await createPublishedProfile({
		email,
		slug,
		fullName: "Sparse Wayne",
		bio: "",
		skills: [],
		githubUrl: null,
		linkedinUrl: null,
	});

	const response = await request.get(`/api/pdf/${slug}`);
	expect(response.status()).toBe(200);
	expect(pdfPrefix(await response.body())).toBe("%PDF-");
});
