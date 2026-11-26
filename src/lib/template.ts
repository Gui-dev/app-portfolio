import type { CSSProperties } from "react";
import type { ColorMode, Template } from "@/lib/db/schema";

export type TemplateToken = { name: string; description: string };

export type TemplateStyle = CSSProperties &
	Record<
		"--bg" | "--surface" | "--border" | "--fg" | "--muted" | "--accent" | "--accent-2",
		string
	>;

const STYLES: Record<Template, Record<ColorMode, TemplateStyle>> = {
	minimal: {
		dark: {
			"--bg": "#171717",
			"--surface": "#1F1F1F",
			"--border": "#262626",
			"--fg": "#E5E5E5",
			"--muted": "#A3A3A3",
			"--accent": "#E5E5E5",
			"--accent-2": "#A3A3A3",
		},
		light: {
			"--bg": "#FAF9F6",
			"--surface": "#FFFFFF",
			"--border": "#E5E5E5",
			"--fg": "#171717",
			"--muted": "#525252",
			"--accent": "#171717",
			"--accent-2": "#737373",
		},
	},
	developer: {
		dark: {
			"--bg": "#09090B",
			"--surface": "#121214",
			"--border": "#27272A",
			"--fg": "#FAFAFA",
			"--muted": "#A1A1AA",
			"--accent": "#10B981",
			"--accent-2": "#34D399",
		},
		light: {
			"--bg": "#FAFAFA",
			"--surface": "#FFFFFF",
			"--border": "#E4E4E7",
			"--fg": "#18181B",
			"--muted": "#52525B",
			"--accent": "#047857",
			"--accent-2": "#10B981",
		},
	},
	modern: {
		dark: {
			"--bg": "#0B0F19",
			"--surface": "#131B2E",
			"--border": "#1E293B",
			"--fg": "#F1F5F9",
			"--muted": "#94A3B8",
			"--accent": "#6366F1",
			"--accent-2": "#22D3EE",
		},
		light: {
			"--bg": "#F8FAFC",
			"--surface": "#FFFFFF",
			"--border": "#E2E8F0",
			"--fg": "#0F172A",
			"--muted": "#475569",
			"--accent": "#4F46E5",
			"--accent-2": "#0891B2",
		},
	},
};

export const TEMPLATES: Record<Template, TemplateToken> = {
	minimal: {
		name: "Minimal",
		description: "Editorial, tipografia serifada e divisórias limpas.",
	},
	developer: {
		name: "Developer",
		description: "Estética terminal, JetBrains Mono e destaque Emerald.",
	},
	modern: {
		name: "Modern",
		description: "SaaS moderno, cards elevados e acentos Indigo.",
	},
};

export function templateStyle(template: Template, mode: ColorMode): TemplateStyle {
	return { ...STYLES[template][mode] };
}

/** Brand colors for the landing OG card, kept with the other typed tokens. */
export const BRAND_OG_COLORS = {
	background: "#0B0F19",
	foreground: "#F1F5F9",
	indigo: "#6366F1",
	violet: "#7C3AED",
} as const;
