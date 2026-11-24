"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactElement, useEffect, useId } from "react";
import { type Resolver, useForm, useWatch } from "react-hook-form";
import { type ProfileDraft, ProfileDraftSchema } from "@/lib/validation/profile";

type AvatarStyle = "gradient" | "solid" | "outline";

const avatarStyles: ReadonlyArray<{ id: AvatarStyle; label: string; swatch: string }> = [
	{
		id: "gradient",
		label: "Indigo/Cyan",
		swatch: "bg-gradient-to-br from-accent-strong to-accent-cyan",
	},
	{
		id: "solid",
		label: "Emerald Dev",
		swatch: "bg-gradient-to-br from-accent-emerald to-accent-teal",
	},
	{
		id: "outline",
		label: "Monocromático",
		swatch: "bg-fg-soft",
	},
];

const labelClass = "mb-1.5 block text-xs font-medium leading-4 text-fg-dim";
const inputClass =
	"h-[42px] w-full rounded-xl border border-border bg-surface-3 px-[14px] py-[10px] text-sm leading-5 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";
const textareaClass =
	"min-h-[82px] w-full resize-none rounded-xl border border-border bg-surface-3 px-[14px] py-[10px] text-sm leading-5 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";
const errorClass = "mt-1 text-xs leading-4 text-danger";

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "??";
	return parts
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

