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

test.afterEach(async () => {
	await deleteUsers(createdEmails);
});

test("should change the password and sign in with the new one", async ({ page }) => {
	const email = uniqueEmail("settings-password");
	const password = "password123";
	const newPassword = "newpassword456";
	createdEmails.push(email);

	await signUpAndVerify(page, email, password);
	await login(page, email, password);

	await page.getByRole("link", { name: "Configurações" }).click();
	// Next dev compiles this route on first navigation in a full e2e run.
	await expect(page).toHaveURL(/\/dashboard\/settings/, { timeout: 15_000 });
	await expect(page.getByRole("heading", { name: "Configurações da conta" })).toBeVisible();

	await page.getByLabel("Senha atual", { exact: true }).fill(password);
	await page.getByLabel("Nova senha", { exact: true }).fill(newPassword);
	await page.getByLabel("Confirmar nova senha", { exact: true }).fill(newPassword);
	await page.getByRole("button", { name: "Salvar nova senha" }).click();

	await expect(page.getByText("Senha atualizada com sucesso.")).toBeVisible();

	await page.context().clearCookies();
	await page.goto("/login");
	await page.getByLabel("E-mail").fill(email);
	await page.getByLabel("Senha").fill(newPassword);
	await page.getByRole("button", { name: "Entrar" }).click();

	await expect(page).toHaveURL(/\/dashboard/);
});

test("should delete the account and remove the public page", async ({ page }) => {
	const email = uniqueEmail("settings-delete");
	const slug = uniqueSlug("settings-delete");
	createdEmails.push(email);

	await createPublishedProfile(page, { email, slug });

	await page.getByRole("link", { name: "Configurações" }).click();
	await expect(page).toHaveURL(/\/dashboard\/settings/);

	await page.getByRole("button", { name: "Excluir conta" }).click();
	await expect(page.getByRole("heading", { name: "Excluir conta permanentemente" })).toBeVisible();
	await page.getByLabel("Digite seu slug para confirmar").fill(slug);
	await page.getByRole("button", { name: "Excluir conta permanentemente" }).click();

	await expect(page).toHaveURL(/\/login/);

	const publicPage = await page.request.get(`/${slug}`);
	expect(publicPage.status()).toBe(404);

	await page.getByLabel("E-mail").fill(email);
	await page.getByLabel("Senha").fill("password123");
	await page.getByRole("button", { name: "Entrar" }).click();

	await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();
});
