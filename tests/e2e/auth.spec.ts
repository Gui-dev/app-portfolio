import { expect, test } from "@playwright/test";
import { waitForEmail } from "./helpers/mailpit";
import { uniqueEmail } from "./helpers/users";

async function signUp(page: import("@playwright/test").Page, email: string, password: string) {
	await page.goto("/signup");
	await page.getByLabel("Nome").fill("Usuário Teste");
	await page.getByLabel("E-mail").fill(email);
	await page.getByLabel("Senha", { exact: true }).fill(password);
	await page.getByLabel("Confirmar senha").fill(password);
	await page.getByRole("button", { name: "Criar conta" }).click();
	await expect(page.getByRole("heading", { name: "Verifique seu email" })).toBeVisible();
}

async function signUpAndVerify(
	page: import("@playwright/test").Page,
	email: string,
	password: string,
) {
	await signUp(page, email, password);
	const verificationUrl = await waitForEmail({
		to: email,
		subjectContains: "Confirme seu email",
	});
	await page.goto(verificationUrl);
	await page.waitForURL((url) => !url.pathname.includes("/api/auth/verify-email"), {
		timeout: 10_000,
	});
}

test("should sign up, verify by email and reach the dashboard", async ({ page }) => {
	const email = uniqueEmail("auth");
	const password = "password123";

	await signUpAndVerify(page, email, password);

	await page.goto("/login");
	await page.getByLabel("E-mail").fill(email);
	await page.getByLabel("Senha").fill(password);
	await page.getByRole("button", { name: "Entrar" }).click();

	await expect(page).toHaveURL(/\/dashboard/);
	await expect(page.getByRole("tab", { name: "Perfil" })).toBeVisible();
});

test("should reject a wrong password", async ({ page }) => {
	const email = uniqueEmail("wrong-password");
	const password = "password123";

	await signUpAndVerify(page, email, password);

	await page.goto("/login");
	await page.getByLabel("E-mail").fill(email);
	await page.getByLabel("Senha").fill("wrong-password");
	await page.getByRole("button", { name: "Entrar" }).click();

	await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();
	await expect(page).toHaveURL(/\/login/);
});
