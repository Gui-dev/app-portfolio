import { ImageResponse } from "next/og";
import { BRAND_OG_COLORS } from "@/lib/template";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "FolioCraft — Gerador de portfólio e currículo online";

export default function Image() {
	const gradient = `linear-gradient(135deg, ${BRAND_OG_COLORS.indigo}, ${BRAND_OG_COLORS.violet})`;

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: 72,
				background: BRAND_OG_COLORS.background,
				color: BRAND_OG_COLORS.foreground,
				fontFamily: "sans-serif",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 24 }}>
				<div
					style={{
						width: 76,
						height: 76,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: 20,
						fontSize: 40,
						fontWeight: 700,
						backgroundImage: gradient,
					}}
				>
					F
				</div>
				<div style={{ fontSize: 30 }}>FolioCraft</div>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						fontSize: 78,
						fontWeight: 700,
						lineHeight: 1.05,
					}}
				>
					<div>Seu portfólio,</div>
					<div>sua história.</div>
				</div>
				<div style={{ fontSize: 34, color: BRAND_OG_COLORS.indigo }}>
					Publique, compartilhe e exporte em PDF.
				</div>
			</div>
			<div style={{ display: "flex", width: 320, height: 8, backgroundImage: gradient }} />
		</div>,
		{ ...size },
	);
}
