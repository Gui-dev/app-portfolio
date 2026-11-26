import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { getPublicProfileBySlug } from "@/lib/db/queries";
import { initials } from "@/lib/initials";
import { normalizeSlug } from "@/lib/slug";
import { templateStyle } from "@/lib/template";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Portfólio no FolioCraft";

function shorten(value: string | null, fallback: string, max: number): string {
	const text = value?.trim() || fallback;
	return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
	const { slug: rawSlug } = await params;
	const slug = normalizeSlug(rawSlug);
	if (!slug) notFound();

	const profile = await getPublicProfileBySlug(slug);
	if (!profile) notFound();

	const tokens = templateStyle(profile.template, profile.colorMode);
	const name = shorten(profile.fullName, "Perfil", 28);
	const headline = shorten(profile.headline, "Portfólio profissional", 46);
	const gradient = `linear-gradient(135deg, ${tokens["--accent"]}, ${tokens["--accent-2"]})`;

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: 72,
				background: tokens["--bg"],
				color: tokens["--fg"],
				fontFamily: "sans-serif",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 28 }}>
				<div
					style={{
						width: 112,
						height: 112,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: 26,
						fontSize: 44,
						fontWeight: 700,
						color: tokens["--fg"],
						backgroundImage: gradient,
					}}
				>
					{initials(profile.fullName ?? "")}
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
					<div style={{ fontSize: 24, color: tokens["--muted"] }}>FolioCraft</div>
					<div style={{ fontSize: 24, color: tokens["--accent"] }}>{`/${profile.slug}`}</div>
				</div>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
				<div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{name}</div>
				<div style={{ fontSize: 36, color: tokens["--accent"] }}>{headline}</div>
			</div>
			<div style={{ display: "flex", width: 240, height: 8, backgroundImage: gradient }} />
		</div>,
		{ ...size },
	);
}
