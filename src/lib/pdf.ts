import { type Browser, chromium, type Page } from "playwright";

export interface PdfRenderer {
	render(url: string): Promise<Uint8Array>;
}

export class PdfUnavailableError extends Error {
	constructor(message = "PDF rendering is unavailable") {
		super(message);
		this.name = "PdfUnavailableError";
	}
}

interface PdfGlobalState {
	__foliocraftPdfBrowser?: Browser | null;
	__foliocraftPdfBrowserPromise?: Promise<Browser> | null;
	__foliocraftPdfShutdownHooks?: boolean;
}

const pdfGlobal = globalThis as typeof globalThis & PdfGlobalState;

async function getBrowser(): Promise<Browser> {
	const current = pdfGlobal.__foliocraftPdfBrowser;
	if (current?.isConnected()) return current;

	if (!pdfGlobal.__foliocraftPdfBrowserPromise) {
		pdfGlobal.__foliocraftPdfBrowser = null;
		pdfGlobal.__foliocraftPdfBrowserPromise = chromium
			.launch({
				executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
				args: ["--no-sandbox"],
			})
			.then((browser) => {
				pdfGlobal.__foliocraftPdfBrowser = browser;
				pdfGlobal.__foliocraftPdfBrowserPromise = null;
				return browser;
			})
			.catch((error: unknown) => {
				pdfGlobal.__foliocraftPdfBrowserPromise = null;
				throw error;
			});
	}

	return pdfGlobal.__foliocraftPdfBrowserPromise;
}

export async function closePdfBrowser(): Promise<void> {
	const browser = pdfGlobal.__foliocraftPdfBrowser;
	pdfGlobal.__foliocraftPdfBrowser = null;
	pdfGlobal.__foliocraftPdfBrowserPromise = null;
	await browser?.close().catch(() => {});
}

if (!pdfGlobal.__foliocraftPdfShutdownHooks) {
	pdfGlobal.__foliocraftPdfShutdownHooks = true;
	const closeOnExit = () => {
		void closePdfBrowser();
	};
	process.once("SIGTERM", closeOnExit);
	process.once("SIGINT", closeOnExit);
}

export function createPlaywrightRenderer(): PdfRenderer {
	return {
		async render(url: string): Promise<Uint8Array> {
			let page: Page | undefined;
			try {
				const browser = await getBrowser();
				page = await browser.newPage();
				await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
				await page.emulateMedia({ media: "print" });
				const pdf = await page.pdf({
					format: "A4",
					printBackground: true,
					preferCSSPageSize: true,
				});
				return new Uint8Array(pdf);
			} catch (error) {
				if (error instanceof PdfUnavailableError) throw error;
				throw new PdfUnavailableError("Chromium failed to render the PDF");
			} finally {
				await page?.close().catch(() => {});
			}
		},
	};
}

export async function renderProfilePdf(renderer: PdfRenderer, url: string): Promise<Uint8Array> {
	try {
		return await renderer.render(url);
	} catch (error) {
		if (error instanceof PdfUnavailableError) throw error;
		throw new PdfUnavailableError("PDF renderer is unavailable");
	}
}

export function renderPdfResponse(bytes: Uint8Array, filename: string): Response {
	const body = new Uint8Array(bytes.byteLength);
	body.set(bytes);
	return new Response(body, {
		headers: {
			"cache-control": "no-store",
			"content-disposition": `attachment; filename="${filename}.pdf"`,
			"content-type": "application/pdf",
			"x-robots-tag": "noindex",
		},
	});
}

export function pdfUnavailableResponse(): Response {
	return Response.json(
		{ error: "PDF_UNAVAILABLE" },
		{ status: 503, headers: { "cache-control": "no-store" } },
	);
}

export async function renderProfilePdfResponse(
	renderer: PdfRenderer,
	url: string,
	filename: string,
): Promise<Response> {
	try {
		const bytes = await renderProfilePdf(renderer, url);
		return renderPdfResponse(bytes, filename);
	} catch (error) {
		if (error instanceof PdfUnavailableError) return pdfUnavailableResponse();
		throw error;
	}
}
