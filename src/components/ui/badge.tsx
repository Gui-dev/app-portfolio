import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium",
	{
		variants: {
			variant: {
				default: "border-border bg-surface text-muted",
				accent: "border-accent/30 bg-accent/10 text-accent",
				outline: "border-border bg-transparent text-fg",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

export interface BadgeProps extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
	return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
