import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type ResetPasswordPageProps = {
	searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
	const params = await searchParams;
	const token = typeof params.token === "string" ? params.token : null;
	return <ResetPasswordForm token={token} />;
}
