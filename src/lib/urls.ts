import { z } from "zod";

export const httpUrl = z
	.string()
	.url("Informe uma URL válida.")
	.refine((value) => /^https?:\/\//.test(value), {
		message: "Informe uma URL http(s) válida.",
	});

export const emptyOrHttpUrl = z.union([z.literal(""), httpUrl]);
