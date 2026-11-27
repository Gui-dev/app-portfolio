import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ConnectedAccounts } from "@/components/settings/connected-accounts";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { PasswordForm } from "@/components/settings/password-form";
import { getSessionUser } from "@/lib/auth-session";
import { getProfileForUser } from "@/lib/db/queries";
import { env } from "@/lib/env";

export const metadata: Metadata = {
	title: "Configurações — FolioCraft",
};

export const dynamic = "force-dynamic";

const cardClass = "rounded-2xl border border-border bg-surface p-6";
const cardHeadingClass = "font-display text-lg font-bold text-fg";
const cardDescriptionClass = "mt-2 text-sm text-muted";
const focusRing =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export default async function SettingsPage() {
	const user = await getSessionUser();
	if (!user) {
		redirect("/login");
	}

	const profile = await getProfileForUser(user.id);
	const githubEnabled = Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);

	return (
		<main className="min-h-screen bg-bg px-6 py-10">
			<div className="mx-auto w-full max-w-3xl">
				<Link
					className={`inline-flex items-center gap-2 rounded-lg text-sm text-muted underline-offset-4 transition-colors hover:text-fg hover:underline ${focusRing}`}
					href="/dashboard"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Voltar ao editor
				</Link>

				<header className="mt-6">
					<h1 className="font-display text-3xl font-bold tracking-tight text-fg">
						Configurações da conta
					</h1>
					<p className="mt-2 text-sm text-muted">{user.email}</p>
				</header>

				{!profile ? (
					<p className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
						Você ainda não tem um perfil. Crie um no editor para poder excluir a conta.
					</p>
				) : null}

				<div className="mt-8 space-y-6">
					<section className={cardClass}>
						<h2 className={cardHeadingClass}>Senha</h2>
						<p className={cardDescriptionClass}>Altere a senha usada para entrar na sua conta.</p>
						<div className="mt-4">
							<PasswordForm />
						</div>
					</section>

					<section className={cardClass}>
						<h2 className={cardHeadingClass}>Contas conectadas</h2>
						<p className={cardDescriptionClass}>
							Gerencie as formas de login vinculadas à sua conta.
						</p>
						<div className="mt-4">
							<ConnectedAccounts githubEnabled={githubEnabled} />
						</div>
					</section>

					<DeleteAccountDialog slug={profile?.slug ?? ""} />
				</div>
			</div>
		</main>
	);
}
