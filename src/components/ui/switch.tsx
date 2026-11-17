import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			className={cn(
				"inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border bg-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent",
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb className="pointer-events-none block size-5 rounded-full bg-fg shadow transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
		</SwitchPrimitive.Root>
	);
}
