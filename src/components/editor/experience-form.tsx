"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Plus } from "lucide-react";
import { type ReactElement, useEffect, useId } from "react";
import { type Resolver, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { BEGINNER_SAMPLES } from "@/lib/samples";
import type { ProfileDraft } from "@/lib/validation/profile";
import { experienceDraftSchema } from "@/lib/validation/profile";
import { BeginnerHelper } from "./beginner-helper";
import { RepeatableItem } from "./repeatable-item";

type Experience = ProfileDraft["experiences"][number];
type ExperienceKind = Experience["kind"];

const experienceFormItemSchema = experienceDraftSchema.extend({
	role: z.string().min(1, "Informe o cargo ou papel.").max(120, "Máximo de 120 caracteres."),
	company: z
		.string()
		.min(1, "Informe a empresa, projeto ou instituição.")
		.max(120, "Máximo de 120 caracteres."),
	period: z.string().min(1, "Informe o período.").max(120, "Máximo de 120 caracteres."),
	description: z
		.string()
		.min(1, "Informe as entregas e resultados.")
		.max(1000, "Máximo de 1000 caracteres."),
});

const experienceSectionSchema = z.object({
	experiences: z.array(experienceFormItemSchema).max(20, "Máximo de 20 experiências."),
});

type ExperienceSectionValues = z.infer<typeof experienceSectionSchema>;

const KIND_LABELS: Record<ExperienceKind, string> = {
	formal: "Emprego Formal",
	freelance: "Freelance",
	"open-source": "Open Source",
	academic: "Projeto Acadêmico",
	volunteer: "Voluntariado",
};

const KIND_ORDER: ExperienceKind[] = [
	"formal",
	"freelance",
	"open-source",
	"academic",
	"volunteer",
];

function withRenumberedSortOrder(experiences: Experience[]): Experience[] {
	return experiences.map((experience, index) => ({ ...experience, sortOrder: index }));
}

function formatBadge(index: number): string {
	return `#${String(index + 1).padStart(2, "0")}`;
}

export function ExperienceForm({
	defaultValues,
	onValuesChange,
	serverFieldErrors,
}: {
	defaultValues: Experience[];
	onValuesChange: (values: Experience[]) => void;
	serverFieldErrors?: Partial<Record<string, string>>;
}): ReactElement {
	const baseId = useId();
	const {
		control,
		register,
		setError,
		clearErrors,
		formState: { errors },
	} = useForm<ExperienceSectionValues>({
		resolver: zodResolver(experienceSectionSchema) as Resolver<ExperienceSectionValues>,
		defaultValues: { experiences: withRenumberedSortOrder(defaultValues) },
		mode: "onBlur",
	});
	const { fields, append, remove, move } = useFieldArray({ control, name: "experiences" });
	const values = useWatch({ control }) as ExperienceSectionValues;
	const experiences = withRenumberedSortOrder(values.experiences ?? []);

	useEffect(() => {
		onValuesChange(experiences);
	}, [experiences, onValuesChange]);

	useEffect(() => {
		if (!serverFieldErrors) return;
		for (const [field, message] of Object.entries(serverFieldErrors)) {
			if (!message) continue;
			setError(field as keyof ExperienceSectionValues, { type: "server", message });
		}
	}, [serverFieldErrors, setError]);

	const appendKind = (kind: ExperienceKind) => {
		append({
			kind,
			role: "",
			company: "",
			period: "",
			description: "",
			sortOrder: fields.length,
		});
	};

	const loadBeginnerSamples = () => {
		for (const sample of BEGINNER_SAMPLES) {
			append({ ...sample, sortOrder: 0 });
		}
	};

	const labelClass = "mb-1 block text-[11px] font-medium leading-[16.5px] text-fg-subtle";
	const fieldClass =
		"h-[34px] w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs leading-4 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3";
	const textareaClass =
		"min-h-[50px] w-full resize-none rounded-xl border border-border bg-bg px-3 py-2 text-xs leading-4 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3";
	const errorClass = "mt-1 text-[11px] leading-4 text-danger";

	return (
		<div className="flex w-full flex-col gap-5">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-col">
					<h2 className="font-display text-base font-bold leading-6 text-fg">
						Experiência & Vivência Prática
					</h2>
					<p className="text-xs leading-4 text-muted">
						Adicione empregos formais, freelas, open source ou projetos acadêmicos.
					</p>
				</div>

				<div className="inline-flex h-8 items-stretch">
					<button
						className="inline-flex h-8 w-[100px] items-center justify-center gap-1.5 rounded-l-xl rounded-r-none bg-accent-strong px-[14px] py-2 text-xs font-medium leading-4 text-white focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
						onClick={() => appendKind("formal")}
						type="button"
					>
						<Plus aria-hidden="true" className="size-3" />
						Adicionar
					</button>
					<div className="relative h-8 w-[31px]">
						<select
							aria-label="Adicionar experiência de outro tipo"
							className="h-8 w-[31px] appearance-none rounded-l-none rounded-r-xl border border-accent/40 bg-accent-deep text-transparent focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
							defaultValue=""
							onChange={(event) => {
								const next = event.target.value as ExperienceKind | "";
								if (!next) return;
								appendKind(next);
								event.currentTarget.value = "";
							}}
						>
							<option value="" />
							{KIND_ORDER.map((kind) => (
								<option key={kind} value={kind}>
									{KIND_LABELS[kind]}
								</option>
							))}
						</select>
						<ChevronDown
							aria-hidden="true"
							className="pointer-events-none absolute left-1/2 top-1/2 size-[10px] -translate-x-1/2 -translate-y-1/2 text-white"
						/>
					</div>
				</div>
			</header>

			<BeginnerHelper onLoad={loadBeginnerSamples} />

			<div className="flex flex-col gap-4">
				{fields.map((field, index) => {
					const ids = {
						role: `${baseId}-${field.id}-role`,
						company: `${baseId}-${field.id}-company`,
						period: `${baseId}-${field.id}-period`,
						description: `${baseId}-${field.id}-description`,
						kind: `${baseId}-${field.id}-kind`,
					};
					const badge = formatBadge(index);
					const itemErrors = errors.experiences?.[index];
					return (
						<RepeatableItem
							badge={badge}
							canMoveDown={index < fields.length - 1}
							canMoveUp={index > 0}
							key={field.id}
							onMoveDown={() => move(index, index + 1)}
							onMoveUp={() => move(index, index - 1)}
							onRemove={() => remove(index)}
							removeLabel={`Remover experiência ${badge.slice(1)}`}
							title={`Experiência ${badge}`}
						>
							<div className="flex flex-wrap items-center gap-2">
								<div className="relative w-full sm:w-[205px]">
									<label className="sr-only" htmlFor={ids.kind}>
										Tipo da experiência {index + 1}
									</label>
									<select
										aria-label={`Tipo da experiência ${index + 1}`}
										className="h-[26px] w-full appearance-none rounded-lg border border-border-strong bg-bg px-[14px] pr-[26px] py-1 text-[11px] font-medium leading-[14px] text-fg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3"
										id={ids.kind}
										{...register(`experiences.${index}.kind` as const)}
									>
										{KIND_ORDER.map((kind) => (
											<option key={kind} value={kind}>
												{KIND_LABELS[kind]}
											</option>
										))}
									</select>
									<ChevronDown
										aria-hidden="true"
										className="pointer-events-none absolute right-2 top-1/2 size-[10px] -translate-y-1/2 text-fg-soft"
									/>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label className={labelClass} htmlFor={ids.role}>
										Cargo ou Papel Exercido
									</label>
									<input
										className={fieldClass}
										id={ids.role}
										type="text"
										{...register(`experiences.${index}.role` as const, {
											onChange: () => clearErrors(`experiences.${index}.role`),
										})}
									/>
									{itemErrors?.role?.message ? (
										<p className={errorClass}>{itemErrors.role.message}</p>
									) : null}
								</div>
								<div>
									<label className={labelClass} htmlFor={ids.company}>
										Empresa, Projeto ou Instituição
									</label>
									<input
										className={fieldClass}
										id={ids.company}
										type="text"
										{...register(`experiences.${index}.company` as const)}
									/>
									{itemErrors?.company?.message ? (
										<p className={errorClass}>{itemErrors.company.message}</p>
									) : null}
								</div>
							</div>

							<div>
								<label className={labelClass} htmlFor={ids.period}>
									Período
								</label>
								<input
									className={fieldClass}
									id={ids.period}
									type="text"
									{...register(`experiences.${index}.period` as const)}
								/>
								{itemErrors?.period?.message ? (
									<p className={errorClass}>{itemErrors.period.message}</p>
								) : null}
							</div>

							<div>
								<label className={labelClass} htmlFor={ids.description}>
									Entregas e Resultados (Foque no impacto técnico)
								</label>
								<textarea
									className={textareaClass}
									id={ids.description}
									{...register(`experiences.${index}.description` as const)}
								/>
								{itemErrors?.description?.message ? (
									<p className={errorClass}>{itemErrors.description.message}</p>
								) : null}
							</div>
							<input
								type="hidden"
								{...register(`experiences.${index}.sortOrder` as const, { valueAsNumber: true })}
							/>
						</RepeatableItem>
					);
				})}
			</div>
		</div>
	);
}
