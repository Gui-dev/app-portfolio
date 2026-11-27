import { expect, test } from "@playwright/test";

test("should sign in with the seeded demo account", async ({ page }) => {
	await page.goto("/login");
	await page.getByLabel("E-mail").fill("bruce@wayne.dev");
	await page.getByLabel("Senha").fill("foliocraft-demo");
	await page.getByRole("button", { name: "Entrar" }).click();

	await expect(page).toHaveURL(/\/dashboard/);
	await expect(page.getByRole("link", { name: "Configurações" })).toBeVisible();
});
