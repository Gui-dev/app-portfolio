import { expect, test } from "@playwright/test";
import {
	createPublishedProfile,
	deleteUsers,
	login,
	signUpAndVerify,
	uniqueSlug,
} from "./helpers/auth";
import { uniqueEmail } from "./helpers/users";

const createdEmails: string[] = [];

test.afterEach(() => deleteUsers(createdEmails));

test("should permanently redirect the old slug to the new one", async ({ page, request }) => {
	const email = uniqueEmail("redirect-old");
	createdEmails.push(email);
	const oldSlug = uniqueSlug("old");
	const newSlug = uniqueSlug("new");

	await createPublishedProfile(page, { email, slug: oldSlug });
	await page.getByLabel("Slug Público (/seunome)").fill(newSlug);
	await expect(page.getByText("Rascunho sincronizado")).toBeVisible();

	const response = await request.get(`/${oldSlug}`, { maxRedirects: 0 });
	expect([301, 308]).toContain(response.status());
	expect(response.headers().location).toBe(`/${newSlug}`);
});

test("should not redirect an old slug after unpublishing", async ({ page, request }) => {
	const email = uniqueEmail("redirect-unpublish");
	createdEmails.push(email);
	const oldSlug = uniqueSlug("old");
	const newSlug = uniqueSlug("new");

	await createPublishedProfile(page, { email, slug: oldSlug });
	await page.getByLabel("Slug Público (/seunome)").fill(newSlug);
	await expect(page.getByText("Rascunho sincronizado")).toBeVisible();
	await page.getByRole("button", { name: "Atualizar publicação" }).click();
	await expect(page.getByRole("button", { name: "Salvar e Publicar" })).toBeVisible();

	const response = await request.get(`/${oldSlug}`, { maxRedirects: 0 });
	expect(response.status()).toBe(404);
});

test("should reject reserved and taken slugs in the editor", async ({ browser, page }) => {
	const ownerEmail = uniqueEmail("redirect-owner");
	const email = uniqueEmail("redirect-invalid");
	createdEmails.push(ownerEmail, email);
	const takenSlug = uniqueSlug("taken");

	const ownerContext = await browser.newContext({
		baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
	});
	const ownerPage = await ownerContext.newPage();
	await createPublishedProfile(ownerPage, { email: ownerEmail, slug: takenSlug });
	await ownerContext.close();

	await signUpAndVerify(page, email, "password123");
	await login(page, email, "password123");
	await page.getByLabel("Nome Completo").fill("Bruce Wayne");
	const slugInput = page.getByLabel("Slug Público (/seunome)");

	await slugInput.fill("dashboard");
	await expect(page.getByText("Escolha um slug válido.")).toBeVisible();

	await slugInput.fill(takenSlug);
	await expect(page.getByText("Este slug já está em uso.")).toBeVisible();
});
