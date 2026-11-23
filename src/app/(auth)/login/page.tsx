import { LoginForm } from "@/components/auth/login-form";
import { env } from "@/lib/env";

export default function LoginPage() {
	const githubEnabled = Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
	return <LoginForm githubEnabled={githubEnabled} />;
}
