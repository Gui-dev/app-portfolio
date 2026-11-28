import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { loginDemo } from "./helpers/auth";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/bruce-wayne", "/explore"] as const;

async function expectNoSeriousViolations(page: Page): Promise<void> {
	const results = await new AxeBuilder({ page }).analyze();
	const blocking = results.violations.filter(
		(violation) => violation.impact === "serious" || violation.impact === "critical",
	);

	const details = blocking
		.map(
			(violation) =>
				`${violation.id} (${violation.impact}): ${violation.help} — ${violation.nodes
					.map(
						(node) =>
							`${node.target.join(" ")}: ${node.failureSummary?.replace(/\s+/g, " ") ?? ""}`,
					)
					.join(" | ")}`,
		)
		.join("\n");

	expect(blocking.length, details).toBe(0);
}

async function tabUntilFocused(page: Page, target: Locator, maxPresses = 160): Promise<void> {
	for (let press = 0; press < maxPresses; press += 1) {
		await page.keyboard.press("Tab");
		const focused = await target
			.evaluate((element) => element === document.activeElement)
			.catch(() => false);
		if (focused) return;
	}
	throw new Error(`Keyboard focus did not reach the target after ${maxPresses} Tab presses`);
}

async function shiftTabUntilFocused(page: Page, target: Locator, maxPresses = 160): Promise<void> {
	for (let press = 0; press < maxPresses; press += 1) {
		await page.keyboard.press("Shift+Tab");
		const focused = await target
			.evaluate((element) => element === document.activeElement)
			.catch(() => false);
		if (focused) return;
	}
	throw new Error(`Keyboard focus did not reach the target after ${maxPresses} Shift+Tab presses`);
}

async function expectVisibleFocus(locator: Locator): Promise<void> {
	await expect(locator).toBeFocused();
	const styles = await locator.evaluate((element) => {
		const computed = window.getComputedStyle(element);
		return {
			focusVisible: element.matches(":focus-visible"),
			outlineStyle: computed.outlineStyle,
			outlineWidth: computed.outlineWidth,
			boxShadow: computed.boxShadow,
		};
	});

	expect(styles.focusVisible, "focused element should match :focus-visible").toBe(true);
	const hasOutline = styles.outlineStyle !== "none" && Number.parseFloat(styles.outlineWidth) > 0;
	const hasShadow = styles.boxShadow !== "none" && styles.boxShadow.length > 0;
	expect(hasOutline || hasShadow, "focused element should render a visible focus indicator").toBe(
		true,
	);
}

for (const route of PUBLIC_ROUTES) {
	test(`should have no serious or critical violations on ${route}`, async ({ page }) => {
		await page.goto(route);
		await expect(page.locator("body")).toBeVisible();
		await page.waitForLoadState("networkidle");
		await expectNoSeriousViolations(page);
	});
}

test("should have no serious or critical violations on /dashboard", async ({ page }) => {
	await loginDemo(page);
	await expect(page.getByLabel("Cargo / Headline")).toBeVisible();
	await page.waitForLoadState("networkidle");
	await expectNoSeriousViolations(page);
});

test("should be fully operable with the keyboard", async ({ page }) => {
	test.setTimeout(120_000);
	await loginDemo(page);
	await expect(page.getByLabel("Cargo / Headline")).toBeVisible();

	const profileTab = page.getByRole("tab", { name: "Perfil" });
	const experienceTab = page.getByRole("tab", { name: "Experiência" });

	await tabUntilFocused(page, profileTab);
	await expectVisibleFocus(profileTab);

	await tabUntilFocused(page, page.getByLabel("Nome Completo"));
	await expectVisibleFocus(page.getByLabel("Nome Completo"));

	await shiftTabUntilFocused(page, profileTab);
	await page.keyboard.press("ArrowRight");
	await expect(experienceTab).toBeFocused();
	await expectVisibleFocus(experienceTab);

	await tabUntilFocused(
		page,
		page.getByRole("button", { name: "Mover Experiência #01 para baixo" }),
	);
	await expectVisibleFocus(page.getByRole("button", { name: "Mover Experiência #01 para baixo" }));

	const footerPublish = page.getByRole("button", {
		name: /Salvar e Publicar|Atualizar publicação/,
	});
	await tabUntilFocused(page, footerPublish);
	await expectVisibleFocus(footerPublish);

	await page.reload();
	await expect(page.getByLabel("Cargo / Headline")).toBeVisible();
	await tabUntilFocused(page, profileTab);
	await page.keyboard.press("ArrowRight");
	await expect(experienceTab).toBeFocused();
	await page.keyboard.press("ArrowRight");
	await expect(page.getByRole("tab", { name: "Projetos" })).toBeFocused();
	await tabUntilFocused(page, page.getByRole("button", { name: "Mover Projeto #01 para baixo" }));
	await expectVisibleFocus(page.getByRole("button", { name: "Mover Projeto #01 para baixo" }));

	await page.goto("/dashboard/settings");
	await expect(page.getByRole("heading", { name: "Configurações da conta" })).toBeVisible();

	const deleteTrigger = page.getByRole("button", { name: "Excluir conta", exact: true });
	await deleteTrigger.focus();
	await page.keyboard.press("Enter");

	const dialog = page.getByRole("dialog", { name: "Excluir conta permanentemente" });
	await expect(dialog).toBeVisible();

	for (let press = 0; press < 8; press += 1) {
		await page.keyboard.press("Tab");
		const focusInside = await dialog.evaluate((element) =>
			element.contains(document.activeElement),
		);
		expect(focusInside, "Tab should keep focus inside the delete-account dialog").toBe(true);
	}
	for (let press = 0; press < 4; press += 1) {
		await page.keyboard.press("Shift+Tab");
		const focusInside = await dialog.evaluate((element) =>
			element.contains(document.activeElement),
		);
		expect(focusInside, "Shift+Tab should keep focus inside the delete-account dialog").toBe(true);
	}

	await page.keyboard.press("Escape");
	await expect(dialog).toBeHidden();
	await expect(deleteTrigger).toBeFocused();
});
