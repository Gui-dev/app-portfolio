"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { type ReactElement, useEffect, useId, useState } from "react";
import { type Resolver, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import type { ProfileDraft } from "@/lib/validation/profile";
import { projectDraftSchema } from "@/lib/validation/profile";
import { RepeatableItem } from "./repeatable-item";

type Project = ProfileDraft["projects"][number];

const projectsSectionSchema = z.object({
	projects: z.array(projectDraftSchema).max(20, "Máximo de 20 projetos."),
});

type ProjectsSectionValues = z.infer<typeof projectsSectionSchema>;

function withRenumberedSortOrder(projects: Project[]): Project[] {
	return projects.map((project, index) => ({ ...project, sortOrder: index }));
}

function tagsToText(tags: string[]): string {
	return tags.join(", ");
}

function textToTags(text: string): string[] {
	return text
		.split(",")
		.map((part) => part.trim())
		.filter((part) => part.length > 0);
}

function formatNumber(index: number): string {
	return String(index + 1).padStart(2, "0");
}

export function ProjectsForm({
	defaultValues,
	onValuesChange,
	serverFieldErrors,
}: {
	defaultValues: Project[];
	onValuesChange: (values: Project[]) => void;
	serverFieldErrors?: Partial<Record<string, string>>;
}): ReactElement {
	const baseId = useId();
	const [tagsText, setTagsText] = useState<Record<string, string>>(() => ({}));
	const {
		control,
		register,
		setValue,
		setError,
		formState: { errors },
	} = useForm<ProjectsSectionValues>({
		resolver: zodResolver(projectsSectionSchema) as Resolver<ProjectsSectionValues>,
		defaultValues: { projects: withRenumberedSortOrder(defaultValues) },
		mode: "onBlur",
	});
	const { fields, append, remove, move } = useFieldArray({ control, name: "projects" });
	const values = useWatch({ control }) as ProjectsSectionValues;
	const projects = withRenumberedSortOrder(values.projects ?? []);

	useEffect(() => {
		onValuesChange(projects);
	}, [projects, onValuesChange]);

	useEffect(() => {
		if (!serverFieldErrors) return;
		for (const [field, message] of Object.entries(serverFieldErrors)) {
			if (!message) continue;
			setError(field as keyof ProjectsSectionValues, { type: "server", message });
		}
	}, [serverFieldErrors, setError]);

	const labelClass = "mb-1 block text-[11px] font-medium leading-[16.5px] text-fg-subtle";
	const fieldClass =
		"h-[34px] w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs leading-4 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3";
	const textareaClass =
		"min-h-[50px] w-full resize-none rounded-xl border border-border bg-bg px-3 py-2 text-xs leading-4 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3";
	const errorClass = "mt-1 text-[11px] leading-4 text-danger";

	return (
		<div className="flex w-full flex-col gap-4">
			<header className="flex h-10 items-center justify-between">
				<div className="flex flex-col">
					<h2 className="font-display text-base font-bold leading-6 text-fg">
						Projetos em Destaque
					</h2>
					<p className="text-xs leading-4 text-muted">
						Mostre seus melhores trabalhos com tags de tecnologias e links.
					</p>
				</div>
				<button
					className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl bg-accent-strong px-[14px] py-2 text-xs font-medium leading-4 text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
					onClick={() =>
						append({
							name: "",
							description: "",
							repoUrl: "",
							demoUrl: "",
							tags: [],
							sortOrder: fields.length,
						})
					}
					type="button"
				>
					<Plus aria-hidden="true" className="size-3" />
					Novo Projeto
				</button>
			</header>

			<div className="flex flex-col gap-4">
				{fields.map((field, index) => {
					const ids = {
						name: `${baseId}-${field.id}-name`,
						technologies: `${baseId}-${field.id}-technologies`,
						description: `${baseId}-${field.id}-description`,
						repo: `${baseId}-${field.id}-repo`,
						demo: `${baseId}-${field.id}-demo`,
					};
					const number = formatNumber(index);
					const itemErrors = errors.projects?.[index];
					const tagValue = tagsText[field.id] ?? tagsToText(projects[index]?.tags ?? []);
					return (
						<RepeatableItem
							badge={`Projeto #${number}`}
							canMoveDown={index < fields.length - 1}
							canMoveUp={index > 0}
							key={field.id}
							onMoveDown={() => move(index, index + 1)}
							onMoveUp={() => move(index, index - 1)}
							onRemove={() => remove(index)}
							removeLabel={`Remover projeto ${number}`}
							title={`Projeto #${number}`}
						>
							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label className={labelClass} htmlFor={ids.name}>
										Nome do Projeto
									</label>
									<input
										className={fieldClass}
										id={ids.name}
										type="text"
										{...register(`projects.${index}.name` as const)}
									/>
									{itemErrors?.name?.message ? (
										<p className={errorClass}>{itemErrors.name.message}</p>
									) : null}
								</div>
								<div>
									<label className={labelClass} htmlFor={ids.technologies}>
										Tecnologias (separadas por vírgula)
									</label>
									<input
										className={fieldClass}
										id={ids.technologies}
										onChange={(event) => {
											const text = event.target.value;
											setTagsText((current) => ({ ...current, [field.id]: text }));
											setValue(`projects.${index}.tags` as const, textToTags(text), {
												shouldDirty: true,
												shouldTouch: true,
											});
										}}
										type="text"
										value={tagValue}
									/>
									{itemErrors?.tags?.message ? (
										<p className={errorClass}>{itemErrors.tags.message}</p>
									) : null}
								</div>
							</div>

							<div>
								<label className={labelClass} htmlFor={ids.description}>
									Descrição curta
								</label>
								<textarea
									className={textareaClass}
									id={ids.description}
									{...register(`projects.${index}.description` as const)}
								/>
								{itemErrors?.description?.message ? (
									<p className={errorClass}>{itemErrors.description.message}</p>
								) : null}
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label className={labelClass} htmlFor={ids.repo}>
										Link Repositório
									</label>
									<input
										className={fieldClass}
										id={ids.repo}
										type="text"
										{...register(`projects.${index}.repoUrl` as const)}
									/>
									{itemErrors?.repoUrl?.message ? (
										<p className={errorClass}>{itemErrors.repoUrl.message}</p>
									) : null}
								</div>
								<div>
									<label className={labelClass} htmlFor={ids.demo}>
										Link Demo Ao Vivo
									</label>
									<input
										className={fieldClass}
										id={ids.demo}
										type="text"
										{...register(`projects.${index}.demoUrl` as const)}
									/>
									{itemErrors?.demoUrl?.message ? (
										<p className={errorClass}>{itemErrors.demoUrl.message}</p>
									) : null}
								</div>
							</div>
							<input
								type="hidden"
								{...register(`projects.${index}.sortOrder` as const, { valueAsNumber: true })}
							/>
						</RepeatableItem>
					);
				})}
			</div>
		</div>
	);
}
