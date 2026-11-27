import { expect, test } from "@playwright/test";
import { deleteUsers } from "./helpers/db";
import { waitForEmail } from "./helpers/mailpit";
import { uniqueEmail } from "./helpers/users";

const createdEmails: string[] = [];

test.afterEach(async () => {
	await deleteUsers(createdEmails);
});

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
	createdEmails.push(email);
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

test("should keep added experience after reload", async ({ page }) => {
	const email = uniqueEmail("editor-exp");
	createdEmails.push(email);
	const password = "password123";

	await signUpAndVerify(page, email, password);
	await login(page, email, password);

	await page.getByRole("tab", { name: "Experiência" }).click();
	await page.getByRole("button", { name: "Adicionar" }).click();
	const card = page.getByRole("article", { name: "Experiência #01" });
	await card.getByLabel("Cargo ou Papel Exercido").fill("Desenvolvedor Front-end");
	await card.getByLabel("Empresa, Projeto ou Instituição").fill("Startup X");
	await card.getByLabel("Período").fill("2024 — Atual");
	await card
		.getByLabel("Entregas e Resultados (Foque no impacto técnico)")
		.fill("Construí interfaces acessíveis.");
	await expect(page.getByText("Rascunho sincronizado")).toBeVisible();

	await page.reload();
	await page.getByRole("tab", { name: "Experiência" }).click();
	const reloaded = page.getByRole("article", { name: "Experiência #01" });
	await expect(reloaded.getByLabel("Cargo ou Papel Exercido")).toHaveValue(
		"Desenvolvedor Front-end",
	);
	await expect(reloaded.getByLabel("Empresa, Projeto ou Instituição")).toHaveValue("Startup X");
});

test("should load beginner samples and keep after reload", async ({ page }) => {
	const email = uniqueEmail("editor-samples");
	createdEmails.push(email);
	const password = "password123";

	await signUpAndVerify(page, email, password);
	await login(page, email, password);

	await page.getByRole("tab", { name: "Experiência" }).click();
	await page.getByRole("button", { name: "✨ Carregar Perfil Primeiro Emprego" }).click();
	await expect(page.getByRole("article", { name: "Experiência #01" })).toBeVisible();
	await expect(page.getByRole("article", { name: "Experiência #02" })).toBeVisible();
	await expect(page.getByRole("article", { name: "Experiência #03" })).toBeVisible();
	await expect(page.getByText("Rascunho sincronizado")).toBeVisible();

	await page.reload();
	await page.getByRole("tab", { name: "Experiência" }).click();
	await expect(page.getByRole("article", { name: "Experiência #01" })).toBeVisible();
	await expect(page.getByRole("article", { name: "Experiência #02" })).toBeVisible();
	await expect(page.getByRole("article", { name: "Experiência #03" })).toBeVisible();
	await expect(
		page.getByRole("article", { name: "Experiência #01" }).getByLabel("Tipo da experiência 1"),
	).toHaveValue("freelance");
});

test("should reorder experiences and keep new order after reload", async ({ page }) => {
	const email = uniqueEmail("editor-order");
	createdEmails.push(email);
	const password = "password123";

	await signUpAndVerify(page, email, password);
	await login(page, email, password);

	await page.getByRole("tab", { name: "Experiência" }).click();
	await page.getByRole("button", { name: "Adicionar" }).click();
	await page.getByRole("button", { name: "Adicionar" }).click();

	const first = page.getByRole("article", { name: "Experiência #01" });
	await first.getByLabel("Cargo ou Papel Exercido").fill("Primeiro");
	await first.getByLabel("Empresa, Projeto ou Instituição").fill("Empresa A");
	await first.getByLabel("Período").fill("2023");
	await first.getByLabel("Entregas e Resultados (Foque no impacto técnico)").fill("Desc A");

	const second = page.getByRole("article", { name: "Experiência #02" });
	await second.getByLabel("Cargo ou Papel Exercido").fill("Segundo");
	await second.getByLabel("Empresa, Projeto ou Instituição").fill("Empresa B");
	await second.getByLabel("Período").fill("2024");
	await second.getByLabel("Entregas e Resultados (Foque no impacto técnico)").fill("Desc B");

	await page.getByRole("button", { name: "Mover Experiência #02 para cima" }).click();
	await expect(
		page.getByRole("article", { name: "Experiência #01" }).getByLabel("Cargo ou Papel Exercido"),
	).toHaveValue("Segundo");
	await expect(page.getByText("Rascunho sincronizado")).toBeVisible();

	await page.reload();
	await page.getByRole("tab", { name: "Experiência" }).click();
	await expect(
		page.getByRole("article", { name: "Experiência #01" }).getByLabel("Cargo ou Papel Exercido"),
	).toHaveValue("Segundo");
	await expect(
		page.getByRole("article", { name: "Experiência #02" }).getByLabel("Cargo ou Papel Exercido"),
	).toHaveValue("Primeiro");
});

test("should change the template and persist it after reload", async ({ page }) => {
	const email = uniqueEmail("editor-template");
	createdEmails.push(email);
	const password = "password123";

	await signUpAndVerify(page, email, password);
	await login(page, email, password);

	await page.getByRole("tab", { name: "Aparência" }).click();
	await page.getByText("Developer", { exact: true }).click();

	const preview = page.locator("[data-template]").first();
	await expect(preview).toHaveAttribute("data-template", "developer");
	await expect(preview).toHaveCSS("--accent", "#10B981");
	await expect(page.getByText("Rascunho sincronizado")).toBeVisible();

	await page.reload();
	await page.getByRole("tab", { name: "Aparência" }).click();

	await expect(page.getByRole("radio", { name: /Developer/ })).toBeChecked();
	await expect(page.locator("[data-template]").first()).toHaveAttribute(
		"data-template",
		"developer",
	);
});

test("should switch the preview to light mode and persist it", async ({ page }) => {
	const email = uniqueEmail("editor-preview-theme");
	createdEmails.push(email);
	const password = "password123";

	await signUpAndVerify(page, email, password);
	await login(page, email, password);

	await page.getByRole("button", { name: "Alternar tema da prévia" }).click();

	const preview = page.locator("[data-mode]").first();
	await expect(preview).toHaveAttribute("data-mode", "light");
	await expect(page.getByText("Rascunho sincronizado")).toBeVisible();

	await page.reload();

	await expect(page.locator("[data-mode]").first()).toHaveAttribute("data-mode", "light");
	await expect(page.getByRole("button", { name: "Alternar tema da prévia" })).toHaveAttribute(
		"aria-pressed",
		"true",
	);
});

test("should redirect to login when unauthenticated", async ({ page }) => {
	await page.goto("/dashboard");
	await expect(page).toHaveURL(/\/login/);
});
