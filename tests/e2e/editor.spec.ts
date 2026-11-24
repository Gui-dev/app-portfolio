import { expect, test } from "@playwright/test";
import { waitForEmail } from "./helpers/mailpit";
import { uniqueEmail } from "./helpers/users";

async function signUpAndVerify(
	page: import("@playwright/test").Page,
	email: string,
	password: string,
) {
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

async function login(page: import("@playwright/test").Page, email: string, password: string) {
	await page.goto("/login");
	await page.getByLabel("E-mail").fill(email);
	await page.getByLabel("Senha").fill(password);
	await page.getByRole("button", { name: "Entrar" }).click();
	await expect(page).toHaveURL(/\/dashboard/);
}

test("should persist the headline after reload", async ({ page }) => {
	const email = uniqueEmail("editor");
	const password = "password123";

	await signUpAndVerify(page, email, password);
	await login(page, email, password);

	const headline = page.getByLabel("Cargo / Headline");
	await expect(headline).toBeVisible();
	await headline.fill("Engenheira de Software Fullstack");
	await expect(page.getByText("Rascunho sincronizado")).toBeVisible();

	await page.reload();
	await expect(page.getByLabel("Cargo / Headline")).toHaveValue("Engenheira de Software Fullstack");
});

test("should redirect to login when unauthenticated", async ({ page }) => {
	await page.goto("/dashboard");
	await expect(page).toHaveURL(/\/login/);
});
