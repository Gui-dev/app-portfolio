import { expect, type Page } from "@playwright/test";
import { waitForEmail } from "./mailpit";

export { deleteUsers } from "./db";

const PASSWORD = "password123";

export function uniqueSlug(prefix: string): string {
	const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	const maxPrefixLength = 30 - suffix.length - 1;
	const base = prefix.slice(0, Math.max(3, maxPrefixLength)).replace(/-+$/g, "");
	return `${base}-${suffix}`;
}

export async function signUpAndVerify(page: Page, email: string, password: string): Promise<void> {
	await page.goto("/signup");
	await page.getByLabel("Nome").fill("Usuário Teste");
	await page.getByLabel("E-mail").fill(email);
	await page.getByLabel("Senha", { exact: true }).fill(password);
	await page.getByLabel("Confirmar senha").fill(password);
	await page.getByRole("button", { name: "Criar conta" }).click();
	await expect(page.getByRole("heading", { name: "Verifique seu email" })).toBeVisible();

	const verificationUrl = await waitForEmail({
		to: email,
		subjectContains: "Confirme seu email",
	});
	await page.goto(verificationUrl);
	await page.waitForURL((url) => !url.pathname.includes("/api/auth/verify-email"), {
		timeout: 10_000,
	});
}

export async function login(page: Page, email: string, password: string): Promise<void> {
	await page.goto("/login");
	await page.getByLabel("E-mail").fill(email);
	await page.getByLabel("Senha").fill(password);
	await page.getByRole("button", { name: "Entrar" }).click();
	await expect(page).toHaveURL(/\/dashboard/);
}

export async function createPublishedProfile(
	page: Page,
	{
		email,
		slug,
		headline = "Vigilante",
		skills = [],
	}: {
		email: string;
		slug: string;
		headline?: string;
		skills?: string[];
	},
): Promise<void> {
	await signUpAndVerify(page, email, PASSWORD);
	await login(page, email, PASSWORD);

	await page.getByLabel("Nome Completo").fill("Bruce Wayne");
	await page.getByLabel("Cargo / Headline").fill(headline);
	await page.getByLabel("Slug Público (/seunome)").fill(slug);

	if (skills.length > 0) {
		await page.getByRole("tab", { name: "Skills" }).click();
		for (const skill of skills) {
			await page.getByLabel("Nova habilidade").fill(skill);
			await page.getByLabel("Nova habilidade").press("Enter");
		}
	}

	await expect(page.getByText("Rascunho sincronizado")).toBeVisible();
	await page.getByRole("button", { name: "Salvar e Publicar" }).click();
	await expect(page.getByRole("button", { name: "Atualizar publicação" })).toBeVisible();
}
