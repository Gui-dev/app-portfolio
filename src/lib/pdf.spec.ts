import { type Browser, chromium } from "playwright";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	closePdfBrowser,
	createPlaywrightRenderer,
	type PdfRenderer,
	PdfUnavailableError,
	renderPdfResponse,
	renderProfilePdf,
	renderProfilePdfResponse,
} from "./pdf";

vi.mock("playwright", () => ({
	chromium: { launch: vi.fn() },
}));

const url = "http://localhost:3000/bruce-wayne/print";

function fakeRenderer(result: Uint8Array | Error): PdfRenderer {
	return {
		render:
			result instanceof Error
				? vi.fn().mockRejectedValue(result)
				: vi.fn().mockResolvedValue(result),
	};
}

describe("pdf", () => {
	afterEach(() => {
		vi.mocked(chromium.launch).mockReset();
	});

	it("should return the bytes produced by the renderer", async () => {
		const bytes = new Uint8Array([37, 80, 68, 70, 45]);
		const renderer = fakeRenderer(bytes);

		await expect(renderProfilePdf(renderer, url)).resolves.toBe(bytes);
		expect(renderer.render).toHaveBeenCalledWith(url);
	});

	it("should reject with PdfUnavailableError when the renderer fails", async () => {
		await expect(
			renderProfilePdf(fakeRenderer(new Error("chromium crashed")), url),
		).rejects.toBeInstanceOf(PdfUnavailableError);
	});

	it("should preserve an existing PdfUnavailableError", async () => {
		const unavailable = new PdfUnavailableError("no browser");
		await expect(renderProfilePdf(fakeRenderer(unavailable), url)).rejects.toBe(unavailable);
	});

	it("should set the pdf headers", async () => {
		const bytes = new Uint8Array([37, 80, 68, 70, 45]);
		const response = renderPdfResponse(bytes, "bruce-wayne");

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("application/pdf");
		expect(response.headers.get("content-disposition")).toContain(
			'attachment; filename="bruce-wayne.pdf"',
		);
		expect(response.headers.get("cache-control")).toBe("no-store");
		expect(response.headers.get("x-robots-tag")).toBe("noindex");
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
	});

	it("should return 503 when chromium is unavailable", async () => {
		const response = await renderProfilePdfResponse(
			fakeRenderer(new Error("chromium crashed")),
			url,
			"bruce-wayne",
		);

		expect(response.status).toBe(503);
		expect(response.headers.get("cache-control")).toBe("no-store");
		expect(await response.json()).toEqual({ error: "PDF_UNAVAILABLE" });
	});

	it("should return the pdf response on success", async () => {
		const bytes = new Uint8Array([37, 80, 68, 70, 45]);
		const response = await renderProfilePdfResponse(fakeRenderer(bytes), url, "bruce-wayne");

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("application/pdf");
		expect(response.headers.get("content-disposition")).toContain(
			'attachment; filename="bruce-wayne.pdf"',
		);
		expect(response.headers.get("cache-control")).toBe("no-store");
		expect(response.headers.get("x-robots-tag")).toBe("noindex");
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
	});

	it("should close cleanly and stay idempotent when no browser exists", async () => {
		await expect(closePdfBrowser()).resolves.toBeUndefined();
		await expect(closePdfBrowser()).resolves.toBeUndefined();
	});

	it("should close a browser that finishes launching after closePdfBrowser", async () => {
		let resolveLaunch: ((browser: Browser) => void) | undefined;
		vi.mocked(chromium.launch).mockImplementation(
			() =>
				new Promise<Browser>((resolve) => {
					resolveLaunch = resolve;
				}),
		);
		const kill = vi.fn(() => true);
		const close = vi.fn().mockResolvedValue(undefined);
		const browser = { close, process: () => ({ kill }) } as unknown as Browser;

		try {
			const render = createPlaywrightRenderer().render(url);
			expect(resolveLaunch).toBeTypeOf("function");

			const closing = closePdfBrowser();
			resolveLaunch?.(browser);

			await expect(render).rejects.toBeInstanceOf(PdfUnavailableError);
			await closing;
			expect(kill).toHaveBeenCalledWith("SIGKILL");
			expect(close).toHaveBeenCalledTimes(1);
		} finally {
			await closePdfBrowser();
		}
	});
});