export function ProfileForm({
	defaultValues,
	onValuesChange,
	serverFieldErrors,
}: {
	defaultValues: ProfileDraft;
	onValuesChange: (values: ProfileDraft) => void;
	serverFieldErrors?: Partial<Record<keyof ProfileDraft, string>>;
}): ReactElement {
	const baseId = useId();
	const {
		register,
		control,
		setError,
		clearErrors,
		setValue,
		formState: { errors },
	} = useForm<ProfileDraft>({
		resolver: zodResolver(ProfileDraftSchema) as Resolver<ProfileDraft>,
		defaultValues,
		mode: "onBlur",
	});

	const values = useWatch({ control }) as ProfileDraft;
	const avatarStyle = values.monogramStyle ?? "gradient";
	const slug = values.slug ?? "";
	const initials = getInitials(values.fullName ?? "");

	useEffect(() => {
		onValuesChange(values);
	}, [onValuesChange, values]);

	useEffect(() => {
		if (!serverFieldErrors) return;
		for (const [field, message] of Object.entries(serverFieldErrors)) {
			if (!message) continue;
			setError(field as keyof ProfileDraft, { type: "server", message });
		}
	}, [serverFieldErrors, setError]);

	const ids = {
		name: `${baseId}-name`,
		slug: `${baseId}-slug`,
		headline: `${baseId}-headline`,
		bio: `${baseId}-bio`,
		location: `${baseId}-location`,
		email: `${baseId}-email`,
		github: `${baseId}-github`,
		linkedin: `${baseId}-linkedin`,
	};

	const previewClass =
		avatarStyle === "gradient"
			? "bg-gradient-to-br from-accent-strong to-accent-cyan text-fg"
			: avatarStyle === "solid"
				? "bg-gradient-to-br from-accent-emerald to-accent-teal text-fg"
				: "bg-fg-soft text-bg";

	const fieldError = (name: keyof ProfileDraft) => errors[name]?.message;

	return (
		<div className="flex flex-col gap-5">
			<header className="flex min-h-10 flex-col">
				<h2 className="font-display text-base font-bold leading-6 text-fg">
					Informações Pessoais & SEO
				</h2>
				<p className="text-xs leading-4 text-muted">
					Estes dados alimentam o cabeçalho do portfólio e as meta tags OpenGraph.
				</p>
			</header>

			<section className="flex w-full flex-col items-center gap-4 rounded-2xl border border-border bg-surface-3 p-4 sm:flex-row">
				<div
					aria-label={`Monograma ${initials}`}
					className={`grid size-16 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold leading-7 shadow-sm ${previewClass}`}
					role="img"
				>
					{initials}
				</div>
				<div className="flex w-full flex-1 flex-col gap-2">
					<p className="text-xs font-medium leading-4 text-fg-dim">Estilo do Avatar / Monograma</p>
					{/* biome-ignore lint/a11y/useSemanticElements: brief requires a div with role="group" */}
					<div aria-label="Estilo do avatar" className="flex flex-wrap gap-2" role="group">
						{avatarStyles.map((style) => (
							<button
								aria-pressed={avatarStyle === style.id}
								className="inline-flex items-center gap-1.5 rounded-xl border border-border-strong bg-border px-3 py-1.5 text-xs font-medium leading-4 text-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
								key={style.id}
								onClick={() =>
									setValue("monogramStyle", style.id, { shouldDirty: true, shouldTouch: true })
								}
								type="button"
							>
								<span aria-hidden="true" className={`size-3 rounded-full ${style.swatch}`} />
								{style.label}
							</button>
						))}
					</div>
				</div>
			</section>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label className={labelClass} htmlFor={ids.name}>
						Nome Completo
					</label>
					<input
						className={inputClass}
						id={ids.name}
						type="text"
						{...register("fullName", {
							onChange: () => clearErrors("fullName"),
						})}
					/>
					{fieldError("fullName") ? <p className={errorClass}>{fieldError("fullName")}</p> : null}
				</div>
				<div>
					<label className={labelClass} htmlFor={ids.slug}>
						Slug Público (/seunome)
					</label>
					<div className="flex h-[38px] items-center rounded-xl border border-border bg-inset px-3 py-[10px] focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-bg">
						<span aria-hidden="true" className="font-mono text-xs leading-4 text-muted">
							/
						</span>
						<input
							className="ml-1 w-full bg-transparent font-mono text-xs leading-4 text-accent-soft focus:outline-none"
							id={ids.slug}
							type="text"
							{...register("slug", {
								onChange: () => clearErrors("slug"),
							})}
						/>
					</div>
					<p className="mt-1 font-mono text-[11px] leading-4 text-muted">
						foliocraft.app/<span className="text-accent-soft">{slug || "seu-slug"}</span>
					</p>
					{fieldError("slug") ? <p className={errorClass}>{fieldError("slug")}</p> : null}
				</div>
			</div>

			<div>
				<label className={labelClass} htmlFor={ids.headline}>
					Cargo / Headline
				</label>
				<input className={inputClass} id={ids.headline} type="text" {...register("headline")} />
				{fieldError("headline") ? <p className={errorClass}>{fieldError("headline")}</p> : null}
			</div>

			<div>
				<label className={labelClass} htmlFor={ids.bio}>
					Bio Resumida
				</label>
				<textarea className={textareaClass} id={ids.bio} {...register("bio")} />
				{fieldError("bio") ? <p className={errorClass}>{fieldError("bio")}</p> : null}
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label className={labelClass} htmlFor={ids.location}>
						Localização
					</label>
					<input className={inputClass} id={ids.location} type="text" {...register("location")} />
				</div>
				<div>
					<label className={labelClass} htmlFor={ids.email}>
						E-mail de Contato
					</label>
					<input className={inputClass} id={ids.email} type="text" {...register("contactEmail")} />
					{fieldError("contactEmail") ? (
						<p className={errorClass}>{fieldError("contactEmail")}</p>
					) : null}
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label className={labelClass} htmlFor={ids.github}>
						GitHub (usuário)
					</label>
					<input className={inputClass} id={ids.github} type="text" {...register("githubUrl")} />
					{fieldError("githubUrl") ? <p className={errorClass}>{fieldError("githubUrl")}</p> : null}
				</div>
				<div>
					<label className={labelClass} htmlFor={ids.linkedin}>
						LinkedIn
					</label>
					<input
						className={inputClass}
						id={ids.linkedin}
						type="text"
						{...register("linkedinUrl")}
					/>
					{fieldError("linkedinUrl") ? (
						<p className={errorClass}>{fieldError("linkedinUrl")}</p>
					) : null}
				</div>
			</div>
		</div>
	);
}
