"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { getProfileForUser } from "@/lib/db/queries";
import { slugHistory } from "@/lib/db/schema";
import { deleteAccountSchema } from "@/lib/validation/auth";

export type DeleteAccountResult =
	| { ok: true }
	| {
			ok: false;
			error: "UNAUTHORIZED" | "INVALID_CONFIRMATION" | "SESSION_EXPIRED" | "DELETE_FAILED";
	  };

function errorCode(error: unknown): string | null {
	if (!error || typeof error !== "object") return null;

	const body = (error as { body?: unknown }).body;
	if (body && typeof body === "object" && "code" in body) {
		const code = (body as { code?: unknown }).code;
		if (typeof code === "string") return code;
	}

	const code = (error as { code?: unknown }).code;
	return typeof code === "string" ? code : null;
}

export async function deleteAccount(input: { slug: string }): Promise<DeleteAccountResult> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return { ok: false, error: "UNAUTHORIZED" };
	}

	const parsed = deleteAccountSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "INVALID_CONFIRMATION" };
	}

	const profile = await getProfileForUser(session.user.id);
	if (!profile?.slug || parsed.data.slug !== profile.slug) {
		return { ok: false, error: "INVALID_CONFIRMATION" };
	}

	const historicalSlugs = await db
		.select({ slug: slugHistory.slug })
		.from(slugHistory)
		.where(eq(slugHistory.profileId, profile.id));

	try {
		await auth.api.deleteUser({ headers: await headers(), body: {} });
	} catch (error) {
		const code = errorCode(error);
		if (code === "SESSION_EXPIRED" || code === "SESSION_NOT_FRESH") {
			return { ok: false, error: "SESSION_EXPIRED" };
		}
		return { ok: false, error: "DELETE_FAILED" };
	}

	revalidatePath(`/${profile.slug}`);
	for (const row of historicalSlugs) {
		revalidatePath(`/${row.slug}`);
	}
	revalidatePath("/explore");
	revalidatePath("/sitemap.xml");

	return { ok: true };
}
